import { NextRequest, NextResponse } from 'next/server';
import { processProduct, type ShopifyProduct } from '../../../lib/pipeline';

// Scrapes a Shopify product by URL using the public `.json` endpoint that every storefront
// exposes at `<base>/products/<handle>.json` — no Admin API or OAuth required. The merchant
// only needs to share a product URL.
//
// Input  : { productUrl: string, geminiKey?: string, notifyEmail?: string }
// Output : { success: true, renderIds: string[], product: { title, vendor, price, imageCount, sourceUrl } }
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

    const { renderIds } = await processProduct(product, {
      geminiKey,
      notifyEmail: body.notifyEmail,
      enhanceImagesOption,
    });

    return NextResponse.json({
      success: true,
      renderIds,
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
