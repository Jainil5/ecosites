// test/analytical-register-seed.test.ts
import { describe, expect, it } from 'vitest';
import { seedOrders } from '@/components/sites/analytical-register/seed';
import { defaultBrand, defaultMenu } from '@/components/sites/analytical-register/menu-data';

describe('seedOrders', () => {
  it('is deterministic for the same seed', () => {
    const now = new Date('2026-10-17T00:00:00Z');
    const a = seedOrders(defaultMenu, defaultBrand, { days: 30, seed: 42, now });
    const b = seedOrders(defaultMenu, defaultBrand, { days: 30, seed: 42, now });
    expect(a).toEqual(b);
  });
  it('produces sequential bill numbers and a 75-day span by default', () => {
    const now = new Date('2026-10-17T00:00:00Z');
    const orders = seedOrders(defaultMenu, defaultBrand, { now });
    expect(orders[0].billNumber).toBe(1);
    expect(orders[orders.length - 1].billNumber).toBe(orders.length);
    expect(orders.length).toBeGreaterThan(60);
    const oldest = new Date(orders[0].createdAt).getTime();
    const newest = new Date(orders[orders.length - 1].createdAt).getTime();
    expect(newest - oldest).toBeGreaterThan(60 * 86400000);
  });
  it('every seeded order satisfies the money invariant', () => {
    const orders = seedOrders(defaultMenu, defaultBrand, { days: 20, seed: 7 });
    for (const o of orders) {
      const sum = Math.round((o.subtotal + o.cgst + o.sgst + o.roundOff) * 100);
      expect(sum).toBe(Math.round(o.total * 100));
      expect(o.lines.length).toBeGreaterThan(0);
      expect(o.currency).toBe(defaultBrand.currency);
    }
  });
});
