import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { analyzeProduct, type ProductInput } from '../../../lib/gemini';
import { buildRenderPayload, buildBoldEnergyPayload, buildCleanMinimalPayload, submitRender } from '../../../lib/shotstack';

const DEMO_META = {
  title: 'Nike Free Metcon 6',
  body_html:
    'Built for the toughest training sessions. The Nike Free Metcon 6 combines flexible Free sole technology with a stable, durable upper for ultimate gym performance.',
  price: '130',
};

async function resolveImageSources(): Promise<{ geminiImage: string; shotstackImages: string[] }> {
  // Gemini reads from filesystem — works locally without a tunnel
  const buffer = await fs.readFile(path.join(process.cwd(), 'public', 'nike1.jpg'));
  const geminiImage = `data:image/jpeg;base64,${buffer.toString('base64')}`;

  // Shotstack needs public HTTPS URLs — it fetches images from its own servers during render
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  ).replace(/\/$/, '');

  if (!baseUrl) {
    throw new Error(
      'Set NEXT_PUBLIC_APP_URL to a public URL so Shotstack can fetch images. ' +
      'Run: cloudflare tunnel --url http://localhost:3000 and paste the URL in .env.local'
    );
  }

  // Quick reachability check (3s timeout)
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
    shotstackImages: ['nike1.jpg', 'nike2.jpeg', 'nike3.jpeg', 'nike4.jpeg', 'nike5.jpeg'].map(
      (f) => `${baseUrl}/${f}`
    ),
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
    const { geminiImage, shotstackImages } = await resolveImageSources();

    const analysis = await analyzeProduct(
      { ...DEMO_META, images: [geminiImage] },
      geminiKey
    );

    const productInput = { ...DEMO_META, images: shotstackImages } as ProductInput;
    const [id0, id1, id2] = await Promise.all([
      submitRender(buildRenderPayload(productInput, analysis)),
      submitRender(buildBoldEnergyPayload(productInput, analysis)),
      submitRender(buildCleanMinimalPayload(productInput, analysis)),
    ]);
    return NextResponse.json({ success: true, renderIds: [id0, id1, id2] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
