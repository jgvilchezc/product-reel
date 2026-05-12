import { NextRequest, NextResponse } from 'next/server';
import { enhanceImages } from '../../../lib/imageEnhance';
import type { ProductCategory } from '../../../lib/gemini';

// Diagnostic endpoint that exposes Nano Banana enhancement on individual images so we
// can do before/after visual comparisons. The main pipeline consumes the enhanced URLs
// internally and feeds them straight to Shotstack — they're never surfaced to the
// caller, which made it impossible to evaluate Nano Banana quality directly. This
// route bridges that gap for stress-test / demo-prep work.
//
// Input:  { imageUrls: string[], category?: ProductCategory }
// Output: { results: Array<{ original: string; enhanced: string | null; fellBack: boolean }> }
//
// Default category is "footwear" (product-photo prompt). The pipeline normally infers
// category from Gemini's analyzeProduct on the source image; here we let the caller
// pass it explicitly so the comparison is deterministic.
export const maxDuration = 60;

const VALID_CATEGORIES: ProductCategory[] = [
  'fashion', 'footwear', 'electronics', 'beauty', 'food', 'home', 'sports', 'jewelry', 'other',
];

export async function POST(req: NextRequest) {
  let body: { imageUrls?: string[]; category?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.imageUrls) || body.imageUrls.length === 0) {
    return NextResponse.json(
      { error: 'imageUrls must be a non-empty array of strings' },
      { status: 400 }
    );
  }
  if (body.imageUrls.length > 5) {
    return NextResponse.json(
      { error: 'Cap is 5 images per call to fit inside the 60s Vercel budget' },
      { status: 400 }
    );
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not configured on server.' },
      { status: 500 }
    );
  }

  const category: ProductCategory = VALID_CATEGORIES.includes(body.category as ProductCategory)
    ? (body.category as ProductCategory)
    : 'footwear';

  try {
    const enhanced = await enhanceImages(body.imageUrls, category, geminiKey);
    // enhanceImages falls back to the original URL when Nano Banana fails for a single
    // image. So `enhanced[i] === original[i]` means "this one was not actually enhanced".
    const results = body.imageUrls.map((original, i) => {
      const out = enhanced[i];
      return {
        original,
        enhanced: out === original ? null : out,
        fellBack: out === original,
      };
    });
    return NextResponse.json({
      category,
      count: results.length,
      successCount: results.filter((r) => !r.fellBack).length,
      results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
