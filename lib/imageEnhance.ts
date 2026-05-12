import type { ProductCategory } from './gemini';
import { uploadImageToIngest } from './shotstack';

// Three category-aware prompts (verbatim from product notes — do not paraphrase).
// The Gemini 2.5 Flash Image model (Nano Banana) is sensitive to wording: we want
// it to recover detail and edge clarity, not to redesign or stylize the subject.
const PROMPTS = {
  portrait:
    "Enhance this image to ultra-clean 4K quality. Recover authentic skin texture, eyelashes, and hair strands while keeping natural pores. Reduce blur and noise without 'plastic skin' airbrushing. Preserve original identity and lighting perfectly",
  product:
    "Upscale this product image to crisp 4K resolution. Improve edge clarity and recover micro-details like texture, stitching, and material grain. Keep branding, colors, and shadows identical. Output should be sharper without redesigning the object",
  cinematic:
    "Transform this into a pristine, ultra-HD cinematic version. Reconstruct micro-level facial contours, sharp lifelike eyes, and well-resolved edges. Maintain 100% fidelity to the original subject, pose, and background",
} as const;

function pickPrompt(category: ProductCategory): string {
  // Portrait path: product typically shot on a model or with skin/face in frame.
  if (category === 'fashion' || category === 'beauty' || category === 'jewelry') {
    return PROMPTS.portrait;
  }
  // Pure product shots: object-only photography.
  if (
    category === 'footwear' ||
    category === 'electronics' ||
    category === 'home' ||
    category === 'food' ||
    category === 'sports'
  ) {
    return PROMPTS.product;
  }
  // 'other' falls through to cinematic — works well for mixed/lifestyle shots
  // where we can't tell whether a person is in frame.
  return PROMPTS.cinematic;
}

async function fetchAsInlineData(url: string): Promise<{ data: string; mime_type: string }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`source image fetch failed: ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  const data = Buffer.from(buffer).toString('base64');
  const mime_type = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
  return { data, mime_type };
}

async function callNanoBanana(
  imageUrl: string,
  prompt: string,
  geminiKey: string
): Promise<{ data: string; mime_type: string }> {
  const inline_data = await fetchAsInlineData(imageUrl);

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ inline_data }, { text: prompt }],
      },
    ],
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`nano banana ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    // Google's v1beta REST API returns camelCase (`inlineData`) in responses even
    // though requests use snake_case (`inline_data`). Accept either to be safe.
    const inline = part?.inlineData ?? part?.inline_data;
    if (inline?.data) {
      return {
        data: inline.data,
        mime_type: inline.mimeType ?? inline.mime_type ?? 'image/png',
      };
    }
  }
  throw new Error('nano banana response had no inline_data part');
}

/**
 * Enhances every image in parallel using the Nano Banana model, then uploads each
 * result to Shotstack Ingest to get HTTPS URLs that buildRenderPayload can consume.
 *
 * If enhancement fails for any single image (model error, network blip, malformed
 * response), that image silently falls back to its original URL. The pipeline
 * never crashes; the worst case is "video looks the same as before".
 */
export async function enhanceImages(
  images: string[],
  category: ProductCategory,
  geminiKey: string
): Promise<string[]> {
  const prompt = pickPrompt(category);

  return Promise.all(
    images.map(async (originalUrl) => {
      try {
        const { data, mime_type } = await callNanoBanana(originalUrl, prompt, geminiKey);
        const dataUri = `data:${mime_type};base64,${data}`;
        return await uploadImageToIngest(dataUri);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[enhanceImages] fallback to original (${originalUrl}): ${msg}`);
        return originalUrl;
      }
    })
  );
}

export interface EnhanceImageDiagnostic {
  original: string;
  enhanced: string | null;
  fellBack: boolean;
  error?: string;
}

/**
 * Same pipeline as enhanceImages but returns per-image diagnostic info instead of
 * silently swallowing errors. Used by /api/diag-enhance for quality-comparison work
 * during stress tests so we can see WHY a given enhance failed (Gemini auth error,
 * unsupported source format, Shotstack ingest rejection, etc.) without combing
 * through Vercel runtime logs.
 */
export async function enhanceImagesDiagnostic(
  images: string[],
  category: ProductCategory,
  geminiKey: string
): Promise<EnhanceImageDiagnostic[]> {
  const prompt = pickPrompt(category);

  return Promise.all(
    images.map(async (originalUrl): Promise<EnhanceImageDiagnostic> => {
      try {
        const { data, mime_type } = await callNanoBanana(originalUrl, prompt, geminiKey);
        const dataUri = `data:${mime_type};base64,${data}`;
        const enhanced = await uploadImageToIngest(dataUri);
        return { original: originalUrl, enhanced, fellBack: false };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { original: originalUrl, enhanced: null, fellBack: true, error: msg };
      }
    })
  );
}
