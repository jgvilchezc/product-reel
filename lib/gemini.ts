export interface ProductInput {
  title: string;
  body_html: string;
  price: string;
  images: string[];
}

export type TextPosition = 'top' | 'bottom' | 'split';
export type ProductCategory =
  | 'fashion'
  | 'footwear'
  | 'electronics'
  | 'beauty'
  | 'food'
  | 'home'
  | 'sports'
  | 'jewelry'
  | 'other';

export interface GeminiAnalysis {
  voiceover: string;
  background_prompt: string;
  text_position: TextPosition;
  needs_text_background: boolean;
  product_category: ProductCategory;
  // Short, headline-safe variant of the product name (2-4 words, ≤22 chars).
  // Shopify titles like "Men's Canvas Cruiser - Warm White (Natural White Sole)" overflow
  // the Cinematic Showcase MODEL slot (1133×120 at 60px) and wrap onto the YEAR/MAKE row.
  // Gemini compresses to a punchy ad headline ("CANVAS CRUISER", "TREE RUNNERS").
  short_title?: string;
  // Optional legacy fields. shotstack.ts still reads these via `analysis.spec || …`
  // fallbacks; keeping them optional avoids breaking that path when Gemini omits them.
  mood?: string;
  spec?: string;
  interior?: string;
  upgrades?: string;
}

const SYSTEM_PROMPT = `You are a professional video advertising director with deep expertise in visual composition and product photography.

Your task is to analyze a product image and generate data for a video advertisement. You must follow these steps in order before producing any output.

---

STEP 1 — VISUAL ANALYSIS (mandatory, do this before anything else):
Look at the image carefully and determine:
- Where is the main product positioned? (top / center / bottom) and (left / center / right)
- What percentage of the frame does the product occupy? (0-100%)
- Where are the empty/clean areas with no important content?
- What is the dominant background color or texture?
- What is the product category? Choose one: fashion / footwear / electronics / beauty / food / home / sports / jewelry / other

---

STEP 2 — SAFE TEXT ZONES:
Based on the product position, determine where text can appear WITHOUT overlapping the product:
- Product centered + fills >60% of frame → needs_text_background = true, text_position = "split" (name top, price bottom)
- Product bottom half → text_position = "top"
- Product top half → text_position = "bottom"
- Product left/right → text_position = opposite side
- When in doubt → needs_text_background = true

---

STEP 3 — GENERATE CONTENT:
Write:
- voiceover: 2-3 punchy sentences. Persuasive, conversational, ends with a soft call to action. Maximum 35 words total.
- background_prompt: A detailed cinematic lifestyle photography prompt that COMPLEMENTS the product without showing it. Include: lighting style (e.g. "golden hour", "studio soft box", "neon city lights"), setting, mood, camera angle, and quality tags (8k, photorealistic, shallow depth of field). Tailor to the product_category detected.
- short_title: A punchy, billboard-style headline of the product. 2-4 words, MAXIMUM 22 characters total including spaces. Strip articles, brand prefixes, color/variant suffixes, and parenthetical notes. Examples:
  • "Men's Canvas Cruiser - Warm White (Natural White Sole)" → "CANVAS CRUISER"
  • "Allbirds Tree Runners — Stone Beige" → "TREE RUNNERS"
  • "Apple iPhone 16 Pro Max 256GB Titanium" → "IPHONE 16 PRO"
  • "Glossier Cloud Paint in Dusk" → "CLOUD PAINT"
  This text is rendered as a single line in a fixed-width slot — if it's >22 chars it WILL overflow and break the layout. Count characters before writing.

---

STEP 4 — SELF-EVALUATION (mandatory before output):
Check your own output against these criteria:
[ ] Is voiceover under 35 words? If not, shorten it.
[ ] Does the background_prompt match the product_category? If not, rewrite it.
[ ] Is text_position safe given where the product is? If not, change it.
[ ] If the product fills most of the frame, is needs_text_background set to true? Fix if not.
[ ] Is short_title ≤22 chars and 2-4 words? Count characters. If over, shorten further.

Only produce output after passing all 5 checks.

---

STEP 5 — OUTPUT:
Return ONLY a raw JSON object. No markdown, no explanation, no backticks. Start with { and end with }.

{
  "voiceover": "string — max 35 words",
  "background_prompt": "string — detailed cinematic prompt",
  "text_position": "top" | "bottom" | "split",
  "needs_text_background": true | false,
  "product_category": "fashion | footwear | electronics | beauty | food | home | sports | jewelry | other",
  "short_title": "string — 2-4 words, MAX 22 chars, all caps style headline"
}`;

const VALID_POSITIONS: TextPosition[] = ['top', 'bottom', 'split'];
const VALID_CATEGORIES: ProductCategory[] = [
  'fashion',
  'footwear',
  'electronics',
  'beauty',
  'food',
  'home',
  'sports',
  'jewelry',
  'other',
];

// Trim a long Shopify title down to a headline-safe snippet. Drops the first
// parenthetical/dash-suffix block, then takes the first 2-3 words capped at 22 chars.
// Used when Gemini omits short_title or returns something too long.
function deriveShortTitle(rawTitle: string): string {
  const stripped = rawTitle
    .replace(/\s*[-–—]\s.*$/, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = stripped.split(' ').slice(0, 3).join(' ');
  return words.slice(0, 22).trim();
}

function fallbackAnalysis(product: ProductInput): GeminiAnalysis {
  return {
    voiceover: `${product.title} — now available for $${product.price}. Shop today.`,
    background_prompt: 'cinematic lifestyle photography, soft natural lighting, minimal background, 8k photorealistic',
    text_position: 'split',
    needs_text_background: true,
    product_category: 'other',
    short_title: deriveShortTitle(product.title),
  };
}

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
  return url.replace(/(unsplash\.com\/[^?]+)(\?.*)?$/, '$1?w=640&q=70');
}

function coerceAnalysis(raw: unknown, product: ProductInput): GeminiAnalysis {
  const fb = fallbackAnalysis(product);
  if (!raw || typeof raw !== 'object') return fb;
  const r = raw as Record<string, unknown>;

  const voiceover = typeof r.voiceover === 'string' && r.voiceover.trim() ? r.voiceover.trim() : fb.voiceover;
  const background_prompt =
    typeof r.background_prompt === 'string' && r.background_prompt.trim()
      ? r.background_prompt.trim()
      : fb.background_prompt;
  const text_position: TextPosition = VALID_POSITIONS.includes(r.text_position as TextPosition)
    ? (r.text_position as TextPosition)
    : fb.text_position;
  const needs_text_background =
    typeof r.needs_text_background === 'boolean' ? r.needs_text_background : fb.needs_text_background;
  const product_category: ProductCategory = VALID_CATEGORIES.includes(r.product_category as ProductCategory)
    ? (r.product_category as ProductCategory)
    : fb.product_category;

  // Hard cap at 22 chars even if Gemini ignores its own constraint — the template slot
  // will overflow otherwise. Empty/missing → fall back to deriving from raw title.
  const rawShort = typeof r.short_title === 'string' ? r.short_title.trim() : '';
  const short_title = (rawShort ? rawShort : fb.short_title || deriveShortTitle(product.title)).slice(0, 22);

  return { voiceover, background_prompt, text_position, needs_text_background, product_category, short_title };
}

export interface TextOverlayAdjustments {
  nameOffsetY: number;
  priceOffsetY: number;
  textStyle: string;
}

// Translates Gemini's positional decision into render-time offsets for the
// product-name and price overlays. Consumers spread these into merge fields
// (or the render call) without changing the rest of the template layout.
export function getTextOverlayAdjustments(analysis: GeminiAnalysis): TextOverlayAdjustments {
  const textStyle = analysis.needs_text_background
    ? 'background: rgba(0,0,0,0.6); border-radius: 8px; padding: 12px 24px;'
    : '';

  const nameOffsetY =
    analysis.text_position === 'top'
      ? 0.35
      : analysis.text_position === 'bottom'
        ? -0.35
        : 0.32;

  const priceOffsetY = analysis.text_position === 'bottom' ? -0.28 : -0.36;

  return { nameOffsetY, priceOffsetY, textStyle };
}

export async function analyzeProduct(product: ProductInput, geminiKey: string): Promise<GeminiAnalysis> {
  let imageParts: Array<{ inline_data: { data: string; mime_type: string } }> = [];
  try {
    imageParts = [await imageUrlToInlineData(shrinkUrl(product.images[0]))];
  } catch {
    return fallbackAnalysis(product);
  }

  const description = (product.body_html || '').replace(/<[^>]+>/g, '').trim();
  const userText = `Product name: ${product.title}. Price: $${product.price}. Description: ${description}. Analyze this product image and follow all 5 steps.`;

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [...imageParts, { text: userText }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  };

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
  } catch {
    return fallbackAnalysis(product);
  }

  if (!res.ok) {
    return fallbackAnalysis(product);
  }

  let raw: string;
  try {
    const data = await res.json();
    raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } catch {
    return fallbackAnalysis(product);
  }

  const cleaned = raw.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return fallbackAnalysis(product);
  }

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return coerceAnalysis(parsed, product);
  } catch {
    return fallbackAnalysis(product);
  }
}
