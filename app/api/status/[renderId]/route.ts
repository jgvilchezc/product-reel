import { NextRequest, NextResponse } from 'next/server';
import { getRenderStatus } from '../../../../lib/shotstack';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ renderId: string }> }
) {
  const { renderId } = await params;

  try {
    const status = await getRenderStatus(renderId);
    return NextResponse.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
