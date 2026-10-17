import { describe, expect, it } from 'vitest';
import {
  WINDOWS,
  BREADTH_EPS,
  changeOver,
  rangePosition,
  buildScorecard,
  breadth,
  sectorRows,
  topMovers,
  mostActive,
  nearHighs,
  type Scorecard,
} from '../components/sites/stock-screener/analytics';
import type { ChartPoint } from '../components/sites/stock-screener/types';
import type { StockMeta } from '../components/sites/stock-screener/data';
import { STOCKS, symbolToSlug } from '../components/sites/stock-screener/data';
import { SECTIONS, SECTION_PATHS } from '../components/sites/stock-screener/sections';

const DAY = 86_400;
// Yahoo timestamps are epoch seconds; the last point is "now".
const NOW = 1_760_000_000;

function series(prices: number[], stepDays = 1): Pick<ChartPoint, 'timestamps' | 'closes'> {
  const n = prices.length;
  return {
    timestamps: prices.map((_, i) => NOW - (n - 1 - i) * stepDays * DAY),
    closes: prices,
  };
}

function point(over: Partial<ChartPoint> = {}): ChartPoint {
  return {
    symbol: 'TEST.NS',
    ok: true,
    price: 100,
    prevClose: 100,
    week52High: 120,
    week52Low: 80,
    volume: 1_000_000,
    ...series([90, 92, 94, 96, 98, 100]),
    ...over,
  };
}

function meta(over: Partial<StockMeta> = {}): StockMeta {
  return {
    symbol: 'TEST.NS',
    name: 'Test Co',
    sector: 'IT',
    mcapCr: 500_000,
    pe: 20,
    pb: 3,
    eps: 50,
    dy: 1,
    ...over,
  };
}

function card(over: Partial<Scorecard> = {}): Scorecard {
  return {
    symbol: 'TEST.NS',
    name: 'Test Co',
    sector: 'IT',
    mcapCr: 500_000,
    price: 100,
    change: 0,
    volume: 1_000_000,
    rsi: 55,
    sma50: 95,
    sma200: 90,
    trend: 'bullish',
    pos52: 50,
    returns: { '1D': 0, '1W': 0, '1M': 0, '3M': 0, '6M': 0, '1Y': 0 },
    ...over,
  };
}

describe('WINDOWS', () => {
  it('runs from the session move out to a year', () => {
    expect(WINDOWS.map((w) => w.key)).toEqual(['1D', '1W', '1M', '3M', '6M', '1Y']);
  });
});

describe('changeOver', () => {
  it('is null without two points inside the window', () => {
    expect(changeOver([], [], 30)).toBeNull();
    expect(changeOver([100], [NOW], 30)).toBeNull();
  });
  it('measures first-to-last close within the calendar window', () => {
    // 120 daily closes rising 1 per day; a 30-day window holds 31 of them (90 → 120).
    const prices = Array.from({ length: 120 }, (_, i) => i + 1);
    const s = series(prices);
    expect(changeOver(s.closes!, s.timestamps!, 30)).toBeCloseTo(((120 - 90) / 90) * 100, 6);
  });
  it('ignores null holes rather than shifting the window', () => {
    const s = series([100, 105, 110, 115]);
    const closes = [100, null, 110, 115] as (number | null)[];
    expect(changeOver(closes, s.timestamps!, 31)).toBeCloseTo(15, 6);
  });
  it('returns 0 for a flat window', () => {
    const s = series([50, 50, 50]);
    expect(changeOver(s.closes!, s.timestamps!, 7)).toBe(0);
  });
});

describe('rangePosition', () => {
  it('places the price along the 52-week range', () => {
    expect(rangePosition(100, 80, 120)).toBe(50);
    expect(rangePosition(120, 80, 120)).toBe(100);
  });
  it('clamps outside the range', () => {
    expect(rangePosition(150, 80, 120)).toBe(100);
    expect(rangePosition(20, 80, 120)).toBe(0);
  });
  it('is null when the range is unusable', () => {
    expect(rangePosition(100, undefined, 120)).toBeNull();
    expect(rangePosition(100, 120, 120)).toBeNull();
    expect(rangePosition(undefined, 80, 120)).toBeNull();
  });
});

describe('buildScorecard', () => {
  it('is null for a dead symbol', () => {
    expect(buildScorecard(meta(), { symbol: 'TEST.NS', ok: false })).toBeNull();
    expect(buildScorecard(meta(), point({ price: undefined }))).toBeNull();
  });
  it('carries identity, live price and the day move', () => {
    const c = buildScorecard(meta({ name: 'Acme' }), point({ price: 110, prevClose: 100 }))!;
    expect(c.name).toBe('Acme');
    expect(c.price).toBe(110);
    expect(c.change).toBeCloseTo(10, 6);
  });
  it('computes a return for every published window', () => {
    const c = buildScorecard(meta(), point(series(Array.from({ length: 260 }, (_, i) => i + 1))))!;
    for (const w of WINDOWS) {
      expect(c.returns[w.key]).toBeTypeOf('number');
    }
  });
  it('reads a rising tape as bullish', () => {
    const rising = Array.from({ length: 260 }, (_, i) => 100 + i * 0.5);
    const last = rising[rising.length - 1];
    const c = buildScorecard(meta(), point({ ...series(rising), price: last, prevClose: last - 1 }))!;
    expect(c.sma50).toBeGreaterThan(0);
    expect(c.sma200).toBeGreaterThan(0);
    expect(c.sma50).toBeGreaterThan(c.sma200!);
    expect(c.trend).toBe('bullish');
  });
  it('is neutral when there is not enough history for the long average', () => {
    const c = buildScorecard(meta(), point(series([100, 101, 102])))!;
    expect(c.sma200).toBeNull();
    expect(c.trend).toBe('neutral');
  });
});

describe('breadth', () => {
  it('splits movers around the flat threshold', () => {
    const cards = [
      card({ symbol: 'A', change: 1 }),
      card({ symbol: 'B', change: -1 }),
      card({ symbol: 'C', change: BREADTH_EPS / 2 }),
    ];
    const b = breadth(cards);
    expect(b).toMatchObject({ total: 3, advancers: 1, decliners: 1, unchanged: 1 });
  });
  it('counts how much of the tape sits above its averages', () => {
    const cards = [
      card({ symbol: 'A', price: 120, sma50: 110, sma200: 100, trend: 'bullish' }),
      card({ symbol: 'B', price: 90, sma50: 100, sma200: 110, trend: 'bearish' }),
      card({ symbol: 'C', price: 105, sma50: 100, sma200: null, trend: 'neutral' }),
    ];
    const b = breadth(cards);
    expect(b.aboveSma50).toBe(2);
    expect(b.aboveSma200).toBe(1);
    expect(b).toMatchObject({ bullish: 1, bearish: 1, neutral: 1 });
  });
  it('averages the session move', () => {
    expect(breadth([card({ change: 2 }), card({ change: -1 })]).avgChange).toBeCloseTo(0.5, 6);
  });
  it('survives an empty tape', () => {
    expect(breadth([])).toMatchObject({ total: 0, advancers: 0, avgChange: 0 });
  });
});

describe('sectorRows', () => {
  const cards = [
    card({ symbol: 'A', sector: 'IT', change: 2, returns: { '1D': 2, '1W': 4, '1M': 6, '3M': 8, '6M': 10, '1Y': 12 } }),
    card({ symbol: 'B', sector: 'IT', change: -1, returns: { '1D': -1, '1W': -2, '1M': -3, '3M': -4, '6M': -5, '1Y': -6 } }),
    card({ symbol: 'C', sector: 'Banking', change: 3, returns: { '1D': 3, '1W': 3, '1M': 3, '3M': 3, '6M': 3, '1Y': 3 } }),
  ];

  it('emits one row per sector with its member count', () => {
    const rows = sectorRows(cards);
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.sector === 'IT')?.count).toBe(2);
  });
  it('averages each window across the sector', () => {
    const it = sectorRows(cards).find((r) => r.sector === 'IT')!;
    expect(it.returns['1D']).toBeCloseTo(0.5, 6);
    expect(it.returns['1Y']).toBeCloseTo(3, 6);
  });
  it('leads with the strongest sector on the session', () => {
    expect(sectorRows(cards)[0].sector).toBe('Banking');
  });
  it('counts advancers and decliners per sector', () => {
    const it = sectorRows(cards).find((r) => r.sector === 'IT')!;
    expect(it).toMatchObject({ advancers: 1, decliners: 1 });
  });
});

describe('topMovers', () => {
  const cards = [
    card({ symbol: 'A', returns: { '1D': 1, '1W': 5, '1M': 9, '3M': 4, '6M': 2, '1Y': 1 } }),
    card({ symbol: 'B', returns: { '1D': -2, '1W': -5, '1M': 30, '3M': 4, '6M': 2, '1Y': 1 } }),
    card({ symbol: 'C', returns: { '1D': 3, '1W': 40, '1M': 1, '3M': 4, '6M': 2, '1Y': 1 } }),
  ];

  it('ranks descending by the chosen window', () => {
    expect(topMovers(cards, '1W', 2).map((c) => c.symbol)).toEqual(['C', 'A']);
  });
  it('ranks worst-first when asked for ascending', () => {
    expect(topMovers(cards, '1M', 2, 'asc').map((c) => c.symbol)).toEqual(['C', 'A']);
  });
  it('skips symbols with no reading for the window', () => {
    const withGap = [...cards, card({ symbol: 'D', returns: { '1D': 1, '1W': null, '1M': 1, '3M': 1, '6M': 1, '1Y': 1 } })];
    expect(topMovers(withGap, '1W', 9).map((c) => c.symbol)).not.toContain('D');
  });
  it('never returns more than n', () => {
    expect(topMovers(cards, '1D', 2)).toHaveLength(2);
  });
});

describe('mostActive', () => {
  it('ranks by traded volume', () => {
    const cards = [
      card({ symbol: 'A', volume: 100 }),
      card({ symbol: 'B', volume: 900 }),
      card({ symbol: 'C', volume: undefined }),
    ];
    expect(mostActive(cards, 5).map((c) => c.symbol)).toEqual(['B', 'A']);
  });
});

describe('nearHighs', () => {
  it('keeps only the stocks pressing their 52-week high, strongest first', () => {
    const cards = [
      card({ symbol: 'A', pos52: 96 }),
      card({ symbol: 'B', pos52: 40 }),
      card({ symbol: 'C', pos52: 100 }),
      card({ symbol: 'D', pos52: null }),
    ];
    expect(nearHighs(cards, 5).map((c) => c.symbol)).toEqual(['C', 'A']);
  });
});

describe('SECTIONS', () => {
  it('lists Markets first, as the exact-match home tab', () => {
    expect(SECTIONS[0]).toMatchObject({ key: 'markets', href: '/stock-screener', exact: true });
  });
  it('has a unique label and href per tab', () => {
    expect(new Set(SECTIONS.map((s) => s.href)).size).toBe(SECTIONS.length);
    expect(new Set(SECTIONS.map((s) => s.label)).size).toBe(SECTIONS.length);
  });
  it('names every tab', () => {
    expect(SECTIONS.map((s) => s.label)).toEqual(['Markets', 'News', 'Analysis', 'Trends']);
  });
  it('carries a heading and a one-line blurb for the section header', () => {
    for (const s of SECTIONS) {
      expect(s.title.length).toBeGreaterThan(3);
      expect(s.blurb.length).toBeGreaterThan(10);
    }
  });
  it('cannot shadow a stock detail route', () => {
    const stockPaths = new Set(STOCKS.map((s) => `/stock-screener/${symbolToSlug(s.symbol)}`));
    for (const path of SECTION_PATHS) {
      expect(stockPaths.has(path)).toBe(false);
    }
  });
});
