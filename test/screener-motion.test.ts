import { describe, expect, it } from 'vitest';
import {
  STOCKS,
  symbolToSlug,
  stockBySlug,
  peersFor,
} from '../components/sites/stock-screener/data';
import { spark1M } from '../components/sites/stock-screener/indicators';
import { SPRINGS, EASE, DUR, vtName } from '../components/sites/stock-screener/motion/tokens';

describe('slug helpers', () => {
  it('round-trips every stock symbol', () => {
    for (const s of STOCKS) {
      expect(stockBySlug(symbolToSlug(s.symbol))?.symbol).toBe(s.symbol);
    }
  });
  it('maps BAJAJ-AUTO.NS to bajaj-auto.ns', () => {
    expect(symbolToSlug('BAJAJ-AUTO.NS')).toBe('bajaj-auto.ns');
  });
  it('returns undefined for unknown slugs', () => {
    expect(stockBySlug('NOPE.NS')).toBeUndefined();
  });
});

describe('peersFor', () => {
  it('excludes the symbol itself', () => {
    expect(peersFor('TCS.NS').every((p) => p.symbol !== 'TCS.NS')).toBe(true);
  });
  it('leads with same-sector stocks (IT)', () => {
    const peers = peersFor('TCS.NS', 4);
    expect(peers[0].sector).toBe('IT');
  });
  it('fills up to count when the sector is small', () => {
    expect(peersFor('TCS.NS', 6)).toHaveLength(6);
  });
});

describe('spark1M', () => {
  it('returns [] without closes', () => {
    expect(spark1M(undefined)).toEqual([]);
    expect(spark1M({ symbol: 'X', ok: true })).toEqual([]);
  });
  it('keeps only the last ~31 days and drops null holes', () => {
    const day = 86_400;
    const now = 1_700_000_000;
    const quote = {
      symbol: 'X',
      ok: true,
      timestamps: [now - 40 * day, now - 20 * day, now - day, now],
      closes: [10, null, 12, 13],
    };
    expect(spark1M(quote)).toEqual([12, 13]);
  });
});

describe('motion tokens (spec §5 — keep verbatim if the spec changes)', () => {
  it('springs match the spec table', () => {
    expect(SPRINGS.number).toEqual({ type: 'spring', stiffness: 260, damping: 30, mass: 0.9 });
    expect(SPRINGS.tiltFollow).toEqual({ type: 'spring', stiffness: 120, damping: 14 });
    expect(SPRINGS.tiltReturn).toEqual({ type: 'spring', stiffness: 300, damping: 25 });
    expect(SPRINGS.layout).toEqual({ type: 'spring', stiffness: 350, damping: 34 });
  });
  it('easing + durations match the spec', () => {
    expect(EASE.enter).toEqual([0.16, 1, 0.3, 1]);
    expect(EASE.exit).toEqual([0.4, 0, 1, 1]);
    expect(DUR).toMatchObject({ enter: 0.5, exit: 0.2, fadeLead: 0.18, stagger: 0.05 });
  });
  it('produces valid CSS custom identifiers (dots are rejected by the browser)', () => {
    expect(vtName('RELIANCE.NS')).toBe('stock-reliance-ns');
    expect(vtName('BAJAJ-AUTO.NS')).toBe('stock-bajaj-auto-ns');
    expect(vtName('M&M.NS')).toBe('stock-m-m-ns');
    expect(vtName('^NSEI')).toBe('stock-nsei');
    for (const stock of STOCKS) {
      expect(vtName(stock.symbol)).toMatch(/^[a-zA-Z_-][a-zA-Z0-9_-]*$/);
    }
  });
});
