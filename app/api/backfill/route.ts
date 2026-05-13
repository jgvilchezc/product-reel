import { NextRequest, NextResponse } from 'next/server';
import { processProduct, type ShopifyProduct } from '../../../lib/pipeline';

// Backfill an existing Shopify catalog into ProductReel videos. Unlike /api/webhook
// (which fires per new product-create event), this enumerates the storefront's public
// products.json feed and renders the first N products in one call.
//
// Hard cap: 5 products per invocation. Reasons:
//   - Each processProduct call is ~10-20s (analyzeProduct + Nano Banana on 5 images + submit).
//   - 5 in parallel ≈ 15-25s, comfortable inside Vercel Hobby's 60s ceiling.
//   - More than 5 would either need a queue (Upstash QStash) or Pro plan (300s).
//
// Limitations the UI MUST surface:
//   - Storefront JSON has to be enabled. Kotn/Liquid IV in our stress test returned
//     HTML or null products — those stores need the Admin API + OAuth route, not this.
//   - Variant-specific pricing is NOT respected. We use variants[0].price.
//   - Per-product failures don't kill the batch (Promise.allSettled).
export const maxDuration = 60;

const MAX_PRODUCTS = 5;

interface ShopifyStorefrontProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  variants: Array<{ id: number; price: string }>;
  images: Array<{ src: string }>;
}

interface ShopifyProductsJson {
  products: ShopifyStorefrontProduct[];
}

function parseStoreUrl(rawUrl: string): { origin: string; jsonUrl: string } {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }
  if (!/^https?:$/.test(url.protocol)) {
    throw new Error('URL must be http or https');
  }
  return { origin: url.origin, jsonUrl: `${url.origin}/products.json?limit=${MAX_PRODUCTS}` };
}

async function fetchCatalog(jsonUrl: string): Promise<ShopifyStorefrontProduct[]> {
  const res = await fetch(jsonUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(
      `Catalog fetch failed (${res.status}). This store may have disabled its public ` +
      `storefront products.json (some stores block it for bot protection). The Admin ` +
      `API + OAuth route is needed for these — coming in a future sprint.`
    );
  }
  let data: ShopifyProductsJson;
  try {
    data = (await res.json()) as ShopifyProductsJson;
  } catch {
    throw new Error(
      `Catalog endpoint returned HTML instead of JSON (probably an anti-bot page). ` +
      `This store needs the Admin API + OAuth route, which is in a future sprint.`
    );
  }
  return data.products || [];
}

interface BackfillItem {
  title: string;
  handle: string;
  renderId: string;
  productUrl: string;
}

export async function POST(req: NextRequest) {
  let body: { storeUrl?: string; limit?: number; notifyEmail?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });
  }

  if (!body.storeUrl || typeof body.storeUrl !== 'string') {
    return NextResponse.json(
      { error: 'storeUrl is required (e.g. "https://drinkolipop.com")' },
      { status: 400 }
    );
  }

  // When the caller passes notifyEmail, each render's Shotstack callback points at
  // /api/shotstack-callback so the merchant gets one email per product as they finish.
  // The UI keeps its /api/status polling for live progress, but email is the durable
  // delivery channel — close the tab and the videos still arrive in the inbox.
  const originHeader = req.headers.get('x-forwarded-host');
  const callbackOrigin = originHeader ? `https://${originHeader}` : req.nextUrl.origin;
  const notifyEmail = typeof body.notifyEmail === 'string' && body.notifyEmail.includes('@')
    ? body.notifyEmail
    : undefined;

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not configured on server.' },
      { status: 500 }
    );
  }

  const limit = Math.min(typeof body.limit === 'number' ? body.limit : MAX_PRODUCTS, MAX_PRODUCTS);

  try {
    const { origin, jsonUrl } = parseStoreUrl(body.storeUrl);
    const products = await fetchCatalog(jsonUrl);

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products found in this store catalog.' },
        { status: 404 }
      );
    }

    const slice = products.slice(0, limit);

    // Submit all in parallel. Per-product failures are isolated — a single product
    // with all-avif images or other pipeline blockers will fail with a clear reason
    // while the others still render.
    const results = await Promise.allSettled<BackfillItem>(
      slice.map(async (p): Promise<BackfillItem> => {
        const shopifyProduct: ShopifyProduct = {
          id: p.id,
          title: p.title,
          body_html: p.body_html || '',
          vendor: p.vendor || 'Your Store',
          variants: p.variants?.length ? [{ price: p.variants[0].price }] : [{ price: '0' }],
          images: p.images || [],
        };
        // Per-product callback URL when an email was supplied. The Shotstack callback
        // handler reads merchant context from the query string, so each render gets its
        // own subject line ("Your video is ready — <product>") without any shared state.
        const productTitle = (p.title || 'your product').slice(0, 80);
        const brandName = (p.vendor || 'Your Store').slice(0, 40);
        const callbackUrl = notifyEmail
          ? `${callbackOrigin}/api/shotstack-callback?email=${encodeURIComponent(notifyEmail)}&product=${encodeURIComponent(productTitle)}&brand=${encodeURIComponent(brandName)}`
          : undefined;
        const { renderIds } = await processProduct(shopifyProduct, {
          geminiKey,
          // notifyEmail is intentionally NOT passed here — when callbackUrl is set, the
          // pipeline skips its internal pollAndEmail to avoid double-sends. Shotstack will
          // POST the callback when the render terminates and the handler emails from there.
          callbackUrl,
        });
        return {
          title: p.title,
          handle: p.handle,
          renderId: renderIds[0],
          productUrl: `${origin}/products/${p.handle}`,
        };
      })
    );

    const succeeded = results
      .filter((r): r is PromiseFulfilledResult<BackfillItem> => r.status === 'fulfilled')
      .map((r) => r.value);
    const failed = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => ({
        reason: r.reason instanceof Error ? r.reason.message : String(r.reason),
      }));

    return NextResponse.json({
      success: succeeded.length > 0,
      store: origin,
      totalInCatalog: products.length,
      submitted: succeeded.length,
      failed: failed.length,
      products: succeeded,
      errors: failed,
      emailQueued: !!notifyEmail,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
