import type { GeminiAnalysis, ProductInput } from './gemini';

const SHOTSTACK_BASE = 'https://api.shotstack.io/edit/stage';
const API_KEY = process.env.SHOTSTACK_API_KEY ?? '';

interface ShotstackClip {
  asset: Record<string, unknown>;
  start: number;
  length: number;
  effect?: string;
  transition?: { in?: string; out?: string };
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
    start: 0.5,
    length: totalDuration - 0.5,
  };

  const textClips: ShotstackClip[] = [
    {
      asset: {
        type: 'html',
        html: `<p style="font-family:Arial,sans-serif;font-size:52px;font-weight:bold;color:#ffffff;background:rgba(0,0,0,0.6);padding:12px 24px;border-radius:12px;margin:0;">${product.title}</p>`,
        width: 1100,
        height: 120,
      },
      start: 1.0,
      length: totalDuration - 1.0,
      transition: { in: 'fade' },
    },
    {
      asset: {
        type: 'html',
        html: `<p style="font-family:Arial,sans-serif;font-size:36px;font-weight:bold;color:#1A56DB;background:rgba(0,0,0,0.6);padding:8px 20px;border-radius:8px;margin:0;">$${product.price}</p>`,
        width: 400,
        height: 80,
      },
      start: 8.0,
      length: totalDuration - 8.0,
      transition: { in: 'fade' },
    },
    {
      asset: {
        type: 'html',
        html: `<p style="font-family:Arial,sans-serif;font-size:24px;font-weight:bold;color:#ffffff;background:#1A56DB;padding:10px 24px;border-radius:50px;margin:0;">Shop Now →</p>`,
        width: 260,
        height: 60,
      },
      start: 14.0,
      length: totalDuration - 14.0,
      transition: { in: 'fade' },
    },
  ];

  const tracks: ShotstackTrack[] = [
    { clips: textClips },
    { clips: [voiceoverClip] },
    { clips: imageClips },
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

  if (count === 1) {
    return [
      { asset: { type: 'image', src: images[0] }, start: 0, length: totalDuration, effect: 'zoomIn' },
    ];
  }

  if (count === 2) {
    const half = totalDuration / 2;
    return [
      { asset: { type: 'image', src: images[0] }, start: 0, length: half, effect: 'zoomIn', transition: { out: 'fade' } },
      { asset: { type: 'image', src: images[1] }, start: half, length: half, effect: 'zoomOut', transition: { in: 'fade' } },
    ];
  }

  const seg = totalDuration / 3;
  return [
    { asset: { type: 'image', src: images[0] }, start: 0, length: seg, effect: 'zoomIn', transition: { out: 'fade' } },
    { asset: { type: 'image', src: images[1] }, start: seg, length: seg, effect: 'slideLeft', transition: { in: 'fade', out: 'fade' } },
    { asset: { type: 'image', src: images[2] }, start: seg * 2, length: seg, effect: 'zoomOut', transition: { in: 'fade' } },
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
  return { status: r.status, url: r.url ?? undefined, error: r.error ?? undefined };
}
