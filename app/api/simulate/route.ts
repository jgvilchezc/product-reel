import { NextRequest, NextResponse } from 'next/server';
import { runPipeline, type ProductInput } from '../../../lib/pipeline';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const DEMO_PRODUCT: ProductInput = {
  title: 'Nike Free Metcon 6',
  body_html:
    'Built for the toughest training sessions. The Nike Free Metcon 6 combines flexible Free sole technology with a stable, durable upper for ultimate gym performance.',
  price: '130',
  images: [
    `${BASE_URL}/NIKE+FREE+METCON+6.jpg`,
    `${BASE_URL}/nike2.jpeg`,
    `${BASE_URL}/nike3.jpeg`,
  ],
};

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
    const renderId = await runPipeline(DEMO_PRODUCT, geminiKey);
    return NextResponse.json({ success: true, renderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
