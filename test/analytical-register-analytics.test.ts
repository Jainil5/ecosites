// test/analytical-register-analytics.test.ts
import { describe, expect, it } from 'vitest';
import {
  computeKpis, revenueByDay, topItems, categoryMix, weekdayWeekend,
  rankItems, revenueByWeek, dayOfWeekSeries, hourlyHeatmap, categoryTrend,
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
    const withSrc = [{ ...menu[0], src: '/dream-cafe/menu/a.jpg' }];
    const r = rankItems([o({})], withSrc);
    expect(r[0].src).toBe('/dream-cafe/menu/a.jpg');
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
