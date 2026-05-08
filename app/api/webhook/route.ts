import { NextRequest, NextResponse } from 'next/server';
import { runPipeline, type ProductInput } from '../../../lib/pipeline';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const product: ProductInput = {
    title: (body.title as string) ?? 'Product',
    body_html: (body.body_html as string) ?? '',
    price: extractPrice(body),
    images: extractImages(body),
  };

  if (product.images.length === 0) {
    return NextResponse.json({ error: 'No product images found' }, { status: 400 });
  }

  try {
    const renderId = await runPipeline(product, geminiKey);
    return NextResponse.json({ success: true, renderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractPrice(body: Record<string, unknown>): string {
  const variants = body.variants as Array<{ price?: string }> | undefined;
  return variants?.[0]?.price ?? (body.price as string) ?? '0';
}

function extractImages(body: Record<string, unknown>): string[] {
  const images = body.images as Array<{ src?: string }> | undefined;
  if (Array.isArray(images)) return images.map((i) => i.src).filter(Boolean) as string[];
  return [];
}
