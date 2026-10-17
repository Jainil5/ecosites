import type { ChartPoint } from './types';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const CONCURRENCY = 8;

// Yahoo rejects some requests without a browser UA but rate-limits long ones.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  Accept: 'application/json',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchChart(symbol: string, range: string, interval: string): Promise<ChartPoint> {
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

export async function fetchBatch(symbols: string[], range: string, interval: string): Promise<ChartPoint[]> {
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
