import type { ChartPoint } from './types';
import type { StockMeta } from './data';
import { lastSma, rsi, trendSignal, type TrendSignal } from './indicators';
import { changePct } from './format';

/** Look-back windows the Trends and Analysis pages publish, shortest first. */
export const WINDOWS = [
  { key: '1D', days: 1, label: '1D' },
  { key: '1W', days: 7, label: '1W' },
  { key: '1M', days: 30, label: '1M' },
  { key: '3M', days: 91, label: '3M' },
  { key: '6M', days: 182, label: '6M' },
  { key: '1Y', days: 365, label: '1Y' },
] as const;

export type WindowKey = (typeof WINDOWS)[number]['key'];
export type Returns = Record<WindowKey, number | null>;

/** Moves smaller than this count as unchanged, matching the breadth cards. */
export const BREADTH_EPS = 0.05;

const DAY_SECONDS = 86_400;

export interface Scorecard {
  symbol: string;
  name: string;
  sector: string;
  mcapCr: number;
  price: number;
  /** Session move against the previous close. */
  change: number | null;
  volume?: number;
  rsi: number | null;
  sma50: number | null;
  sma200: number | null;
  trend: TrendSignal;
  /** Where the price sits in the 52-week range, 0-100. */
  pos52: number | null;
  returns: Returns;
}

export interface Breadth {
  total: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  aboveSma50: number;
  aboveSma200: number;
  bullish: number;
  bearish: number;
  neutral: number;
  avgChange: number;
}

export interface SectorRow {
  sector: string;
  count: number;
  advancers: number;
  decliners: number;
  returns: Returns;
}

export function changeOver(
  closes: (number | null)[],
  timestamps: number[],
  days: number,
): number | null {
  if (closes.length === 0 || timestamps.length !== closes.length) return null;
  const cutoff = timestamps[timestamps.length - 1] - days * DAY_SECONDS;
  let first = 0;
  let last = 0;
  let seen = 0;
  for (let i = 0; i < closes.length; i++) {
    const c = closes[i];
    if (c == null || timestamps[i] < cutoff) continue;
    if (seen === 0) first = c;
    last = c;
    seen++;
  }
  // One reading is not a change, and a zero base would divide to infinity.
  if (seen < 2 || first === 0) return null;
  return ((last - first) / first) * 100;
}

export function rangePosition(
  price: number | undefined,
  low: number | undefined,
  high: number | undefined,
): number | null {
  if (price == null || low == null || high == null || high <= low) return null;
  return Math.min(Math.max(((price - low) / (high - low)) * 100, 0), 100);
}

function emptyReturns(): Returns {
  return { '1D': null, '1W': null, '1M': null, '3M': null, '6M': null, '1Y': null };
}

export function buildScorecard(meta: StockMeta, quote: ChartPoint | undefined): Scorecard | null {
  if (!quote?.ok || quote.price == null) return null;
  const closes = quote.closes ?? [];
  const timestamps = quote.timestamps ?? [];
  const history = closes.filter((c): c is number => c != null);
  const change = changePct(quote.price, quote.prevClose);

  const returns = emptyReturns();
  // The session move comes from the live quote; Yahoo's daily stamps skip
  // weekends, so a series-derived 1D figure would read null every Monday.
  returns['1D'] = change ?? changeOver(closes, timestamps, 1);
  for (const w of WINDOWS) {
    if (w.key === '1D') continue;
    returns[w.key] = changeOver(closes, timestamps, w.days);
  }

  const sma50 = lastSma(history, 50);
  const sma200 = lastSma(history, 200);
  return {
    symbol: meta.symbol,
    name: meta.name,
    sector: meta.sector,
    mcapCr: meta.mcapCr,
    price: quote.price,
    change,
    volume: quote.volume,
    rsi: rsi(history, 14),
    sma50,
    sma200,
    trend: trendSignal(quote.price, sma50, sma200),
    pos52: rangePosition(quote.price, quote.week52Low, quote.week52High),
    returns,
  };
}

export function breadth(cards: Scorecard[]): Breadth {
  const out: Breadth = {
    total: cards.length,
    advancers: 0,
    decliners: 0,
    unchanged: 0,
    aboveSma50: 0,
    aboveSma200: 0,
    bullish: 0,
    bearish: 0,
    neutral: 0,
    avgChange: 0,
  };
  let sum = 0;
  let counted = 0;
  for (const c of cards) {
    if (c.change != null) {
      sum += c.change;
      counted++;
      if (c.change > BREADTH_EPS) out.advancers++;
      else if (c.change < -BREADTH_EPS) out.decliners++;
      else out.unchanged++;
    }
    if (c.sma50 != null && c.price > c.sma50) out.aboveSma50++;
    if (c.sma200 != null && c.price > c.sma200) out.aboveSma200++;
    if (c.trend === 'bullish') out.bullish++;
    else if (c.trend === 'bearish') out.bearish++;
    else out.neutral++;
  }
  out.avgChange = counted ? sum / counted : 0;
  return out;
}

function average(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function sectorRows(cards: Scorecard[]): SectorRow[] {
  const groups = new Map<string, Scorecard[]>();
  for (const c of cards) {
    const list = groups.get(c.sector);
    if (list) list.push(c);
    else groups.set(c.sector, [c]);
  }
  const rows: SectorRow[] = [];
  for (const [sector, members] of groups) {
    const returns = emptyReturns();
    for (const w of WINDOWS) {
      returns[w.key] = average(members.map((m) => m.returns[w.key]));
    }
    rows.push({
      sector,
      count: members.length,
      advancers: members.filter((m) => (m.change ?? 0) > BREADTH_EPS).length,
      decliners: members.filter((m) => (m.change ?? 0) < -BREADTH_EPS).length,
      returns,
    });
  }
  return rows.sort((a, b) => (b.returns['1D'] ?? -Infinity) - (a.returns['1D'] ?? -Infinity));
}

function rank(
  cards: Scorecard[],
  value: (c: Scorecard) => number | null | undefined,
  n: number,
  dir: 'asc' | 'desc',
): Scorecard[] {
  const scored = cards
    .map((c) => ({ c, v: value(c) }))
    .filter((x): x is { c: Scorecard; v: number } => x.v != null);
  scored.sort((a, b) => (dir === 'asc' ? a.v - b.v : b.v - a.v));
  return scored.slice(0, n).map((x) => x.c);
}

export function topMovers(
  cards: Scorecard[],
  key: WindowKey,
  n: number,
  dir: 'asc' | 'desc' = 'desc',
): Scorecard[] {
  return rank(cards, (c) => c.returns[key], n, dir);
}

export function mostActive(cards: Scorecard[], n: number): Scorecard[] {
  return rank(cards, (c) => c.volume, n, 'desc');
}

/** Stocks pressing their 52-week high — the breakout watch. */
export function nearHighs(cards: Scorecard[], n: number): Scorecard[] {
  return rank(
    cards.filter((c) => (c.pos52 ?? 0) >= 90),
    (c) => c.pos52,
    n,
    'desc',
  );
}
