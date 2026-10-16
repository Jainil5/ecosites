// test/analytical-register-analytics.test.ts
import { describe, expect, it } from 'vitest';
import {
  computeKpis, revenueByDay, topItems, categoryMix, weekdayWeekend,
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
