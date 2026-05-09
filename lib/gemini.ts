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
  // Aligned with the Cinematic Showcase merge tokens. buildRenderPayload reads these directly;
  // body_html parsing remains as a fallback.
  spec: string;
  interior: string;
  upgrades: string;
}

const SYSTEM_PROMPT = `You are a creative director writing copy for a strict, fixed-format product video template. The template has three text slots: a one-line technical SPEC, a 1-2 sentence FEATURES block (called "interior"), and a 1-2 sentence UPGRADES block. Every word must earn its slot — no filler, no repetition, no marketing platitudes. Return ONLY raw JSON, no markdown, no code fences, no explanation.`;

const USER_PROMPT = (product: ProductInput) =>
  `Product: "${product.title}"
Description: ${product.body_html.replace(/<[^>]+>/g, '')}
Price: $${product.price}

Analyze the image(s) and return ONLY this JSON object (no markdown, no code fences):
{
  "voiceover": "punchy ad script for text-to-speech narration, 55-65 words, designed to fill exactly 18 seconds when spoken at a steady pace — no filler, no repetition",
  "background_prompt": "detailed cinematic lifestyle photography prompt for AI image generation, 8k, professional, photorealistic",
  "mood": "one word only: luxury OR energetic OR minimal OR warm OR bold",
  "spec": "ONE LINE technical headline of WHAT the product IS (material + key tech). MAX 50 chars. ALL CAPS. No trailing period.",
  "interior": "1-2 short sentences (max 130 chars total) describing sensory/experiential features — how it feels, looks, performs. Title Case. Periods.",
  "upgrades": "1-2 short sentences (max 130 chars total) listing what makes it BETTER than alternatives — premium materials, extras, certifications, durability. Title Case. Periods."
}

Examples of well-formed output for different product types:

Athletic shoe:
{ "spec": "FLEXIBLE FREE SOLE · MESH UPPER", "interior": "Lightweight mesh breathes through every set. Reinforced upper locks the foot in lateral cuts.", "upgrades": "Recycled polyester construction. 60-day comfort guarantee included." }

Skincare serum:
{ "spec": "NIACINAMIDE 10% · HYALURONIC ACID", "interior": "Lightweight gel absorbs in seconds. Calms redness and refines pore appearance.", "upgrades": "Fragrance-free, vegan, dermatologist tested. Made in Korea." }

Coffee bag:
{ "spec": "SINGLE-ORIGIN · ETHIOPIA YIRGACHEFFE", "interior": "Bright citrus and floral notes. Medium roast pulls clean as filter or espresso.", "upgrades": "Direct-trade, freshly roasted in small batches. Resealable nitrogen-flushed pouch." }

Rules:
- spec/interior/upgrades MUST be derived from the actual product image and description. Never invent specs that aren't visible or stated.
- If the description is sparse, infer responsibly from the image (color, material, form factor) but stay factual.
- Never use the words "amazing", "incredible", "revolutionary", "game-changer", or "unleash".`;

async function imageUrlToInlineData(url: string): Promise<{ inline_data: { data: string; mime_type: string } }> {
  if (url.startsWith('data:')) {
    const [header, data] = url.split(',');
    const mime_type = header.split(':')[1].split(';')[0];
    return { inline_data: { data, mime_type } };
  }
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
