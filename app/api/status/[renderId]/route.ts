import { NextRequest, NextResponse } from 'next/server';
import { getRenderStatus } from '../../../../lib/shotstack';

// Shotstack render IDs are v4 UUIDs. Rejecting non-conforming inputs up front
// avoids leaking the upstream "Bad Request" error message and lets us return a
// clean 400 to the caller without making a network round trip.
const RENDER_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ renderId: string }> }
) {
  const { renderId } = await params;

  if (!RENDER_ID_RE.test(renderId)) {
    return NextResponse.json(
      { error: 'Invalid render ID format. Expected a UUID.' },
      { status: 400 }
    );
  }

  try {
    const status = await getRenderStatus(renderId);
    return NextResponse.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Shotstack returns 400 for unknown render IDs and 404 for explicitly missing
    // ones. Either way the right response to the UI is 404 with a clean message;
    // anything else upstream is a 502 because the failure isn't ours.
    if (/status error 4(00|04)/i.test(message)) {
      return NextResponse.json(
        { error: 'Render not found. The ID may have expired or never existed.' },
        { status: 404 }
      );
    }
    console.error('[status] upstream error:', message);
    return NextResponse.json(
      { error: 'Could not retrieve render status. Try again in a moment.' },
      { status: 502 }
    );
  }
}
