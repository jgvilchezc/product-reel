'use client';

// Minimal dashboard for the north-star metric. Renders /api/stats output as a
// handful of headline numbers + a top-stores table + a recent-events list.
// Deliberately simple: evidence that the measurement plumbing exists, not a
// full Mixpanel replacement.

import { useEffect, useState } from 'react';

interface Stats {
  configured: boolean;
  totalRenders: number;
  rendersToday: number;
  rendersThisWeek: number;
  rendersLast30d: number;
  activeStoresLast30d: number;
  northStar: number;
  topStores: Array<{ shopDomain: string; renders: number }>;
  recentRenders: Array<{ shopDomain: string; source: string; timestamp: number }>;
}

function formatTime(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const r = await fetch('/api/stats', { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: Stats = await r.json();
      setStats(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">ProductReel — North Star</h1>
            <p className="text-white/50 mt-1 text-sm">
              Videos rendered per active store, last 30 days. Auto-refreshes every 30s.
            </p>
          </div>
          <button
            onClick={load}
            disabled={refreshing}
            className="px-3 py-1.5 text-xs border border-white/20 rounded hover:bg-white/5 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-700 text-red-200 rounded p-4 mb-6 text-sm">
            Failed to load stats: {error}
          </div>
        )}

        {stats && !stats.configured && (
          <div className="bg-amber-950/50 border border-amber-700 text-amber-200 rounded p-4 mb-6 text-sm">
            <strong>Metrics not configured yet.</strong> The KV integration hasn&apos;t been
            wired to this deployment. Create a Vercel KV database (Project → Storage → Create
            Database → KV) and the next render will start populating numbers here.
          </div>
        )}

        {stats && (
          <>
            <div className="bg-gradient-to-br from-blue-950 to-purple-950 border border-white/10 rounded-lg p-8 mb-8">
              <div className="text-xs uppercase tracking-wide text-white/60 mb-2">North star</div>
              <div className="text-5xl font-semibold tabular-nums">
                {stats.northStar.toFixed(1)}
              </div>
              <div className="text-sm text-white/60 mt-1">
                renders per active store · last 30 days
              </div>
              <div className="text-xs text-white/40 mt-3">
                {stats.rendersLast30d} renders ÷ {stats.activeStoresLast30d} active store
                {stats.activeStoresLast30d === 1 ? '' : 's'}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Tile label="Total renders" value={stats.totalRenders} />
              <Tile label="Today" value={stats.rendersToday} />
              <Tile label="This week" value={stats.rendersThisWeek} />
              <Tile label="Active stores 30d" value={stats.activeStoresLast30d} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="border border-white/10 rounded-lg p-5">
                <h2 className="text-sm font-medium text-white/80 mb-3">
                  Top stores (last 30d)
                </h2>
                {stats.topStores.length === 0 ? (
                  <div className="text-xs text-white/40">No store activity yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {stats.topStores.map((s) => (
                        <tr key={s.shopDomain} className="border-t border-white/5">
                          <td className="py-2 text-white/90 truncate max-w-[220px]">
                            {s.shopDomain}
                          </td>
                          <td className="py-2 text-right tabular-nums text-white/70">
                            {s.renders}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section className="border border-white/10 rounded-lg p-5">
                <h2 className="text-sm font-medium text-white/80 mb-3">Recent renders</h2>
                {stats.recentRenders.length === 0 ? (
                  <div className="text-xs text-white/40">No events yet.</div>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {stats.recentRenders.map((e, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span className="text-white/70 truncate max-w-[220px]">
                          {e.shopDomain}
                        </span>
                        <span className="text-white/40">
                          {e.source} · {formatTime(e.timestamp)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <p className="text-xs text-white/30 mt-8">
              An active store is any store that has rendered at least one video in the last 30
              days. The metric only becomes meaningful once Phase 1 outreach starts producing
              installed merchants — until then most of these events come from internal tests.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-white/10 rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-wide text-white/50">{label}</div>
      <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
    </div>
  );
}
