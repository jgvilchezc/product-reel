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

const IMAGE_EXT_RE = /\.(jpg|jpeg|png|gif|webp|bmp|tiff|avif)(\?|#|$)/i;

function normalizeImageUrl(url: string): string {
  // Shotstack checks the URL path for a file extension — query params don't count.
  // Insert .jpg before the query string so the path ends with a known extension.
  if (!IMAGE_EXT_RE.test(url)) {
    const [base, rest] = url.split('?');
    return rest ? `${base}.jpg?${rest}` : `${base}.jpg`;
  }
  return url;
}

export function buildRenderPayload(product: ProductInput, analysis: GeminiAnalysis) {
  const images = product.images.slice(0, 3).map(normalizeImageUrl);
  const totalDuration = 20;

  const imageClips = buildImageClips(images, totalDuration);

  const backgroundClip: ShotstackClip = {
    asset: {
      type: 'text-to-image',
      prompt: analysis.background_prompt,
      width: 1280,
      height: 768,
    },
    start: 0,
    length: totalDuration,
    effect: 'zoomIn',
    transition: { in: 'fade', out: 'fade' },
  };

  const voiceoverClip: ShotstackClip = {
    asset: {
      type: 'text-to-speech',
      text: analysis.voiceover,
      voice: 'Joanna',
      newscaster: true,
    },
    start: 0,
    length: totalDuration,
  };

  // Gradient overlay — darkens the left 60% for text readability, right stays lighter for product
  const overlayClip: ShotstackClip = {
    asset: {
      type: 'html',
      html: `<div style="width:1280px;height:720px;background:linear-gradient(to right,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.45) 55%,rgba(0,0,0,0.1) 100%);"></div>`,
      width: 1280,
      height: 720,
    },
    start: 0,
    length: totalDuration,
  };

  const textClips: ShotstackClip[] = [
    // Title — top left
    {
      asset: {
        type: 'html',
        html: `<p style="font-family:'Arial Black',Arial,sans-serif;font-size:46px;font-weight:900;color:#ffffff;text-shadow:0 2px 12px rgba(0,0,0,0.9);margin:0;line-height:1.15;">${product.title}</p>`,
        width: 660,
        height: 130,
      },
      start: 1.0,
      length: totalDuration - 1.0,
      position: 'topLeft',
      offset: { x: 0.04, y: -0.07 },
      transition: { in: 'fade' },
    },
    // Price — bottom left, appears mid-video
    {
      asset: {
        type: 'html',
        html: `<p style="font-family:Arial,sans-serif;font-size:48px;font-weight:bold;color:#ffffff;text-shadow:0 2px 8px rgba(0,0,0,0.9);margin:0;">\$${product.price}</p>`,
        width: 300,
        height: 80,
      },
      start: 8.0,
      length: totalDuration - 8.0,
      position: 'bottomLeft',
      offset: { x: 0.04, y: 0.18 },
      transition: { in: 'fade' },
    },
    // CTA — bottom left, below price
    {
      asset: {
        type: 'html',
        html: `<p style="font-family:Arial,sans-serif;font-size:24px;font-weight:bold;color:#ffffff;background:#1A56DB;padding:12px 28px;border-radius:50px;margin:0;display:inline-block;">Shop Now →</p>`,
        width: 240,
        height: 60,
      },
      start: 14.0,
      length: totalDuration - 14.0,
      position: 'bottomLeft',
      offset: { x: 0.04, y: 0.07 },
      transition: { in: 'fade' },
    },
  ];

  const tracks: ShotstackTrack[] = [
    { clips: textClips },
    { clips: [voiceoverClip] },
    { clips: imageClips },
    { clips: [overlayClip] },
    { clips: [backgroundClip] },
  ];

  return {
    timeline: { tracks },
    output: {
      format: 'mp4',
      resolution: 'hd',
      fps: 30,
      quality: 'high',
      size: { width: 1280, height: 720 },
    },
  };
}

function buildImageClips(images: string[], totalDuration: number): ShotstackClip[] {
  const count = images.length;
  // Product images sit on the right side, scaled to ~45% of frame width so portrait
  // shots aren't cropped. The right anchor + negative x-offset gives breathing room.
  const baseClip = (src: string) => ({
    asset: { type: 'image', src },
    scale: 0.48,
    position: 'right' as const,
    offset: { x: -0.03, y: 0 },
  });

  if (count === 1) {
    return [{ ...baseClip(images[0]), start: 0, length: totalDuration, effect: 'zoomIn' }];
  }

  if (count === 2) {
    const half = totalDuration / 2;
    return [
      { ...baseClip(images[0]), start: 0, length: half, effect: 'zoomIn', transition: { out: 'fade' } },
      { ...baseClip(images[1]), start: half, length: half, effect: 'zoomOut', transition: { in: 'fade' } },
    ];
  }

  const seg = totalDuration / 3;
  return [
    { ...baseClip(images[0]), start: 0, length: seg, effect: 'zoomIn', transition: { out: 'fade' } },
    { ...baseClip(images[1]), start: seg, length: seg, effect: 'zoomIn', transition: { in: 'fade', out: 'fade' } },
    { ...baseClip(images[2]), start: seg * 2, length: seg, effect: 'zoomOut', transition: { in: 'fade' } },
  ];
}

export async function submitRender(payload: ReturnType<typeof buildRenderPayload>): Promise<string> {
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
