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
  // Hex color for overlay text in the Cinematic Showcase template. Gemini picks white
  // for dark/colorful backgrounds and near-black for light backgrounds (silver jewelry,
  // white sneakers, light food shots). Limited to a binary palette so brand consistency
  // holds — the template wasn't designed for arbitrary text colors.
  text_color?: '#ffffff' | '#111111';
  // Optional copy fields used by the Cinematic Showcase merge slots. Constraints below
  // are enforced both in the Gemini prompt AND by hard slices in coerceAnalysis — the
  // template clips have fixed-size boxes and longer text wraps onto adjacent rows
  // (e.g. a 60-char SPEC pushed up into the $PRICE row in the May 12 webhook bug).
  mood?: string;
  spec?: string;       // 2-4 word tagline, ≤22 chars
  interior?: string;   // one short feature sentence, ≤90 chars
  upgrades?: string;   // one short benefit sentence, ≤90 chars
  // Ad-video priority ordering for the input images. Array of 0-based indices into
  // the input image array, ordered best-to-worst as a hero shot. Length matches the
  // number of images Gemini saw (which may be fewer than productInput.images.length
  // when /api/simulate uses geminiImageOverride). Pipeline.ts uses this to reorder
  // before submitting to Shotstack so the strongest shot opens the video — and so
  // the worst shot (e.g. an extreme closeup of a sole) doesn't become the hero by
  // accident of source ordering on the Shopify product page.
  image_priority?: number[];
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
- text_color: The overlay-text color for this product. Choose based on the AVERAGE LUMINANCE of the product photo:
  • "#ffffff" (white) — when the photo is mostly dark, mid-tone, or has saturated colors (black background, denim, brown leather, red car, navy hoodie, dark food shots).
  • "#111111" (near-black) — when the photo is mostly LIGHT (silver/chrome jewelry on white, white sneakers on white seamless, beige beauty product on cream, light food on marble, off-white linen).
  Default to "#ffffff" if uncertain. This decision is critical: white text on a silver bracelet against a white background is invisible.
- spec: A short product tagline displayed next to the price chip in Scene 2. 2-4 WORDS, MAXIMUM 22 CHARACTERS including spaces. Anything longer wraps onto 3 lines and visually collides with the $PRICE row above. Examples:
  • Allbirds Tree Runner → "BREATHABLE COMFORT"
  • Sterling silver bracelet → "STERLING SILVER"
  • iPhone 16 Pro → "TITANIUM DESIGN"
  • Glossier Cloud Paint → "BUILDABLE BLUSH"
  Use all-caps style. Count characters before answering.
- interior: One short sentence describing how the product FEELS or its main FEATURE. MAXIMUM 90 CHARACTERS. Renders as body copy in Scene 3 under a "FEATURES" header. Examples:
  • "Soft merino wool wrapped around a lightweight foam sole for all-day comfort."
  • "Sterling silver with a tarnish-resistant finish and a heart-shaped clasp."
- upgrades: One short sentence on the standout BENEFIT or what makes it special. MAXIMUM 90 CHARACTERS. Renders as body copy in Scene 4 under an "UPGRADES" header. Examples:
  • "Machine washable. Made from sustainable materials. Travel-ready."
  • "Hypoallergenic and water-resistant. Designed for everyday wear."
- image_priority: An array of 0-based indices ordering the input images by how strong they would be in an ad video. The FIRST index in the array becomes the opening hero shot of the video; the last becomes the closing scene. Rules:
  • The array length MUST equal the number of input images.
  • All values must be unique and in range [0, N-1].
  • Strong hero shots (image[0] of the array): full-product angled hero, 3/4 view, side profile, worn/styled shot. Anything where the silhouette is recognizable in 1 second.
  • Weak shots (last in the array): extreme close-ups of soles/clasps, top-down detail shots, packaging-only flat lays, lifestyle shots where the product is barely visible.
  • Category-specific bias:
    - footwear/fashion: angled hero (3/4 view) > side profile > closeups > sole/top-down detail
    - jewelry: worn shot or hero clasp > full piece > flat lay > macro detail
    - electronics: front-facing hero > 3/4 angle > back/profile > port detail
    - beauty: product hero with branding visible > swatch/texture > packaging detail
    - food: most appetizing "wow" shot > styled scene > ingredient closeup
  Example with 4 footwear images (image 0 = sole closeup, image 1 = side profile, image 2 = 3/4 hero, image 3 = laces detail): image_priority = [2, 1, 3, 0]

---

STEP 4 — SELF-EVALUATION (mandatory before output):
Check your own output against these criteria:
[ ] Is voiceover under 35 words? If not, shorten it.
[ ] Does the background_prompt match the product_category? If not, rewrite it.
[ ] Is text_position safe given where the product is? If not, change it.
[ ] If the product fills most of the frame, is needs_text_background set to true? Fix if not.
[ ] Is short_title ≤22 chars and 2-4 words? Count characters. If over, shorten further.
[ ] Would a person reading text_color on top of this image be able to read it? If a white-on-white or black-on-black collision would happen, flip the color.
[ ] Is spec ≤22 chars? Is interior ≤90 chars? Is upgrades ≤90 chars? Count and trim if any are over.
[ ] Does image_priority have length equal to the number of input images? Are all values unique and within [0, N-1]? Does the first index point to a strong hero shot (NOT a top-down or extreme closeup)?

Only produce output after passing all 8 checks.

---

STEP 5 — OUTPUT:
Return ONLY a raw JSON object. No markdown, no explanation, no backticks. Start with { and end with }.

{
  "voiceover": "string — max 35 words",
  "background_prompt": "string — detailed cinematic prompt",
  "text_position": "top" | "bottom" | "split",
  "needs_text_background": true | false,
  "product_category": "fashion | footwear | electronics | beauty | food | home | sports | jewelry | other",
  "short_title": "string — 2-4 words, MAX 22 chars, all caps style headline",
  "text_color": "#ffffff" | "#111111",
  "spec": "string — 2-4 words, MAX 22 chars, tagline",
  "interior": "string — one sentence, MAX 90 chars, feature description",
  "upgrades": "string — one sentence, MAX 90 chars, benefit description",
  "image_priority": [number, number, ...]
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
    text_color: '#ffffff',
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

  // Binary palette only. Anything else (Gemini hallucinating a hex value, or returning
  // a CSS name) falls back to white — matches the legacy template behavior.
  const text_color: '#ffffff' | '#111111' = r.text_color === '#111111' ? '#111111' : '#ffffff';

  // Hard slices guarantee the merge-field text never exceeds what the template clip
  // boxes can hold. Empty strings fall through to the description-parsing path in
  // shotstack.ts (which has its own slices), so we don't substitute fallbacks here.
  const spec = typeof r.spec === 'string' ? r.spec.trim().slice(0, 22) : undefined;
  const interior = typeof r.interior === 'string' ? r.interior.trim().slice(0, 90) : undefined;
  const upgrades = typeof r.upgrades === 'string' ? r.upgrades.trim().slice(0, 90) : undefined;

  // Validate image_priority: must be an array of unique integers in [0, N-1] where N
  // is the number of images Gemini saw. We don't know N here, but we cap it to the
  // number of images in productInput (the most we ever send to Gemini). Pipeline.ts
  // checks length-match against the actually-rendered images before applying.
  const imageCount = product.images.length;
  let image_priority: number[] | undefined;
  if (Array.isArray(r.image_priority)) {
    const nums = r.image_priority
      .filter((v): v is number => Number.isInteger(v) && v >= 0 && v < imageCount);
    const unique = Array.from(new Set(nums));
    if (unique.length > 0) image_priority = unique;
  }

  return {
    voiceover,
    background_prompt,
    text_position,
    needs_text_background,
    product_category,
    short_title,
    text_color,
    spec,
    interior,
    upgrades,
    image_priority,
  };
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
  // Send ALL images (up to 7 — the Cinematic Showcase ceiling) so Gemini can return
  // image_priority. Failed fetches are dropped silently; if every image fails we fall
  // back. Previously this function only sent images[0], which meant Gemini had no way
  // to rank shots and the pipeline used Shopify's source order — frequently leading
  // to "sole closeup as hero" since Shopify product pages sometimes upload detail
  // shots first.
  const imageResults = await Promise.allSettled(
    product.images.slice(0, 7).map((url) => imageUrlToInlineData(shrinkUrl(url)))
  );
  const imageParts = imageResults
    .filter(
      (r): r is PromiseFulfilledResult<{ inline_data: { data: string; mime_type: string } }> =>
        r.status === 'fulfilled',
    )
    .map((r) => r.value);
  if (imageParts.length === 0) {
    return fallbackAnalysis(product);
  }

  const description = (product.body_html || '').replace(/<[^>]+>/g, '').trim();
  const imageCount = imageParts.length;
  const imageLabel = imageCount === 1 ? 'this product image' : `these ${imageCount} product images (indexed 0..${imageCount - 1} in the order shown)`;
  const userText = `Product name: ${product.title}. Price: $${product.price}. Description: ${description}. Analyze ${imageLabel} and follow all 5 steps. For image_priority, return an array of length ${imageCount}.`;

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
