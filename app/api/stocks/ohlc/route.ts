import { NextRequest, NextResponse } from 'next/server';
import type { Candle } from '@/components/sites/stock-screener/types';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const SYMBOL_RE = /^[A-Z0-9._&-]{1,16}$/;

// Yahoo rejects some requests without a browser UA but rate-limits long ones.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  Accept: 'application/json',
};

// TradingView-style timeframes mapped to Yahoo range/interval pairs.
// '1D' uses 2d/15m: Yahoo returns an empty 1d/5m series after market close.
const TF: Record<string, { range: string; interval: string; lastSession?: boolean }> = {
  '1D': { range: '2d', interval: '15m', lastSession: true },
  '5D': { range: '5d', interval: '30m' },
  '1M': { range: '1mo', interval: '1h' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function round2(n: number | null | undefined): number | null {
  return typeof n === 'number' && Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

async function fetchCandles(symbol: string, range: string, interval: string) {
  const url = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        if (result && !json?.chart?.error) {
          const meta = result.meta ?? {};
          const quote = result.indicators?.quote?.[0] ?? {};
          const ts: (number | null)[] = Array.isArray(result.timestamp) ? result.timestamp : [];
          const opens: (number | null)[] = Array.isArray(quote.open) ? quote.open : [];
          const highs: (number | null)[] = Array.isArray(quote.high) ? quote.high : [];
          const lows: (number | null)[] = Array.isArray(quote.low) ? quote.low : [];
          const closes: (number | null)[] = Array.isArray(quote.close) ? quote.close : [];
          const vols: (number | null)[] = Array.isArray(quote.volume) ? quote.volume : [];
          const candles: Candle[] = [];
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const o = round2(opens[i]);
            const h = round2(highs[i]);
            const l = round2(lows[i]);
            const c = round2(closes[i]);
            if (t == null || o == null || h == null || l == null || c == null) continue;
            candles.push({ t, o, h, l, c, v: vols[i] ?? 0 });
          }
          const dayChange = meta.fulldayChange ?? meta.regularMarketChange;
          const prevClose =
            typeof meta.regularMarketPrice === 'number' && typeof dayChange === 'number'
              ? Math.round((meta.regularMarketPrice - dayChange) * 100) / 100
              : (meta.chartPreviousClose ?? meta.previousClose);
          return { candles, prevClose, currency: meta.currency };
        }
      } else if (res.status === 429 && attempt === 0) {
        await sleep(400);
        continue;
      }
      return null;
    } catch {
      if (attempt === 0) {
        await sleep(400);
        continue;
      }
      return null;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const symbol = (params.get('symbol') ?? '').trim().toUpperCase();
  const tf = (params.get('tf') ?? '1M').toUpperCase();

  if (!SYMBOL_RE.test(symbol)) {
    return NextResponse.json({ error: 'Invalid symbol.' }, { status: 400 });
  }
  const conf = TF[tf];
  if (!conf) {
    return NextResponse.json({ error: 'Invalid timeframe.' }, { status: 400 });
  }

  const data = await fetchCandles(symbol, conf.range, conf.interval);
  if (!data || data.candles.length === 0) {
    return NextResponse.json({ ok: false, candles: [] });
  }
  let candles = data.candles;
  if (conf.lastSession) {
    // Keep only the most recent IST trading day (NSE offset is fixed +05:30).
    const IST_DAY = 5.5 * 3600;
    const lastDay = Math.floor((candles[candles.length - 1].t + IST_DAY) / 86400);
    candles = candles.filter((c) => Math.floor((c.t + IST_DAY) / 86400) === lastDay);
  }
  return NextResponse.json(
    { ok: true, symbol, tf, candles, prevClose: data.prevClose, currency: data.currency },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } },
  );
}
