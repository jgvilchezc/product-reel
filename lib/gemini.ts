export interface ProductInput {
  title: string;
  body_html: string;
  price: string;
  images: string[];
}

export interface GeminiAnalysis {
  voiceover: string;
  background_prompt: string;
  mood: string;
}

const SYSTEM_PROMPT = `You are a creative director specializing in short-form product advertising videos. Analyze the product image(s) and data provided, then return ONLY raw JSON with no markdown, no code fences, no explanation.`;

const USER_PROMPT = (product: ProductInput) =>
  `Product: "${product.title}"
Description: ${product.body_html.replace(/<[^>]+>/g, '')}
Price: $${product.price}

Analyze the image(s) and return ONLY this JSON object (no markdown, no code fences):
{
  "voiceover": "punchy ad script for text-to-speech narration, 55-65 words, designed to fill exactly 18 seconds when spoken at a steady pace — no filler, no repetition",
  "background_prompt": "detailed cinematic lifestyle photography prompt for AI image generation, 8k, professional, photorealistic",
  "mood": "one word only: luxury OR energetic OR minimal OR warm OR bold"
}`;

async function imageUrlToInlineData(url: string): Promise<{ inline_data: { data: string; mime_type: string } }> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
  return { inline_data: { data: base64, mime_type: mimeType } };
}

function shrinkUrl(url: string): string {
  // Reduce Unsplash images to 640px — 3x 1280px images as base64 hits Gemini TPM limits
  return url.replace(/(unsplash\.com\/[^?]+)(\?.*)?$/, '$1?w=640&q=70');
}

export async function analyzeProduct(product: ProductInput, geminiKey: string): Promise<GeminiAnalysis> {
  // One image is enough for aesthetic analysis; sending all 3 at full size causes 429s
  const imageParts = [await imageUrlToInlineData(shrinkUrl(product.images[0]))];

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          ...imageParts,
          { text: USER_PROMPT(product) },
        ],
      },
    ],
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw: string = data.candidates[0].content.parts[0].text;
  const cleaned = raw.replace(/```json|```/g, '').trim();

  return JSON.parse(cleaned) as GeminiAnalysis;
}
