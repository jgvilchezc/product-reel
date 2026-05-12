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

  // Test mode: same pipeline as production but synchronous so the dev tester sees
  // renderIds immediately. Mirrors the production flow's Nano Banana + callback wiring
  // so what gets tested here is what ships.
  if (testMode) {
    try {
      const originHeader = req.headers.get('x-forwarded-host');
      const origin = originHeader ? `https://${originHeader}` : req.nextUrl.origin;
      const productTitle = product.title?.slice(0, 80) || 'your product';
      const brandName = product.vendor?.slice(0, 40) || 'your store';
      const callbackUrl = notifyEmail
        ? `${origin}/api/shotstack-callback?email=${encodeURIComponent(notifyEmail)}&product=${encodeURIComponent(productTitle)}&brand=${encodeURIComponent(brandName)}`
        : undefined;
      const result = await processProduct(product, {
        geminiKey,
        notifyEmail,
        enhanceImagesOption: true,
        callbackUrl,
      });
      return NextResponse.json({
        ok: true,
        renderIds: result.renderIds,
        productInput: result.productInput,
        brandName: result.brandName,
        emailQueued: !!notifyEmail,
        callbackUrl,
      });
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
      // Nano Banana enabled — but we DON'T pollAndEmail inline. The pipeline submits
      // the render with a `callback` URL pointing to /api/shotstack-callback; Shotstack
      // POSTs there when the render completes, and THAT handler sends the email. This
      // decouples the merchant email from this lambda's 60s budget, which was getting
      // blown by Gemini (10s) + Nano Banana enhance (20s) + render poll (30-50s) chained
      // serially. (Lavadora regression May 12.)
      //
      // Merchant context (email/product/brand) rides on the callback URL as query
      // params so the callback handler can reconstruct it without state.
      const origin = req.headers.get('x-forwarded-host')
        ? `https://${req.headers.get('x-forwarded-host')}`
        : req.nextUrl.origin;
      const productTitle = product.title?.slice(0, 80) || 'your product';
      const brandName = product.vendor?.slice(0, 40) || 'your store';
      const callbackUrl = `${origin}/api/shotstack-callback?email=${encodeURIComponent(notifyEmail)}&product=${encodeURIComponent(productTitle)}&brand=${encodeURIComponent(brandName)}`;
      const { renderIds } = await processProduct(product, {
        geminiKey,
        notifyEmail,
        enhanceImagesOption: true,
        callbackUrl,
      });
      console.log(`[webhook] product ${product.id} renders submitted (callback wired):`, renderIds);
      // No await on pollAndEmail here — Shotstack will POST /api/shotstack-callback
      // when the render terminates and that handler sends the merchant email.
    } catch (err) {
      console.error(`[webhook] product ${product.id} pipeline failed:`, err);
    }
  });

  return new NextResponse('OK', { status: 200 });
}
