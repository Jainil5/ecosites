// test/analytical-register-analytics.test.ts
import { describe, expect, it } from 'vitest';
import {
  computeKpis, revenueByDay, topItems, categoryMix, weekdayWeekend, shortDate,
  rankItems, revenueByWeek, dayOfWeekSeries, hourlyHeatmap, categoryTrend,
  scopeToCategory, previousRange, deltaPct, dayDetail, slotDetail, peakSlots,
  itemSeries, itemStats, reportCsv,
} from '@/components/sites/analytical-register/analytics';
import type { MenuItem, Order } from '@/components/sites/analytical-register/types';

const menu: MenuItem[] = [
  { id: 'a', name: 'Latte', category: 'Coffee', price: 200, active: true },
  { id: 'b', name: 'Bagel', category: 'Bakes', price: 120, active: true },
];
const o = (over: Partial<Order>): Order => ({
  id: 'x', billNumber: 1, createdAt: '2026-10-17T10:00:00Z',
  lines: [{ menuItemId: 'a', name: 'Latte', qty: 2, unitPrice: 200 }],
  subtotal: 400, cgst: 10, sgst: 10, roundOff: 0, total: 420,
  status: 'paid', brandName: 'B', gstRate: 0.05, currency: '₹', ...over,
});

describe('computeKpis', () => {
  it('sums revenue, counts orders, averages order value, counts items', () => {
    const k = computeKpis([o({}), o({ total: 100, lines: [{ menuItemId: 'b', name: 'Bagel', qty: 3, unitPrice: 120 }] })]);
    expect(k.revenue).toBe(520);
    expect(k.orders).toBe(2);
    expect(k.aov).toBe(260);
    expect(k.itemsSold).toBe(5);
  });
  it('handles an empty list without dividing by zero', () => {
    expect(computeKpis([])).toEqual({ revenue: 0, orders: 0, aov: 0, itemsSold: 0 });
  });
});

describe('revenueByDay', () => {
  it('buckets orders within the inclusive range', () => {
    const pts = revenueByDay(
      [o({ createdAt: '2026-10-16T05:00:00Z' }), o({ createdAt: '2026-10-17T05:00:00Z' })],
      '2026-10-15', '2026-10-17',
    );
    expect(pts.find((p) => p.date === '2026-10-17')?.revenue).toBe(420);
  });
});

describe('topItems / categoryMix / weekdayWeekend', () => {
  it('ranks items by quantity', () => {
    const t = topItems([o({}), o({ lines: [{ menuItemId: 'b', name: 'Bagel', qty: 9, unitPrice: 120 }] })], 5);
    expect(t[0]).toEqual({ name: 'Bagel', value: 9 });
  });
  it('splits revenue by category', () => {
    const c = categoryMix([o({})], menu);
    expect(c).toEqual([{ name: 'Coffee', value: 400 }]);
  });
  it('separates weekend (Sat/Sun) from weekday revenue', () => {
    const w = weekdayWeekend([
      o({ createdAt: '2026-10-17T10:00:00Z' }), // Saturday
      o({ createdAt: '2026-10-19T10:00:00Z', total: 100 }), // Monday
    ]);
    expect(w.weekend).toBe(420);
    expect(w.weekday).toBe(100);
  });
});

describe('rankItems', () => {
  it('ranks the whole menu by quantity with revenue, unsold items last', () => {
    const r = rankItems([o({ lines: [{ menuItemId: 'a', name: 'Latte', qty: 3, unitPrice: 200 }] })], menu);
    expect(r[0]).toEqual({ name: 'Latte', qty: 3, revenue: 600 });
    expect(r[1]).toEqual({ name: 'Bagel', qty: 0, revenue: 0 });
  });
  it('carries the menu photo through for dashboard thumbnails', () => {
    const withSrc = [{ ...menu[0], src: '/brewery-cafe/menu/a.jpg' }];
    const r = rankItems([o({})], withSrc);
    expect(r[0].src).toBe('/brewery-cafe/menu/a.jpg');
  });
});

describe('revenueByWeek', () => {
  it('buckets a Monday-start week', () => {
    const pts = revenueByWeek(
      [o({ createdAt: '2026-10-12T10:00:00Z' }), o({ createdAt: '2026-10-15T10:00:00Z', total: 100 })],
      '2026-10-12', '2026-10-18',
    );
    expect(pts).toEqual([{ weekStart: '2026-10-12', revenue: 520, orders: 2 }]);
  });
  it('emits one empty bucket per touched week, in order', () => {
    const pts = revenueByWeek([o({ createdAt: '2026-10-14T10:00:00Z' })], '2026-10-05', '2026-10-18');
    expect(pts.map((p) => p.weekStart)).toEqual(['2026-10-05', '2026-10-12']);
    expect(pts[0].revenue).toBe(0);
  });
});

describe('dayOfWeekSeries', () => {
  it('totals revenue Mon–Sun in order', () => {
    const s = dayOfWeekSeries([
      o({ createdAt: '2026-10-19T10:00:00Z', total: 100 }), // Monday
      o({ createdAt: '2026-10-17T10:00:00Z' }), // Saturday
    ]);
    expect(s.map((d) => d.day)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(s[0].revenue).toBe(100);
    expect(s[5].revenue).toBe(420);
    expect(s[5].orders).toBe(1);
  });
});

describe('hourlyHeatmap', () => {
  it('counts orders per hour per weekday (Mon row first)', () => {
    const h = hourlyHeatmap([
      o({ createdAt: '2026-10-19T09:30:00Z' }),
      o({ createdAt: '2026-10-19T09:45:00Z' }),
    ]);
    expect(h.length).toBe(7);
    expect(h[0].length).toBe(24);
    expect(h[0][9]).toBe(2);
    expect(h[0][10]).toBe(0);
  });
});

describe('categoryTrend', () => {
  it('splits daily revenue by category across the range', () => {
    const t = categoryTrend([o({ createdAt: '2026-10-16T10:00:00Z' })], menu, '2026-10-15', '2026-10-17');
    expect(t.dates).toEqual(['2026-10-15', '2026-10-16', '2026-10-17']);
    expect(t.series.find((s) => s.name === 'Coffee')?.values).toEqual([0, 400, 0]);
    expect(t.series.find((s) => s.name === 'Bakes')?.values).toEqual([0, 0, 0]);
  });
});

describe('shortDate', () => {
  it('reads an ISO day the way a chart label does', () => {
    expect(shortDate('2026-10-17')).toBe('17 Oct');
    expect(shortDate('2026-01-05')).toBe('5 Jan');
  });
});

/* The interactive layer: every control on the analytics screen is one of these,
 * so a chart that moves has to be reading numbers that are still true. */

const both = o({
  lines: [
    { menuItemId: 'a', name: 'Latte', qty: 2, unitPrice: 200 },
    { menuItemId: 'b', name: 'Bagel', qty: 1, unitPrice: 120 },
  ],
  subtotal: 520, cgst: 13, sgst: 13, total: 546,
});

describe('scopeToCategory', () => {
  it('rebuilds the bill from the lines in scope, tax and all', () => {
    const coffee = scopeToCategory([both], menu, 'Coffee');
    expect(coffee).toHaveLength(1);
    expect(coffee[0].lines.map((l) => l.name)).toEqual(['Latte']);
    expect(coffee[0].subtotal).toBe(400);
    expect(coffee[0].cgst + coffee[0].sgst).toBe(20);
    expect(coffee[0].total).toBe(420);
    const bakes = scopeToCategory([both], menu, 'Bakes');
    expect(bakes[0].total).toBe(126);
  });

  it('keeps the date, the bill number and everything else about the order', () => {
    const scoped = scopeToCategory([both], menu, 'Bakes')[0];
    expect(scoped.id).toBe(both.id);
    expect(scoped.billNumber).toBe(both.billNumber);
    expect(scoped.createdAt).toBe(both.createdAt);
    expect(scoped.brandName).toBe(both.brandName);
  });

  it('drops a bill that sells nothing in the scope', () => {
    expect(scopeToCategory([o({})], menu, 'Bakes')).toEqual([]);
  });

  it('scopes the totals the whole page then reads', () => {
    const scoped = scopeToCategory([both, o({ id: 'y' })], menu, 'Bakes');
    expect(computeKpis(scoped).revenue).toBe(126);
    expect(computeKpis(scoped).orders).toBe(1);
  });
});

describe('previousRange and deltaPct', () => {
  it('returns the window of the same length immediately before this one', () => {
    expect(previousRange('2026-10-17', 7)).toEqual({ from: '2026-10-10', to: '2026-10-16' });
    expect(previousRange('2026-01-05', 30).from).toBe('2025-12-06');
  });

  it('is a percentage, and is silent when there is nothing to compare', () => {
    expect(deltaPct(120, 100)).toBe(20);
    expect(deltaPct(100, 120)).toBe(-17);
    expect(deltaPct(100, 0)).toBeUndefined();
  });
});

describe('dayDetail', () => {
  it('reads one day: what it took, how many bills and in which hours', () => {
    const d = dayDetail([
      o({ createdAt: '2026-10-17T09:15:00Z' }),
      o({ createdAt: '2026-10-17T18:40:00Z', total: 100 }),
      o({ createdAt: '2026-10-16T10:00:00Z' }),
    ], menu, '2026-10-17');
    expect(d.kpis.orders).toBe(2);
    expect(d.kpis.revenue).toBe(520);
    expect(d.hours.map((h) => h.label)).toEqual(['09', '18']);
    expect(d.top?.name).toBe('Latte');
  });

  it('says so plainly when a day did not trade', () => {
    const d = dayDetail([o({})], menu, '2026-10-01');
    expect(d.kpis).toEqual({ revenue: 0, orders: 0, aov: 0, itemsSold: 0 });
    expect(d.hours).toEqual([]);
  });
});

describe('slotDetail and peakSlots', () => {
  const monday = [
    o({ createdAt: '2026-10-19T09:30:00Z' }),
    o({ createdAt: '2026-10-19T09:45:00Z', total: 100 }),
    o({ createdAt: '2026-10-20T20:00:00Z' }),
  ];
  it('reads one weekday-and-hour cell across the whole book', () => {
    const s = slotDetail(monday, 0, 9);
    expect(s.kpis.orders).toBe(2);
    expect(s.kpis.revenue).toBe(520);
    expect(s.items[0]).toEqual({ name: 'Latte', value: 4 });
  });
  it('lists the busiest cells first, and never an empty one', () => {
    const peaks = peakSlots(hourlyHeatmap(monday), 3);
    expect(peaks[0]).toEqual({ day: 0, hour: 9, value: 2 });
    expect(peaks.every((p) => p.value > 0)).toBe(true);
    expect(peaks.length).toBe(2);
  });
});

describe('itemSeries and itemStats', () => {
  const book = [
    o({ createdAt: '2026-10-15T10:00:00Z' }),
    o({ createdAt: '2026-10-16T10:00:00Z', lines: [{ menuItemId: 'a', name: 'Latte', qty: 1, unitPrice: 200 }] }),
    o({ createdAt: '2026-10-17T10:00:00Z', lines: [{ menuItemId: 'b', name: 'Bagel', qty: 4, unitPrice: 120 }] }),
  ];
  it('draws the item’s own daily line over the range', () => {
    const s = itemSeries(book, 'Latte', '2026-10-15', '2026-10-17');
    expect(s.map((p) => p.date)).toEqual(['2026-10-15', '2026-10-16', '2026-10-17']);
    expect(s.map((p) => p.revenue)).toEqual([400, 200, 0]);
    expect(s.map((p) => p.qty)).toEqual([2, 1, 0]);
  });
  it('counts the bills it appears on and the days it traded', () => {
    expect(itemStats(book, 'Latte')).toEqual({ qty: 3, revenue: 600, bills: 2, tradedDays: 2 });
    expect(itemStats(book, 'Never Sold')).toEqual({ qty: 0, revenue: 0, bills: 0, tradedDays: 0 });
  });
});

describe('reportCsv', () => {
  const rows = revenueByDay([o({ createdAt: '2026-10-16T10:00:00Z' })], '2026-10-16', '2026-10-17');
  it('prints a header, one line per day and a total', () => {
    const csv = reportCsv(rows, 'Brewery Cafe', 'All categories');
    const lines = csv.split('\n');
    expect(lines[0]).toBe('# Brewery Cafe — All categories');
    expect(lines[1]).toBe('date,revenue,bills');
    expect(lines[2]).toBe('2026-10-16,420.00,1');
    expect(lines[3]).toBe('2026-10-17,0.00,0');
    expect(lines[lines.length - 1]).toBe('total,420.00,1');
  });
  it('escapes a scope name that contains a comma', () => {
    expect(reportCsv([], 'Brewery Cafe', 'Coffee, 30d')).toContain('# "Brewery Cafe — Coffee, 30d"');
  });
});
