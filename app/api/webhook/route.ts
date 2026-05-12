import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { processProduct, type ShopifyProduct } from '../../../lib/pipeline';

// Vercel kills serverless function instances right after the response is sent, which
// would terminate the fire-and-forget pollAndEmail promise before it can finish. Bumping
// maxDuration + using `after()` keeps the function alive long enough for Gemini analysis
// + Shotstack render polling + Resend email send to complete (~30-45s typical).
export const maxDuration = 60;

function validateShopifyWebhook(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[webhook] SHOPIFY_WEBHOOK_SECRET not set — skipping HMAC validation (dev mode)');
    return true;
  }
  if (!hmacHeader) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(hmacHeader);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmac = req.headers.get('x-shopify-hmac-sha256');
  const testMode = req.headers.get('x-test-mode') === '1';
  // The dev UI may pass its own Gemini key when GEMINI_API_KEY is unset on the server
  const headerGeminiKey = req.headers.get('x-gemini-key') || undefined;

  if (!testMode && !validateShopifyWebhook(rawBody, hmac)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let product: ShopifyProduct;
  try {
    product = JSON.parse(rawBody) as ShopifyProduct;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const geminiKey = headerGeminiKey || process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    if (testMode) {
      return NextResponse.json(
        { error: 'Gemini API key required. Pass it via x-gemini-key header or set GEMINI_API_KEY env var.' },
        { status: 400 }
      );
    }
    console.error('[webhook] GEMINI_API_KEY not configured — cannot process product', product.id);
    return new NextResponse('OK (misconfigured)', { status: 200 });
  }

  // MERCHANT_EMAIL falls back to the project owner's email when not set in Vercel env.
  // (Vercel UI has been intermittently dropping the value on save; this guarantees the
  // pollAndEmail task always runs in production.)
  const notifyEmail = process.env.MERCHANT_EMAIL || 'josegabrielvilchezc@gmail.com';

  // Test mode: await the submit phase so the dev UI can see renderIds & poll status.
  // Email task is still fire-and-forget inside processProduct() when notifyEmail is set.
  if (testMode) {
    try {
      const { renderIds, productInput, brandName } = await processProduct(product, {
        geminiKey,
        notifyEmail,
      });
      return NextResponse.json({ ok: true, renderIds, productInput, brandName, emailQueued: !!notifyEmail });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Production Shopify path: respond within the 5-second deadline, run everything in the background.
  if (!notifyEmail) {
    console.warn('[webhook] MERCHANT_EMAIL not set — videos will be rendered but not emailed');
  }
  // `after()` defers this work until the 200 OK has been sent to Shopify (inside the 5s
  // SLA), and Vercel keeps the function alive up to `maxDuration` so the full Gemini +
  // Shotstack + pollAndEmail chain can finish. We must explicitly await the
  // `pollAndEmailPromise` — Vercel only tracks the top-level callback, so leaving
  // pollAndEmail as a nested void promise lets it die when processProduct resolves.
  after(async () => {
    try {
      // Nano Banana enhancement DISABLED on webhook flow for email reliability.
      // Background: we briefly enabled it (May 12 commit 702d66b) thinking the
      // latency budget fit after dropping the source-image cap to 5. It didn't,
      // but the bug was masked because uploadImageToIngest was broken and silently
      // fell back to original URLs in ~0.5s. Once the Ingest fix landed (commit
      // a599014), Nano Banana actually started working — and added 15-25s to the
      // pre-poll phase, pushing total runtime past Vercel Hobby's 60s ceiling.
      // The Lavadora render that triggered this revert: completed in Shotstack
      // but the lambda died before pollAndEmail saw "done" and could send the
      // merchant their email. (User-flagged May 12.)
      //
      // The webhook prioritizes "render submitted + merchant emailed" reliability
      // over per-image enhancement. Users who want Nano Banana can trigger it
      // explicitly via /api/scrape?enhance=true where the 60s ceiling is more
      // forgiving (no pollAndEmail latency to contend with).
      const { renderIds, pollAndEmailPromise } = await processProduct(product, {
        geminiKey,
        notifyEmail,
      });
      console.log(`[webhook] product ${product.id} renders submitted:`, renderIds);
      if (pollAndEmailPromise) {
        await pollAndEmailPromise;
        console.log(`[webhook] product ${product.id} email pipeline complete`);
      }
    } catch (err) {
      console.error(`[webhook] product ${product.id} pipeline failed:`, err);
    }
  });

  return new NextResponse('OK', { status: 200 });
}
