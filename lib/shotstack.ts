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

export function buildRenderPayload(
  product: ProductInput,
  analysis: GeminiAnalysis,
  audioUrl?: string,
) {
  const images = product.images.slice(0, 5).map(normalizeImageUrl);
  const totalDuration = 20;

  // Product images fill the full frame — the product IS the hero, no random AI background
  const imageClips = buildImageClips(images, totalDuration);

  // Top and bottom gradient bands keep text readable against any product image
  const overlayClip: ShotstackClip = {
    asset: {
      type: 'html',
      html: `<div style="width:1280px;height:720px;background:linear-gradient(to bottom,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.1) 38%,rgba(0,0,0,0.1) 58%,rgba(0,0,0,0.88) 100%);"></div>`,
      width: 1280,
      height: 720,
    },
    start: 0,
    length: totalDuration,
  };

  const voiceoverClip: ShotstackClip = audioUrl
    ? {
        asset: { type: 'audio', src: audioUrl, volume: 1 },
        start: 0,
        length: totalDuration,
      }
    : {
        asset: {
          type: 'text-to-speech',
          text: analysis.voiceover,
          voice: 'Matthew',
          newscaster: true,
        },
        start: 0,
        length: totalDuration,
      };

  const textClips: ShotstackClip[] = [
    // Title — top left, sits over the darkest part of the gradient
    {
      asset: {
        type: 'html',
        html: `<p style="font-family:'Arial Black',Arial,sans-serif;font-size:48px;font-weight:900;color:#ffffff;text-shadow:0 3px 18px rgba(0,0,0,1);margin:0;text-align:left;line-height:1.15;">${product.title}</p>`,
        width: 900,
        height: 140,
      },
      start: 1.0,
      length: totalDuration - 1.0,
      position: 'topLeft',
      offset: { x: 0.04, y: -0.05 },
      transition: { in: 'fade' },
    },
    // Price — bottom left
    {
      asset: {
        type: 'html',
        html: `<p style="font-family:'Arial Black',Arial,sans-serif;font-size:56px;font-weight:900;color:#ffffff;text-shadow:0 3px 14px rgba(0,0,0,1);margin:0;">\$${product.price}</p>`,
        width: 320,
        height: 90,
      },
      start: 8.0,
      length: totalDuration - 8.0,
      position: 'bottomLeft',
      offset: { x: 0.05, y: 0.15 },
      transition: { in: 'fade' },
    },
    // CTA — bottom right
    {
      asset: {
        type: 'html',
        html: `<p style="font-family:Arial,sans-serif;font-size:26px;font-weight:bold;color:#ffffff;background:#1A56DB;padding:14px 32px;border-radius:50px;margin:0;white-space:nowrap;">Shop Now →</p>`,
        width: 260,
        height: 68,
      },
      start: 14.0,
      length: totalDuration - 14.0,
      position: 'bottomRight',
      offset: { x: -0.05, y: 0.15 },
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
    output: {
      format: 'mp4',
      resolution: 'hd',
      fps: 30,
      quality: 'high',
      size: { width: 1280, height: 720 },
    },
  };
}

const EFFECTS = ['zoomIn', 'zoomOut', 'slideLeft', 'slideRight', 'zoomIn'] as const;

function buildImageClips(images: string[], totalDuration: number): ShotstackClip[] {
  const count = images.length;
  const seg = totalDuration / count;

  return images.map((src, i) => ({
    asset: { type: 'image', src },
    start: +(i * seg).toFixed(2),
    length: +seg.toFixed(2),
    effect: EFFECTS[i % EFFECTS.length],
    transition: {
      ...(i > 0 ? { in: 'fade' } : {}),
      ...(i < count - 1 ? { out: 'fade' } : {}),
    },
  }));
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
