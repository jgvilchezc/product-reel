import type { GeminiAnalysis, ProductInput } from './gemini';

const SHOTSTACK_BASE = 'https://api.shotstack.io/edit/stage';
const API_KEY = process.env.SHOTSTACK_API_KEY ?? '';

interface ShotstackClip {
  asset: Record<string, unknown>;
  start: number;
  length: number;
  effect?: string;
  transition?: { in?: string; out?: string };
  position?: string;
  offset?: { x: number; y: number };
  scale?: number;
  opacity?: number;
}

interface ShotstackTrack {
  clips: ShotstackClip[];
}

// AVIF is intentionally excluded — Shotstack's renderer rejects it as "format not supported".
// If you see .avif in a Shopify CDN URL, normalizeImageUrl will throw before the render submits.
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|gif|webp|bmp|tiff)(\?|#|$)/i;

function normalizeImageUrl(url: string): string {
  if (IMAGE_EXT_RE.test(url)) return url;
  // Shotstack parses the URL and rejects sources whose path doesn't end in a known
  // image extension (jpg/png/gif/webp/bmp/tiff/avif). Real Shopify CDN URLs always
  // include one, so production traffic hits the fast path above. The dev-only case
  // (Unsplash, picsum without extension, etc.) gets a clear error here instead of
  // a confusing 400 from Shotstack downstream.
  throw new Error(
    `Image URL must end with a known extension in the path (.jpg, .png, .webp, etc.). ` +
    `Got: ${url}. Tip: real Shopify CDN URLs always include an extension; for testing ` +
    `use https://picsum.photos/seed/anything/1280/720.jpg or any direct image link.`
  );
}

// Car-sale slideshow adapted for products — port of Shotstack's "car-sale-slideshow-video"
// template. Uses Shotstack's `merge` feature to inject product values into `{{ TOKEN }}`
// placeholders. Output: 36s 1080p cinematic showcase with kinetic typography, luma transitions,
// red accent panels, and a closing price card.
export function buildRenderPayload(
  product: ProductInput,
  analysis: GeminiAnalysis,
  audioUrl?: string,
  brandName?: string,
) {
  const images = product.images.slice(0, 7).map(normalizeImageUrl);
  while (images.length > 0 && images.length < 7) {
    images.push(images[images.length - 1]);
  }

  // Prefer Gemini's structured output (template-aligned); fall back to body_html parsing
  // if a caller passes an analysis object missing the new fields.
  const description = (product.body_html || '').trim();
  const descSentences = description.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 5);
  const aiSentences = (analysis.voiceover || '').split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 5);

  const year = String(new Date().getFullYear());
  // MAKE/SELLER slots are ~1131px wide at 80px font; cap brand at ~18 chars so it
  // doesn't wrap or collide with the price chip. Most Shopify vendor names fit easily.
  const brand = (brandName || 'NEW ARRIVAL').toUpperCase().slice(0, 18);
  // MODEL slot is 1133×120 at 60px — anything over ~22 chars wraps to a 2nd line and
  // collides with the YEAR/MAKE row above. Gemini's short_title compresses long Shopify
  // titles to a 2-4 word ad headline; the hard slice is a final safety net.
  const model = (analysis.short_title || product.title).toUpperCase().slice(0, 22);
  const seller = (brandName || 'OFFICIAL STORE').toUpperCase().slice(0, 18);
  // Overlay text color picked by Gemini based on average background luminance.
  // White on white (silver bracelet on seamless white, off-white sneakers, light food)
  // is unreadable; Gemini flips to near-black for those. Falls back to white when the
  // analyzer omits the field. Applied to every text clip below — the cinematic template
  // was designed assuming a single overlay color so flipping all clips together keeps
  // the visual identity consistent.
  const textColor: string = analysis.text_color || '#ffffff';

  // Background-image opacity ties to text color. The original car-sale template had
  // opacity:0.4 hardcoded on Scenes 1-2 (intro + spec) but NOT on Scenes 3-4
  // (FEATURES/UPGRADES). On dark products this looked fine, but on light products
  // (silver bracelet on seamless white) the un-darkened Scenes 3-4 left white text
  // floating invisibly on a near-white background. (User-flagged May 12.)
  //
  // Now we tie opacity to the text color decision:
  //   white text → darken all image backgrounds to 0.4 so white reads everywhere
  //   dark text  → keep images bright at 1.0 so #111111 contrasts cleanly
  // This restores per-scene legibility regardless of product luminance.
  const imageOpacity = textColor === '#111111' ? 1 : 0.4;
  const type = 'NEW';
  const state = 'ONLINE';
  const postcode = 'WORLDWIDE';
  // SPEC slot is a 700×90 right-aligned box at size 40 in Scene 2, only ~85px below
  // the ODOMETER ($PRICE) at y:0.035. The legacy fallback to descSentences[0] kept
  // injecting marketing sentences from body_html (60+ chars) that wrapped to 3 lines
  // and bled UP into the price row, even after the slice clamped to 22 chars (because
  // the slice still produced multi-word strings that wrapped at size 40 in some fonts).
  // New policy: prefer Gemini's tagline; otherwise fall back to product_category
  // (always ≤11 chars: footwear, jewelry, electronics…) which guarantees one line.
  // No more body_html sentence parsing for this slot.
  const geminiSpec = (analysis.spec || '').trim();
  const spec = (geminiSpec || analysis.product_category).toUpperCase().slice(0, 22);
  // INTERIOR/UPGRADES render in 1000-903 wide boxes at size 36 (Scenes 3-4). At 100 chars
  // they fit in 3 lines, which is what the box height (250-300px) was sized for. The
  // previous 150-char cap allowed 4+ lines that collided with the FEATURES/UPGRADES
  // header above.
  const interior = (
    analysis.interior ||
    descSentences.slice(0, 2).join('. ') ||
    description.slice(0, 100) ||
    aiSentences.slice(0, 2).join('. ') ||
    'Crafted with premium materials.'
  ).slice(0, 100);
  const upgrades = (
    analysis.upgrades ||
    descSentences.slice(2, 5).join('. ') ||
    aiSentences.slice(0, 3).join('. ') ||
    'Designed for performance and comfort.'
  ).slice(0, 100);
  const odometer = `\$${product.price}`;
  const priceText = `\$${product.price}`;

  const audioSrc =
    audioUrl ||
    'https://templates.shotstack.io/car-sale-slideshow-video/4b639106-e1fc-4808-85c0-18a13ce1c56c/source.mp3';

  return {
    timeline: {
      background: '#000000',
      tracks: [
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ YEAR }}',
                font: { family: 'Montserrat ExtraBold', color: textColor, size: 160 },
                alignment: { horizontal: 'right' },
                width: 450,
                height: 180,
              },
              start: 0,
              length: 4,
              fit: 'none',
              scale: 1,
              offset: { x: -0.317, y: 0.095 },
              position: 'center',
              transition: { in: 'slideUp', out: 'slideDown' },
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ MAKE }}',
                font: { family: 'Montserrat ExtraBold', color: textColor, size: 80 },
                alignment: { horizontal: 'left' },
                width: 1131,
                height: 160,
              },
              fit: 'none',
              scale: 1,
              offset: { x: 0.098, y: 0.124 },
              position: 'center',
              transition: { in: 'slideUp', out: 'slideDown' },
              start: 0.5,
              length: 3.5,
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ MODEL }}',
                font: { family: 'Montserrat SemiBold', color: textColor, size: 60 },
                alignment: { horizontal: 'left' },
                width: 1133,
                height: 120,
              },
              fit: 'none',
              scale: 1,
              offset: { x: 0.099, y: 0.045 },
              position: 'center',
              start: 1,
              length: 3,
              transition: { out: 'slideDown', in: 'slideUp' },
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ SELLER }} | {{ TYPE }} | {{ STATE }}, {{ POSTCODE }}',
                font: { family: 'Montserrat SemiBold', color: textColor, size: 32 },
                alignment: { horizontal: 'left' },
                width: 826,
                height: 60,
              },
              fit: 'none',
              scale: 1,
              offset: { x: 0.019, y: -0.014 },
              position: 'center',
              transition: { out: 'slideDown', in: 'slideUp' },
              start: 1.2,
              length: 2.8,
            },
          ],
        },
        {
          clips: [
            {
              asset: { type: 'image', src: '{{ IMAGE_1 }}' },
              start: 0,
              length: 5,
              effect: 'zoomIn',
              transition: { in: 'fade' },
              position: 'center',
              fit: 'crop',
              opacity: imageOpacity,
            },
            {
              asset: {
                type: 'luma',
                src: 'https://templates.shotstack.io/car-sale-slideshow-video/31d234d2-2091-4a43-aa2a-e3bec1c3ddc4/source.mp4',
              },
              length: 2,
              start: 4,
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: 'PRICE',
                font: { family: 'Montserrat SemiBold', color: textColor, size: 40 },
                alignment: { horizontal: 'left' },
                width: 144,
                height: 93,
              },
              length: 5,
              start: 5,
              transition: { out: 'slideDown', in: 'slideUp' },
              fit: 'none',
              scale: 1,
              offset: { x: -0.178, y: 0.021 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ SPEC }}',
                font: { family: 'Montserrat SemiBold', color: textColor, size: 40 },
                // vertical: 'top' anchors any wrapped overflow to grow DOWN, so it
                // can't bleed up into the $PRICE row at y:0.035 even if SPEC exceeds
                // its char budget. Belt + suspenders with the 22-char slice above.
                alignment: { horizontal: 'right', vertical: 'top' },
                width: 700,
                height: 90,
              },
              length: 5,
              start: 5,
              transition: { out: 'slideDown', in: 'slideUp' },
              fit: 'none',
              scale: 1,
              // Was y:-0.05 (only ~85px below ODOMETER at y:0.035). Bumped to -0.15
              // so even a 2-line wrap leaves ~120px of clean air between SPEC and the
              // big $PRICE number. Combined with the product_category fallback above,
              // this slot is now visually safe for every category.
              offset: { x: -0.32, y: -0.15 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ ODOMETER }}',
                font: { family: 'Montserrat ExtraBold', color: textColor, size: 90 },
                alignment: { horizontal: 'right' },
                width: 423,
                height: 160,
              },
              length: 5,
              start: 5,
              transition: { out: 'slideDown', in: 'slideUp' },
              fit: 'none',
              scale: 1,
              offset: { x: -0.332, y: 0.035 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'html',
                width: 100,
                height: 600,
                background: '#d96657',
                html: '<p data-html-type="text"> </p>',
                css: "p { color: #ffffff; font-size: 32px; font-family: 'Roboto Black'; text-align: center; }",
              },
              start: 5,
              length: 5,
              position: 'center',
              transition: { in: 'carouselDown', out: 'slideDown' },
              fit: 'none',
              scale: 1,
              offset: { x: -0.474, y: 0 },
            },
          ],
        },
        {
          clips: [
            {
              asset: { type: 'image', src: '{{ IMAGE_2 }}' },
              start: 5.7,
              length: 4.3,
              offset: { x: 0.2, y: 0 },
              position: 'center',
              fit: 'none',
              scale: 0.5,
              transition: { in: 'slideLeft', out: 'fade' },
            },
          ],
        },
        {
          clips: [
            {
              asset: { type: 'image', src: '{{ IMAGE_2 }}' },
              fit: 'crop',
              position: 'center',
              transition: { in: 'fade' },
              scale: 1,
              opacity: imageOpacity,
              start: 4,
              length: 6,
            },
            {
              asset: {
                type: 'luma',
                src: 'https://templates.shotstack.io/car-sale-slideshow-video/b127f4e2-3ce4-4cef-8ce7-08ebb2d34961/source.mp4',
              },
              length: 2,
              start: 9,
            },
          ],
        },
        {
          clips: [
            {
              asset: { type: 'image', src: '{{ IMAGE_3 }}' },
              effect: 'zoomIn',
              position: 'center',
              fit: 'crop',
              scale: 1,
              opacity: imageOpacity,
              transition: { in: 'fade' },
              start: 9,
              length: 3,
            },
            {
              asset: {
                type: 'luma',
                src: 'https://templates.shotstack.io/car-sale-slideshow-video/33d2c1b0-367a-46ad-907b-ad78a804e76f/source.mp4',
              },
              length: 2,
              start: 11,
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: 'FEATURES',
                font: { family: 'Montserrat ExtraBold', color: textColor, size: 60 },
                alignment: { horizontal: 'left' },
                width: 620,
                height: 96,
              },
              start: 11.5,
              length: 5.5,
              transition: { in: 'slideLeft', out: 'slideRight' },
              fit: 'none',
              scale: 1,
              offset: { x: -0.25, y: 0.054 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ INTERIOR }}',
                font: { family: 'Montserrat SemiBold', color: textColor, size: 36 },
                alignment: { horizontal: 'left', vertical: 'top' },
                width: 1000,
                height: 250,
              },
              start: 11.5,
              length: 5.5,
              transition: { in: 'slideLeft', out: 'slideRight' },
              fit: 'none',
              scale: 1,
              offset: { x: -0.15, y: -0.094 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'html',
                width: 50,
                height: 300,
                background: '#d96657',
                html: '<p data-html-type="text"> </p>',
                css: "p { color: #ffffff; font-size: 32px; font-family: 'Roboto Black'; text-align: center; }",
              },
              transition: { in: 'carouselDown', out: 'slideDown' },
              start: 11.5,
              length: 5.5,
              fit: 'none',
              scale: 1,
              offset: { x: -0.487, y: 0 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: { type: 'image', src: '{{ IMAGE_4 }}' },
              start: 11,
              length: 7,
              effect: 'zoomIn',
              position: 'center',
              transition: { in: 'fade' },
              fit: 'crop',
              scale: 1,
              opacity: imageOpacity,
            },
            {
              asset: {
                type: 'luma',
                src: 'https://templates.shotstack.io/car-sale-slideshow-video/eaabeec9-66cc-4522-bb38-bee193e14de4/source.mp4',
              },
              length: 2,
              start: 17,
            },
          ],
        },
        {
          clips: [
            {
              asset: { type: 'image', src: '{{ IMAGE_5 }}' },
              length: 4,
              effect: 'zoomIn',
              position: 'center',
              start: 17,
              opacity: imageOpacity,
            },
            {
              asset: {
                type: 'luma',
                src: 'https://templates.shotstack.io/car-sale-slideshow-video/601da9e5-c415-448f-92a8-cd91e0c08f98/source.mp4',
              },
              length: 2,
              start: 20,
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: 'UPGRADES',
                font: { family: 'Montserrat ExtraBold', color: textColor, size: 60 },
                alignment: { horizontal: 'left' },
                width: 620,
                height: 108,
              },
              start: 21,
              length: 4,
              transition: { in: 'slideDown', out: 'slideUp' },
              fit: 'none',
              scale: 1,
              offset: { x: -0.245, y: 0.057 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ UPGRADES }}',
                font: { family: 'Montserrat SemiBold', color: textColor, size: 36 },
                alignment: { horizontal: 'left', vertical: 'top' },
                width: 903,
                height: 300,
              },
              start: 21,
              length: 4,
              transition: { in: 'slideDown', out: 'slideUp' },
              fit: 'none',
              scale: 1,
              offset: { x: -0.171, y: -0.124 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'html',
                width: 50,
                height: 300,
                background: '#d96657',
                html: '<p data-html-type="text"> </p>',
                css: "p { color: #ffffff; font-size: 32px; font-family: 'Roboto Black'; text-align: center; }",
              },
              transition: { in: 'carouselDown', out: 'slideDown' },
              start: 21,
              length: 4,
              fit: 'none',
              scale: 1,
              offset: { x: -0.487, y: 0 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: { type: 'image', src: '{{ IMAGE_6 }}' },
              start: 20,
              length: 6,
              effect: 'zoomIn',
              position: 'center',
              opacity: imageOpacity,
            },
            {
              asset: {
                type: 'luma',
                src: 'https://templates.shotstack.io/car-sale-slideshow-video/9f9607f6-8153-437a-a04f-3b7b01eefb01/source.mp4',
              },
              length: 2,
              start: 25,
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ PRICE }}',
                font: { family: 'Montserrat ExtraBold', color: textColor, size: 150 },
                alignment: { horizontal: 'center' },
                width: 1133,
                height: 180,
              },
              start: 28,
              length: 3,
              transition: { out: 'slideUp', in: 'slideDown' },
              fit: 'none',
              scale: 1,
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: 'free shipping worldwide',
                font: { family: 'Montserrat SemiBold', color: textColor, size: 36 },
                alignment: { horizontal: 'center' },
                width: 620,
                height: 93,
              },
              transition: { out: 'slideUp', in: 'slideDown' },
              start: 28,
              length: 3,
              fit: 'none',
              scale: 1,
              offset: { x: 0, y: -0.143 },
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: 'shop now',
                font: { family: 'Montserrat ExtraBold', color: textColor, size: 80 },
                alignment: { horizontal: 'center' },
                width: 1920,
                height: 200,
              },
              start: 30.8,
              length: 5.2,
              fit: 'none',
              transition: { in: 'slideUp' },
              position: 'center',
              offset: { x: 0, y: 0.05 },
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'text',
                text: '{{ STORE }}',
                font: { family: 'Montserrat SemiBold', color: textColor, size: 40 },
                alignment: { horizontal: 'center' },
                width: 1920,
                height: 1080,
              },
              length: 5,
              offset: { x: 0, y: -0.2 },
              start: 31,
              transition: { in: 'slideUp' },
              fit: 'none',
              scale: 1,
              position: 'center',
            },
          ],
        },
        {
          clips: [
            {
              asset: { type: 'image', src: '{{ IMAGE_7 }}' },
              start: 25,
              length: 8,
              effect: 'zoomIn',
              transition: { out: 'fade' },
              position: 'center',
              fit: 'crop',
              scale: 1,
              opacity: imageOpacity,
            },
          ],
        },
        {
          clips: [
            {
              asset: {
                type: 'audio',
                src: audioSrc,
                effect: 'fadeOut',
                volume: 1,
              },
              start: 0,
              length: 36,
            },
          ],
        },
      ],
    },
    output: {
      format: 'mp4',
      fps: 25,
      size: { width: 1920, height: 1080 },
    },
    merge: [
      { find: 'YEAR', replace: year },
      { find: 'MAKE', replace: brand },
      { find: 'MODEL', replace: model },
      { find: 'SELLER', replace: seller },
      { find: 'TYPE', replace: type },
      { find: 'STATE', replace: state },
      { find: 'POSTCODE', replace: postcode },
      { find: 'IMAGE_1', replace: images[0] },
      { find: 'IMAGE_2', replace: images[1] },
      { find: 'IMAGE_3', replace: images[2] },
      { find: 'IMAGE_4', replace: images[3] },
      { find: 'IMAGE_5', replace: images[4] },
      { find: 'IMAGE_6', replace: images[5] },
      { find: 'IMAGE_7', replace: images[6] },
      { find: 'ODOMETER', replace: odometer },
      { find: 'SPEC', replace: spec },
      { find: 'INTERIOR', replace: interior },
      { find: 'UPGRADES', replace: upgrades },
      { find: 'PRICE', replace: priceText },
      { find: 'STORE', replace: seller },
    ],
  };
}

function buildImageClips(images: string[], totalDuration: number): ShotstackClip[] {
  const count = images.length;
  const seg = totalDuration / count;
  return images.map((src, i) => ({
    asset: { type: 'image', src },
    start: +(i * seg).toFixed(2),
    length: +seg.toFixed(2),
    scale: 0.42,
    position: 'right' as const,
    offset: { x: -0.03, y: 0 },
    transition: {
      ...(i > 0 ? { in: 'fade' } : {}),
      ...(i < count - 1 ? { out: 'fade' } : {}),
    },
  }));
}

function buildImageClipsWithEffects(images: string[], totalDuration: number, effects: string[]): ShotstackClip[] {
  const count = images.length;
  const seg = totalDuration / count;
  return images.map((src, i) => ({
    asset: { type: 'image', src },
    start: +(i * seg).toFixed(2),
    length: +seg.toFixed(2),
    scale: 0.42,
    position: 'right' as const,
    offset: { x: -0.03, y: 0 },
    effect: effects[i % effects.length],
    transition: {
      ...(i > 0 ? { in: 'fade' } : {}),
      ...(i < count - 1 ? { out: 'fade' } : {}),
    },
  }));
}

export async function uploadImageToIngest(dataUri: string): Promise<string> {
  const res = await fetch(`${SHOTSTACK_BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ url: dataUri }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shotstack ingest error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.response.attributes.url as string;
}

export async function submitRender(payload: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${SHOTSTACK_BASE}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shotstack submit error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.response.id as string;
}

export interface RenderStatus {
  status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed';
  url?: string;
  error?: string;
}

export async function getRenderStatus(renderId: string): Promise<RenderStatus> {
  const res = await fetch(`${SHOTSTACK_BASE}/render/${renderId}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shotstack status error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const r = data.response;
  const rawError = r.error;
  const error = rawError
    ? typeof rawError === 'string'
      ? rawError
      : (rawError as { message?: string }).message || JSON.stringify(rawError)
    : undefined;
  return { status: r.status, url: r.url ?? undefined, error };
}

export function buildBoldEnergyPayload(
  product: ProductInput,
  analysis: GeminiAnalysis,
  audioUrl?: string,
) {
  const images = product.images.slice(0, 5).map(normalizeImageUrl);
  const totalDuration = 20;

  // Full-frame: image fills entire canvas — visually distinct from Template 1's portrait layout
  const count = images.length;
  const seg = totalDuration / count;
  const imageClips: ShotstackClip[] = images.map((src, i) => ({
    asset: { type: 'image', src },
    start: +(i * seg).toFixed(2),
    length: +seg.toFixed(2),
    scale: 1.0,
    position: 'center' as const,
    transition: {
      ...(i > 0 ? { in: 'fade' } : {}),
      ...(i < count - 1 ? { out: 'fade' } : {}),
    },
  }));

  // Heavy bottom vignette for text readability over full-frame image
  const overlayClip: ShotstackClip = {
    asset: {
      type: 'html',
      html: `<div style="width:1280px;height:720px;background:linear-gradient(to top,rgba(5,5,5,0.96) 0%,rgba(5,5,5,0.55) 30%,rgba(5,5,5,0) 55%);"></div>`,
      width: 1280,
      height: 720,
    },
    start: 0,
    length: totalDuration,
  };

  const voiceoverClip: ShotstackClip = audioUrl
    ? { asset: { type: 'audio', src: audioUrl, volume: 1 }, start: 0, length: totalDuration }
    : {
        asset: { type: 'text-to-speech', text: analysis.voiceover, voice: 'Matthew', newscaster: true },
        start: 0,
        length: totalDuration,
      };

  // All text centered at bottom — movie-poster layout
  const textClips: ShotstackClip[] = [
    {
      asset: {
        type: 'html',
        html: `<div style="text-align:center;width:1000px;"><span style="font-family:'Arial Black',Arial,sans-serif;font-size:54px;font-weight:900;color:#ffffff;line-height:1.1;">${product.title}</span></div>`,
        width: 1000,
        height: 120,
      },
      start: 1.0,
      length: totalDuration - 1.0,
      position: 'bottom',
      offset: { x: 0, y: 0.23 },
      transition: { in: 'fade' },
    },
    {
      asset: {
        type: 'html',
        html: `<div style="text-align:center;width:800px;"><span style="display:inline-block;font-family:'Arial Black',Arial,sans-serif;font-size:32px;font-weight:900;color:#fff;margin-right:18px;vertical-align:middle;">\$${product.price}</span><span style="display:inline-block;font-family:'Arial Black',Arial,sans-serif;font-size:17px;font-weight:700;color:#fff;background:#1A56DB;padding:10px 24px;border-radius:50px;vertical-align:middle;">Shop Now →</span></div>`,
        width: 800,
        height: 68,
      },
      start: 7.0,
      length: totalDuration - 7.0,
      position: 'bottom',
      offset: { x: 0, y: 0.09 },
      transition: { in: 'fade' },
    },
  ];

  const tracks: ShotstackTrack[] = [
    { clips: textClips },
    { clips: [voiceoverClip] },
    { clips: [overlayClip] },
    { clips: imageClips },
  ];

  return {
    timeline: { tracks },
    output: { format: 'mp4', resolution: 'hd', fps: 30, quality: 'high', size: { width: 1280, height: 720 } },
  };
}

export function buildCleanMinimalPayload(
  product: ProductInput,
  analysis: GeminiAnalysis,
  audioUrl?: string,
) {
  const images = product.images.slice(0, 5).map(normalizeImageUrl);
  const totalDuration = 20;

  // Same right-side image positioning as Template 1 — no zoom effects, no overflow
  const imageClips = buildImageClips(images, totalDuration);

  // Solid off-white panel on left — provides opaque background for dark text (no transparency issues)
  const panelClip: ShotstackClip = {
    asset: {
      type: 'html',
      html: `<div style="width:560px;height:720px;background:#F5F5F0;"></div>`,
      width: 560,
      height: 720,
    },
    start: 0,
    length: totalDuration,
    position: 'left',
  };

  const voiceoverClip: ShotstackClip = audioUrl
    ? { asset: { type: 'audio', src: audioUrl, volume: 1 }, start: 0, length: totalDuration }
    : {
        asset: { type: 'text-to-speech', text: analysis.voiceover, voice: 'Joanna' },
        start: 0,
        length: totalDuration,
      };

  const textClips: ShotstackClip[] = [
    {
      asset: {
        type: 'html',
        html: `<span style="display:inline-block;font-family:Georgia,serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#888888;">NEW ARRIVAL</span>`,
        width: 460,
        height: 28,
      },
      start: 0.8,
      length: totalDuration - 0.8,
      position: 'topLeft',
      offset: { x: 0.05, y: -0.04 },
      transition: { in: 'fade' },
    },
    {
      asset: {
        type: 'html',
        html: `<span style="display:block;font-family:Georgia,'Times New Roman',serif;font-size:44px;font-weight:700;color:#111111;line-height:1.2;">${product.title}</span>`,
        width: 480,
        height: 160,
      },
      start: 1.0,
      length: totalDuration - 1.0,
      position: 'topLeft',
      offset: { x: 0.05, y: -0.01 },
      transition: { in: 'fade' },
    },
    {
      asset: {
        type: 'html',
        html: `<div style="width:36px;height:3px;background:#111111;"></div>`,
        width: 80,
        height: 6,
      },
      start: 1.5,
      length: totalDuration - 1.5,
      position: 'topLeft',
      offset: { x: 0.05, y: 0.15 },
      transition: { in: 'fade' },
    },
    {
      asset: {
        type: 'html',
        html: `<span style="display:inline-block;font-family:Georgia,serif;font-size:30px;font-weight:700;color:#16A34A;">\$${product.price}</span>`,
        width: 220,
        height: 54,
      },
      start: 7.0,
      length: totalDuration - 7.0,
      position: 'bottomLeft',
      offset: { x: 0.05, y: 0.18 },
      transition: { in: 'fade' },
    },
    {
      asset: {
        type: 'html',
        html: `<span style="display:inline-block;font-family:Georgia,serif;font-size:15px;font-weight:600;color:#ffffff;background:#111111;padding:10px 26px;border-radius:50px;letter-spacing:0.04em;">Discover More</span>`,
        width: 260,
        height: 56,
      },
      start: 11.0,
      length: totalDuration - 11.0,
      position: 'bottomLeft',
      offset: { x: 0.05, y: 0.10 },
      transition: { in: 'fade' },
    },
  ];

  const tracks: ShotstackTrack[] = [
    { clips: textClips },
    { clips: [voiceoverClip] },
    { clips: [panelClip] },
    { clips: imageClips },
  ];

  return {
    timeline: { tracks },
    output: { format: 'mp4', resolution: 'hd', fps: 30, quality: 'high', size: { width: 1280, height: 720 } },
  };
}
