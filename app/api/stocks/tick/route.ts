import { NextRequest, NextResponse } from 'next/server';

const SPARK_URL = 'https://query1.finance.yahoo.com/v7/finance/spark';
const MAX_SYMBOLS = 80;
const SPARK_CHUNK = 20; // Yahoo rejects spark requests with more than 20 symbols
const SYMBOL_RE = /^[A-Z0-9.^&-]{1,16}$/; // '&' in M&M.NS, '^' in index symbols

// Yahoo rejects some requests without a browser UA.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  Accept: 'application/json',
};

export interface TickPoint {
  symbol: string;
  price: number;
  prevClose: number | null;
  time: number; // epoch seconds of the exchange's last update
}

interface SparkMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketTime?: number;
}

interface SparkResult {
  symbol?: string;
  response?: { meta?: SparkMeta }[];
}

// The spark endpoint answers up to 20 symbols per upstream call, so the
// 10s polling loop costs a handful of requests for the whole universe.
async function fetchChunk(symbols: string[]): Promise<TickPoint[]> {
  const url = `${SPARK_URL}?symbols=${encodeURIComponent(symbols.join(','))}&range=1d&interval=15m`;
  try {
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const out: TickPoint[] = [];
    for (const r of (json?.spark?.result ?? []) as SparkResult[]) {
      const meta = r.response?.[0]?.meta;
      if (!r.symbol || typeof meta?.regularMarketPrice !== 'number') continue;
      const prev =
        typeof meta.previousClose === 'number'
          ? meta.previousClose
          : typeof meta.chartPreviousClose === 'number'
            ? meta.chartPreviousClose
            : null;
      out.push({
        symbol: r.symbol,
        price: meta.regularMarketPrice,
        prevClose: prev,
        time: meta.regularMarketTime ?? Math.floor(Date.now() / 1000),
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const raw = new URL(request.url).searchParams.get('symbols') ?? '';
  const symbols = [
    ...new Set(
      raw
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => SYMBOL_RE.test(s)),
    ),
  ].slice(0, MAX_SYMBOLS);

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No valid symbols provided.' }, { status: 400 });
  }

  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += SPARK_CHUNK) {
    chunks.push(symbols.slice(i, i + SPARK_CHUNK));
  }
  const batches = await Promise.all(chunks.map(fetchChunk));
  const results = batches.flat();

  if (results.length === 0) {
    return NextResponse.json({ error: 'Live feed unavailable.' }, { status: 502 });
  }
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } });
}
