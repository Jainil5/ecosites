import { NextRequest, NextResponse } from 'next/server';
import { leadChannels } from '@/content/brand/links';

const PLACEMENT_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;
// A real pathname only: no query, no fragment, and no '//' that a log reader
// could mistake for a protocol-relative link.
const PATH_RE = /^\/(?:[a-z0-9_-]+(?:\/[a-z0-9_-]+)*)?$/i;

const drop = new NextResponse(null, { status: 400 });

/**
 * Write-only by design: one structured line in the server log, no store, no
 * cookie, no identity. Every field has to match a shape before it is echoed
 * back into that line, so a hostile client cannot put its own text in front of
 * whoever reads the log.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return drop;
  }
  if (!body || typeof body !== 'object') return drop;

  const { placement, channel, path } = body as Record<string, unknown>;
  if (typeof placement !== 'string' || !PLACEMENT_RE.test(placement)) return drop;
  if (typeof channel !== 'string' || !(leadChannels as readonly string[]).includes(channel)) {
    return drop;
  }
  if (typeof path !== 'string' || path.length > 120 || !PATH_RE.test(path)) return drop;

  console.info(JSON.stringify({ lead: 1, placement, channel, path, at: new Date().toISOString() }));
  return new NextResponse(null, { status: 204 });
}
