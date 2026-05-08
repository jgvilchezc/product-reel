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

  // Left-to-right gradient: left half slightly dark for text, right stays clear for product
  const overlayClip: ShotstackClip = {
    asset: {
      type: 'html',
      html: `<div style="width:1280px;height:720px;background:linear-gradient(to right,rgba(0,0,0,0.50) 0%,rgba(0,0,0,0.15) 50%,rgba(0,0,0,0) 68%);"></div>`,
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
    // Title — inline-block span so the dark background hugs only the text
    {
      asset: {
        type: 'html',
        html: `<span style="display:inline-block;font-family:'Arial Black',Arial,sans-serif;font-size:40px;font-weight:900;color:#fff;background:rgba(0,0,0,0.58);padding:10px 22px;border-radius:14px;line-height:1.25;">${product.title}</span>`,
        width: 620,
        height: 140,
      },
      start: 1.0,
      length: totalDuration - 1.0,
      position: 'topLeft',
      offset: { x: 0.04, y: -0.05 },
      transition: { in: 'fade' },
    },
    // Price — same inline-block treatment
    {
      asset: {
        type: 'html',
        html: `<span style="display:inline-block;font-family:'Arial Black',Arial,sans-serif;font-size:44px;font-weight:900;color:#fff;background:rgba(0,0,0,0.58);padding:10px 22px;border-radius:14px;line-height:1;">\$${product.price}</span>`,
        width: 280,
        height: 80,
      },
      start: 8.0,
      length: totalDuration - 8.0,
      position: 'bottomLeft',
      offset: { x: 0.04, y: 0.15 },
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
