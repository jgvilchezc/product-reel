// Render-event metrics backed by Vercel KV. Two sorted-set keys:
//   renders:events            score = unix-ms timestamp, member = JSON of the event
//   renders:store:<domain>    score = unix-ms timestamp, member = renderId
// The first lets us query global rollups (count, count-by-time-window, distinct
// stores in a window). The second lets us inspect a single store in isolation.
//
// All functions degrade silently when KV isn't configured (i.e. when the
// KV_REST_API_URL / KV_REST_API_TOKEN env vars are missing). That way the build
// works in any environment, and metrics simply don't record locally or in a
// preview deploy that hasn't been linked to a KV instance. The cost of this is
// a per-call check; the benefit is no production-breaking import-time crashes.
import { kv } from '@vercel/kv';

export type RenderSource = 'scrape' | 'backfill' | 'webhook';
export type RenderStatus = 'submitted' | 'done' | 'failed';

export interface RenderEvent {
  shopDomain: string;
  renderId: string;
  source: RenderSource;
  status: RenderStatus;
  timestamp: number;
}

const EVENTS_KEY = 'renders:events';
const storeKey = (domain: string) => `renders:store:${domain}`;

function kvConfigured(): boolean {
  // @vercel/kv reads KV_REST_API_URL/KV_REST_API_TOKEN at call time. We check
  // up-front so we can no-op without throwing when the integration isn't set.
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export function extractShopDomain(input: string): string {
  // Accepts either a full URL ("https://allbirds.com/products/x") or a bare
  // hostname ("allbirds.com"). Lowercase, strip "www." so two variants of the
  // same store don't double-count.
  try {
    if (input.includes('://')) {
      const u = new URL(input);
      return u.hostname.toLowerCase().replace(/^www\./, '');
    }
    return input.toLowerCase().replace(/^www\./, '').replace(/\/.*$/, '');
  } catch {
    return 'unknown';
  }
}

export async function recordRender(event: Omit<RenderEvent, 'timestamp'>): Promise<void> {
  if (!kvConfigured()) return;
  const full: RenderEvent = { ...event, timestamp: Date.now() };
  try {
    await Promise.all([
      kv.zadd(EVENTS_KEY, { score: full.timestamp, member: JSON.stringify(full) }),
      kv.zadd(storeKey(event.shopDomain), { score: full.timestamp, member: full.renderId }),
    ]);
  } catch (e) {
    // Metrics are best-effort; never break the render flow on a KV hiccup.
    console.warn('[metrics] recordRender failed:', (e as Error).message);
  }
}

export interface Stats {
  configured: boolean;
  totalRenders: number;
  rendersToday: number;
  rendersThisWeek: number;
  rendersLast30d: number;
  activeStoresLast30d: number;
  northStar: number; // renders ÷ active stores over the last 30 days
  topStores: Array<{ shopDomain: string; renders: number }>;
  recentRenders: Array<{ shopDomain: string; source: RenderSource; timestamp: number }>;
}

export async function getStats(): Promise<Stats> {
  const empty: Stats = {
    configured: false,
    totalRenders: 0,
    rendersToday: 0,
    rendersThisWeek: 0,
    rendersLast30d: 0,
    activeStoresLast30d: 0,
    northStar: 0,
    topStores: [],
    recentRenders: [],
  };
  if (!kvConfigured()) return empty;

  const now = Date.now();
  const day = now - 24 * 3600 * 1000;
  const week = now - 7 * 24 * 3600 * 1000;
  const month = now - 30 * 24 * 3600 * 1000;

  try {
    const [total, today, thisWeek, last30] = await Promise.all([
      kv.zcard(EVENTS_KEY),
      kv.zcount(EVENTS_KEY, day, '+inf'),
      kv.zcount(EVENTS_KEY, week, '+inf'),
      kv.zcount(EVENTS_KEY, month, '+inf'),
    ]);

    // Pull the events from the last 30 days to compute distinct stores + top-N.
    // For low volumes this is cheap. If we ever cross a few thousand events
    // per month, switch distinct counts to HyperLogLog and top-N to a hash.
    const recentRaw = await kv.zrange<string[]>(EVENTS_KEY, month, '+inf', {
      byScore: true,
    });

    const storeCounts = new Map<string, number>();
    const recent: Array<{ shopDomain: string; source: RenderSource; timestamp: number }> = [];
    for (const raw of recentRaw) {
      try {
        const evt: RenderEvent = typeof raw === 'string' ? JSON.parse(raw) : (raw as RenderEvent);
        storeCounts.set(evt.shopDomain, (storeCounts.get(evt.shopDomain) || 0) + 1);
        recent.push({ shopDomain: evt.shopDomain, source: evt.source, timestamp: evt.timestamp });
      } catch {
        // Skip malformed members rather than fail the whole stats call.
      }
    }
    recent.sort((a, b) => b.timestamp - a.timestamp);

    const topStores = Array.from(storeCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([shopDomain, renders]) => ({ shopDomain, renders }));

    const activeStoresLast30d = storeCounts.size;
    const northStar = activeStoresLast30d > 0 ? last30 / activeStoresLast30d : 0;

    return {
      configured: true,
      totalRenders: total,
      rendersToday: today,
      rendersThisWeek: thisWeek,
      rendersLast30d: last30,
      activeStoresLast30d,
      northStar,
      topStores,
      recentRenders: recent.slice(0, 20),
    };
  } catch (e) {
    console.warn('[metrics] getStats failed:', (e as Error).message);
    return empty;
  }
}
