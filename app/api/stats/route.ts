import { NextResponse } from 'next/server';
import { getStats } from '../../../lib/metrics';

// Read-only endpoint exposing the north-star metric and supporting rollups.
// Response shape: see Stats in lib/metrics.ts.
//
// Designed for two consumers:
//   1. /stats UI page (server-side fetch on first paint, client refresh)
//   2. Future external dashboards (e.g. a Notion or Slack daily digest)
//
// When the KV integration isn't provisioned (no KV_REST_API_URL env var) the
// endpoint returns the zero-state with configured:false so the UI can show a
// "Metrics not configured yet" banner instead of a crash.
//
// Default Next.js behaviour for GET handlers is no caching, which is what we
// want — every reload should reflect the latest events.
export async function GET() {
  const stats = await getStats();
  return NextResponse.json(stats);
}
