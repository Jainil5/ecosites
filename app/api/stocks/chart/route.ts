import { NextRequest, NextResponse } from 'next/server';
import type { ChartPoint } from '@/components/sites/stock-screener/types';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const MAX_SYMBOLS = 60;
const CONCURRENCY = 8;
const SYMBOL_RE = /^[A-Z0-9.^&-]{1,16}$/; // '&' in M&M.NS, '^' in index symbols

// Yahoo rejects some requests without a browser UA but rate-limits long ones.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  Accept: 'application/json',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchChart(symbol: string, range: string, interval: string): Promise<ChartPoint> {
  const url = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
  // Yahoo 429s intermittently per-IP; one short retry clears most bursts.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        const error = json?.chart?.error;
        if (result && !error) {
          const meta = result.meta ?? {};
          const quote = result.indicators?.quote?.[0] ?? {};
          const rawCloses: (number | null)[] = Array.isArray(quote.close) ? quote.close : [];
          const closes = rawCloses.map((c) => (typeof c === 'number' ? Math.round(c * 100) / 100 : null));
          // meta.fulldayChange is today's move; price minus it gives last close.
          const dayChange = meta.fulldayChange ?? meta.regularMarketChange;
          const prevClose =
            typeof meta.regularMarketPrice === 'number' && typeof dayChange === 'number'
              ? Math.round((meta.regularMarketPrice - dayChange) * 100) / 100
              : (meta.chartPreviousClose ?? meta.previousClose);
          return {
            symbol,
            ok: true,
            price: meta.regularMarketPrice,
            prevClose,
            dayHigh: meta.regularMarketDayHigh,
            dayLow: meta.regularMarketDayLow,
            volume: meta.regularMarketVolume,
            week52High: meta.fiftyTwoWeekHigh,
            week52Low: meta.fiftyTwoWeekLow,
            currency: meta.currency,
            marketState: meta.marketState,
            timestamps: Array.isArray(result.timestamp) ? result.timestamp : [],
            closes,
          };
        }
      } else if (res.status === 429 && attempt === 0) {
        await sleep(400);
        continue;
      }
      return { symbol, ok: false };
    } catch {
      if (attempt === 0) {
        await sleep(400);
        continue;
      }
      return { symbol, ok: false };
    }
  }
  return { symbol, ok: false };
}

async function fetchBatch(symbols: string[], range: string, interval: string) {
  const results: ChartPoint[] = new Array(symbols.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, symbols.length) }, async () => {
    while (cursor < symbols.length) {
      const i = cursor++;
      results[i] = await fetchChart(symbols[i], range, interval);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const raw = params.get('symbols') ?? '';
  const symbols = raw
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => SYMBOL_RE.test(s));
  const range = params.get('range') ?? '1y';
  const valid = range === '1y' || range === '2d';
  const effective = valid ? range : '1y';
  const interval = effective === '2d' ? '15m' : '1d';

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No valid symbols provided.' }, { status: 400 });
  }

  const results = await fetchBatch(symbols.slice(0, MAX_SYMBOLS), range, interval);

  return NextResponse.json(
    { results },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  );
}
