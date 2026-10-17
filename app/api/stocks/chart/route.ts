import { NextRequest, NextResponse } from 'next/server';
import { fetchBatch } from '@/components/sites/stock-screener/yahoo';

const MAX_SYMBOLS = 60;
const SYMBOL_RE = /^[A-Z0-9.^&-]{1,16}$/; // '&' in M&M.NS, '^' in index symbols

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const raw = params.get('symbols') ?? '';
  const symbols = raw
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => SYMBOL_RE.test(s));
  const range = params.get('range') ?? '1y';
  const effective = range === '1y' || range === '2d' ? range : '1y';
  const interval = effective === '2d' ? '15m' : '1d';

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No valid symbols provided.' }, { status: 400 });
  }

  const results = await fetchBatch(symbols.slice(0, MAX_SYMBOLS), effective, interval);

  return NextResponse.json(
    { results },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  );
}
