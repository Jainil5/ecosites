import { NextResponse } from 'next/server';
import { STOCKS } from '@/components/sites/stock-screener/data';
import { buildScorecard, type Scorecard } from '@/components/sites/stock-screener/analytics';
import { fetchBatch } from '@/components/sites/stock-screener/yahoo';

const TTL_MS = 60_000;

let cache: { at: number; cards: Scorecard[] } | null = null;
let inflight: Promise<Scorecard[]> | null = null;

// One sweep serves every visitor: the Trends and Analysis pages would
// otherwise each ask the browser to pull the same 52 symbols.
async function sweep(): Promise<Scorecard[]> {
  const points = await fetchBatch(
    STOCKS.map((s) => s.symbol),
    '1y',
    '1d',
  );
  const bySymbol = new Map(points.map((p) => [p.symbol, p]));
  return STOCKS.map((meta) => buildScorecard(meta, bySymbol.get(meta.symbol))).filter(
    (c): c is Scorecard => c != null,
  );
}

async function getCards(): Promise<{ at: number; cards: Scorecard[] }> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache;
  inflight ??= sweep().finally(() => {
    inflight = null;
  });
  const cards = await inflight;
  if (cards.length > 0) {
    cache = { at: Date.now(), cards };
    return cache;
  }
  // A dead feed is not cached: the next request tries again immediately.
  return { at: Date.now(), cards: [] };
}

export async function GET() {
  const { at, cards } = await getCards();
  return NextResponse.json(
    { ok: cards.length > 0, asOf: at, cards },
    {
      headers: {
        'Cache-Control': cards.length ? 'public, s-maxage=60, stale-while-revalidate=300' : 'no-store',
      },
    },
  );
}
