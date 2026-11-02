// test/analytical-register-shared-menu.test.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { defaultBrand, defaultMenu } from '@/components/sites/analytical-register/menu-data';
import { seedOrders } from '@/components/sites/analytical-register/seed';
import { menuGroups } from '@/components/sites/coffee-cups/menu';

const cafeItems = menuGroups.flatMap((g) => g.items.map((i) => ({ ...i, category: g.title })));

describe('OrderBook shares the Coffee Cups menu', () => {
  it('has the same ids, in the same order, as the cafe menu', () => {
    expect(defaultMenu.map((m) => m.id)).toEqual(cafeItems.map((i) => i.id));
  });
  it('mirrors name, category, price, note and photo for every item', () => {
    for (const cafe of cafeItems) {
      const ob = defaultMenu.find((m) => m.id === cafe.id)!;
      expect(ob.name).toBe(cafe.name);
      expect(ob.category).toBe(cafe.category);
      expect(ob.price).toBe(cafe.amount);
      expect(ob.note).toBe(cafe.note);
      expect(ob.src).toBe(cafe.src);
      expect(ob.active).toBe(true);
    }
  });
  it('brands the register as Coffee Cups', () => {
    expect(defaultBrand.name).toBe('Coffee Cups');
    expect(defaultBrand.currency).toBe('₹');
    expect(defaultBrand.gstRate).toBe(0.05);
  });
  it('seeds orders that only sell cafe items across the three categories', () => {
    const orders = seedOrders(defaultMenu, defaultBrand, {
      days: 40, seed: 11, now: new Date('2026-10-17T00:00:00Z'),
    });
    const ids = new Set(defaultMenu.map((m) => m.id));
    expect(new Set(defaultMenu.map((m) => m.category)))
      .toEqual(new Set(['Coffee', 'Food', 'Beverages']));
    for (const o of orders) for (const l of o.lines) expect(ids.has(l.menuItemId)).toBe(true);
    const sold = new Set(
      orders.flatMap((o) => o.lines.map((l) => defaultMenu.find((m) => m.id === l.menuItemId)!.category)),
    );
    expect([...sold].sort()).toEqual(['Beverages', 'Coffee', 'Food']);
  });
  it('shows cafe photos on register tiles', () => {
    const src = readFileSync(
      join(process.cwd(), 'components/sites/analytical-register/Register.tsx'), 'utf8',
    );
    expect(src).toMatch(/m\.src/);
  });
  it('versions the persisted store so old menus re-seed instead of hydrating', () => {
    const src = readFileSync(
      join(process.cwd(), 'components/sites/analytical-register/store.tsx'), 'utf8',
    );
    // v2 payloads predate the counters: they hold only the café catalogue, and
    // hydrating one onto the salon till would sell coffee in a salon.
    expect(src).toMatch(/'orderbook:v3'/);
    expect(src).toMatch(/editions\.some\(\(e\) => e\.id === parsed\.edition\)/);
    // The Coffee Cups bridge feeds the café book and no other counter's.
    expect(src).toMatch(/if \(!bridgesToCafe\(st\.edition\)\) return st;/);
  });
});
