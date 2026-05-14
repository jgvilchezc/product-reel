import { NextRequest, NextResponse } from 'next/server';
import { processProduct, type ShopifyProduct } from '../../../lib/pipeline';
import { recordRender, extractShopDomain } from '../../../lib/metrics';

// Scrapes a Shopify product by URL using the public `.json` endpoint that every storefront
// exposes at `<base>/products/<handle>.json` — no Admin API or OAuth required. The merchant
// only needs to share a product URL.
//
// Input  : { productUrl: string, geminiKey?: string, notifyEmail?: string, enhance?: boolean }
// Output : { success: true, renderIds: string[], product: { title, vendor, price, imageCount, sourceUrl } }
//
// Email delivery: when notifyEmail is supplied we wire Shotstack's callback to
// /api/shotstack-callback with the merchant context on the query string. Shotstack pings
// it when the render finishes (~30-60s later) and that handler sends the Resend email.
// This is what lets a reviewer (Derk) test the demo in prod without sitting on the page —
// the MP4 lands in their inbox the moment the render completes. We don't await it here;
// this lambda returns the renderId as soon as the submit is in.
//
// Limitations: stores that have explicitly disabled the storefront product JSON (rare) will
// 404. Variant-specific pricing requires `?variant=<id>` in the URL — we honor it if present.

interface ShopifyProductJson {
  product: {
    id: number;
    title: string;
    handle: string;
    body_html: string;
    vendor: string;
    product_type?: string;
    tags?: string;
    variants: Array<{ id: number; price: string; compare_at_price?: string | null }>;
    images: Array<{ src: string }>;
  };
}

function parseShopifyProductUrl(rawUrl: string): { jsonUrl: string; variantId?: string } {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }
  if (!/^https?:$/.test(url.protocol)) {
    throw new Error('URL must be http or https');
  }
  const match = url.pathname.match(/\/products\/([^/?#]+)/);
  if (!match) {
    throw new Error(
      `URL does not look like a Shopify product page (expected /products/<handle> in the path). Got: ${url.pathname}`
    );
  }
  const handle = match[1];
  const jsonUrl = `${url.origin}/products/${handle}.json`;
  const variantId = url.searchParams.get('variant') ?? undefined;
  return { jsonUrl, variantId };
}

async function fetchShopifyProduct(jsonUrl: string): Promise<ShopifyProductJson['product']> {
  const res = await fetch(jsonUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(
      `Shopify product fetch failed (${res.status}). The store may have disabled storefront JSON, or the product handle is wrong.`
    );
  }
  const data = (await res.json()) as ShopifyProductJson;
  if (!data.product) {
    throw new Error('Response did not contain a "product" object.');
  }
  return data.product;
}

function pickVariantPrice(
  variants: ShopifyProductJson['product']['variants'],
  variantId?: string
): string {
  if (variantId) {
    const found = variants.find((v) => String(v.id) === variantId);
    if (found?.price) return found.price;
  }
  return variants[0]?.price ?? '0';
}

export async function POST(req: NextRequest) {
  let body: {
    productUrl?: string;
    geminiKey?: string;
    notifyEmail?: string;
    enhance?: boolean;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });
  }

  // Accept ?enhance=true on the query string too so the outreach pre-render script
  // can flip it without rebuilding the JSON body.
  const enhanceQs = req.nextUrl.searchParams.get('enhance');
  const enhanceImagesOption =
    body.enhance === true || enhanceQs === 'true' || enhanceQs === '1';

  if (!body.productUrl || typeof body.productUrl !== 'string') {
    return NextResponse.json(
      { error: 'productUrl is required (e.g. "https://shop.com/products/blue-shoes")' },
      { status: 400 }
    );
  }

  // Validate notifyEmail when supplied. We're not running an RFC-strict parser
  // here — just enough shape checking to reject the obvious garbage that would
  // hit Resend and bounce 60 seconds later with no UI feedback. Letting an
  // angle-bracketed XSS payload through also makes it into the email subject,
  // which we'd rather not.
  if (body.notifyEmail !== undefined && body.notifyEmail !== '') {
    const valid =
      typeof body.notifyEmail === 'string' &&
      body.notifyEmail.length <= 254 &&
      body.notifyEmail.includes('@') &&
      !/[<>"']/.test(body.notifyEmail);
    if (!valid) {
      return NextResponse.json(
        { error: 'notifyEmail must be a valid email address (no angle brackets/quotes, max 254 chars).' },
        { status: 400 }
      );
    }
  }

  const geminiKey = body.geminiKey || process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json(
      { error: 'Gemini API key required. Pass { geminiKey } in body or set GEMINI_API_KEY.' },
      { status: 400 }
    );
  }

  try {
    const { jsonUrl, variantId } = parseShopifyProductUrl(body.productUrl);
    const raw = await fetchShopifyProduct(jsonUrl);
    const price = pickVariantPrice(raw.variants, variantId);

    const product: ShopifyProduct = {
      id: raw.id,
      title: raw.title,
      body_html: raw.body_html,
      vendor: raw.vendor,
      variants: [{ price }],
      images: raw.images,
    };

    if (!product.images.length) {
      return NextResponse.json(
        { error: 'Scraped product has no images. Cannot render a video.' },
        { status: 422 }
      );
    }

    // Build callback URL only when a notifyEmail was given. Without an email there's no
    // recipient, so /api/shotstack-callback would skip the send anyway — saves Shotstack
    // a useless POST. Origin honors x-forwarded-host so it works behind Vercel's proxy
    // and through cloudflared tunnels in dev.
    const originHeader = req.headers.get('x-forwarded-host');
    const origin = originHeader ? `https://${originHeader}` : req.nextUrl.origin;
    const productTitle = (product.title || 'your product').slice(0, 80);
    const callbackUrl = body.notifyEmail
      ? `${origin}/api/shotstack-callback?email=${encodeURIComponent(body.notifyEmail)}&product=${encodeURIComponent(productTitle)}&brand=${encodeURIComponent(product.vendor || 'your store')}`
      : undefined;

    const { renderIds } = await processProduct(product, {
      geminiKey,
      notifyEmail: body.notifyEmail,
      enhanceImagesOption,
      callbackUrl,
    });

    // Record the render event for the north-star metric. Best-effort: never
    // block the response on KV. extractShopDomain handles both URL and bare-host.
    const shopDomain = extractShopDomain(body.productUrl);
    await Promise.all(
      renderIds.map((rid) =>
        recordRender({ shopDomain, renderId: rid, source: 'scrape', status: 'submitted' })
      )
    );

    return NextResponse.json({
      success: true,
      renderIds,
      emailQueued: !!callbackUrl,
      product: {
        title: product.title,
        vendor: product.vendor,
        price,
        imageCount: product.images.length,
        sourceUrl: jsonUrl,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
