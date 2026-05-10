import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { processProduct, type ShopifyProduct } from '../../../lib/pipeline';

const DEMO_PRODUCT: ShopifyProduct = {
  id: 1,
  title: 'Nike Free Metcon 6',
  body_html:
    '<p>Built for the toughest training sessions. The Nike Free Metcon 6 combines flexible Free sole technology with a stable, durable upper for ultimate gym performance.</p>',
  vendor: 'Demo Store',
  variants: [{ price: '130.00' }],
  images: [], // filled in at request time using the public tunnel URL
};

const DEMO_IMAGE_FILES = ['nike1.jpg', 'nike2.jpg', 'nike3.jpg', 'nike4.png', 'nike5.jpg'];

async function resolveDemoImageSources(): Promise<{ geminiImage: string; shotstackImageUrls: string[] }> {
  // Gemini reads from local filesystem — works without a tunnel
  const buffer = await fs.readFile(path.join(process.cwd(), 'public', 'nike1.jpg'));
  const geminiImage = `data:image/jpeg;base64,${buffer.toString('base64')}`;

  // Shotstack needs public HTTPS URLs — it fetches images from its own servers
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  ).replace(/\/$/, '');

  if (!baseUrl) {
    throw new Error(
      'Set NEXT_PUBLIC_APP_URL to a public URL so Shotstack can fetch images. ' +
        'Run: cloudflared tunnel --url http://localhost:3000 and paste the URL in .env.local'
    );
  }

  try {
    const check = await fetch(`${baseUrl}/nike1.jpg`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });
    if (!check.ok) throw new Error(`HTTP ${check.status}`);
  } catch (e) {
    throw new Error(
      `Public URL unreachable (${baseUrl}): ${e instanceof Error ? e.message : e}. ` +
        'Restart your tunnel and update NEXT_PUBLIC_APP_URL in .env.local'
    );
  }

  return {
    geminiImage,
    shotstackImageUrls: DEMO_IMAGE_FILES.map((f) => `${baseUrl}/${f}`),
  };
}

export async function POST(req: NextRequest) {
  let geminiKey: string | undefined;
  try {
    const body = await req.json();
    geminiKey = body?.geminiKey;
  } catch {
    // body is optional
  }
  geminiKey = geminiKey || process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return NextResponse.json(
      { error: 'Gemini API key required. Provide it in the request body as { geminiKey } or set GEMINI_API_KEY env var.' },
      { status: 400 }
    );
  }

  try {
    const { geminiImage, shotstackImageUrls } = await resolveDemoImageSources();

    const product: ShopifyProduct = {
      ...DEMO_PRODUCT,
      images: shotstackImageUrls.map((src) => ({ src })),
    };

    // Demo flow does not email — UI polls /api/status/[renderId] for each render
    const { renderIds } = await processProduct(product, {
      geminiKey,
      geminiImageOverride: geminiImage,
    });

    return NextResponse.json({ success: true, renderIds });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
