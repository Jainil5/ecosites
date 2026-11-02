// test/analytical-register-editions.test.ts
import { describe, expect, it } from 'vitest';
import {
  bridgesToCafe, defaultEdition, editionById, editions,
} from '@/components/sites/analytical-register/editions';
import { initState, orderbookReducer } from '@/components/sites/analytical-register/reducer';
import { defaultBrand, defaultMenu } from '@/components/sites/analytical-register/menu-data';
import { seedOrders } from '@/components/sites/analytical-register/seed';
import { computeKpis } from '@/components/sites/analytical-register/analytics';

/**
 * OrderBook sells one system across three counters, so the editions file has to
 * keep two opposing promises: the machinery is identical, and the business on
 * each counter is genuinely different — its own catalogue, tax split, trading
 * shape and colour. These are the checks that keep both true.
 */

const byId = (id: string) => editions.find((e) => e.id === id)!;

describe('the edition catalogue', () => {
  it('opens on the café and offers three distinct counters', () => {
    expect(editions.map((e) => e.id)).toEqual(['cafe', 'salon', 'larder']);
    expect(defaultEdition).toBe('cafe');
    expect(editionById(undefined).id).toBe('cafe');
    expect(editionById('larder').id).toBe('larder');
  });

  it('names each edition as the product worn by a trade', () => {
    for (const e of editions) {
      expect(e.label).toMatch(/^OrderBook for /);
      expect(e.kicker.trim().length).toBeGreaterThan(3);
      expect(e.line.split('.').filter(Boolean)).toHaveLength(1);
      expect(e.bullets).toHaveLength(3);
      for (const b of e.bullets) expect(b.trim().length).toBeGreaterThan(15);
    }
  });

  it('falls back to the café on an unknown counter', () => {
    expect(editionById('nonsense' as never).id).toBe('cafe');
  });

  it('runs the café on the same catalogue the Coffee Cups site sells', () => {
    const cafe = byId('cafe');
    expect(cafe.brand).toBe(defaultBrand);
    expect(cafe.menu).toBe(defaultMenu);
  });

  it('gives every counter its own catalogue, with no id or name reused', () => {
    for (const e of editions) {
      expect(e.menu.length).toBeGreaterThan(5);
      expect(new Set(e.menu.map((m) => m.id)).size).toBe(e.menu.length);
      expect(e.menu.every((m) => m.active && m.price > 0 && m.name && m.category)).toBe(true);
    }
    const salon = byId('salon');
    const cafe = byId('cafe');
    for (const item of salon.menu) {
      expect(cafe.menu.some((m) => m.name === item.name)).toBe(false);
    }
    expect(new Set(salon.menu.map((m) => m.category)))
      .toEqual(new Set(['For Her', 'For Everyone', 'For Him']));
  });

  it('weights every category it actually sells, so nothing silently defaults', () => {
    for (const e of editions) {
      const cats = [...new Set(e.menu.map((m) => m.category))].sort();
      expect(Object.keys(e.profile.weights ?? {}).sort(), e.id).toEqual(cats);
    }
  });

  it('splits tax, colour and trading shape per business', () => {
    expect(byId('cafe').brand.gstRate).toBe(0.05);
    expect(byId('larder').brand.gstRate).toBe(0.05);
    // Services carry the higher slab, so a salon bill is taxed differently.
    expect(byId('salon').brand.gstRate).toBe(0.18);
    expect(new Set(editions.map((e) => e.brand.accent)).size).toBe(editions.length);
    expect(new Set(editions.map((e) => e.brand.name))).toEqual(
      new Set(['Coffee Cups', 'Hair Adore', 'Ember Larder']),
    );
  });

  it('opens and peaks at hours that belong to the trade', () => {
    expect(byId('cafe').profile.openHour).toBeLessThan(byId('larder').profile.openHour);
    for (const e of editions) {
      expect(e.profile.openHour + e.profile.span).toBeLessThanOrEqual(24);
      expect(e.profile.weekend).toBeGreaterThan(e.profile.weekday);
      expect(e.profile.maxLines).toBeGreaterThanOrEqual(2);
    }
    // A salon writes fewer, far larger bills than a café.
    expect(byId('salon').profile.weekday).toBeLessThan(byId('cafe').profile.weekday);
  });

  it('shares the Coffee Cups order bridge with the café counter only', () => {
    expect(bridgesToCafe('cafe')).toBe(true);
    expect(bridgesToCafe('salon')).toBe(false);
    expect(bridgesToCafe('larder')).toBe(false);
  });
});

describe('switching counter', () => {
  it('loads that business’s own book, catalogue and brand', () => {
    const cafe = initState(undefined, 'cafe');
    const salon = initState(undefined, 'salon');
    expect(salon.edition).toBe('salon');
    expect(salon.brand.name).toBe('Hair Adore');
    expect(salon.menu.map((m) => m.id)).toEqual(byId('salon').menu.map((m) => m.id));
    expect(salon.orders.length).toBeLessThan(cafe.orders.length);
    expect(computeKpis(salon.orders).aov).toBeGreaterThan(computeKpis(cafe.orders).aov);
    // A café order written on the salon counter would be a different business.
    const cafeItems = new Set(cafe.menu.map((m) => m.name));
    for (const o of salon.orders) {
      for (const l of o.lines) expect(cafeItems.has(l.name)).toBe(false);
    }
  });

  it('drops the open ticket, because the ticket belongs to the old counter', () => {
    const cafe = initState([]);
    const withTicket = orderbookReducer(cafe, { type: 'add-line', item: defaultMenu[0] });
    expect(withTicket.ticket).toHaveLength(1);
    const salon = orderbookReducer(withTicket, { type: 'switch-edition', edition: 'salon' });
    expect(salon.ticket).toHaveLength(0);
    expect(salon.edition).toBe('salon');
    expect(salon.orders.length).toBeGreaterThan(0);
  });

  it('is a no-op when the counter is already open', () => {
    const cafe = initState([]);
    expect(orderbookReducer(cafe, { type: 'switch-edition', edition: 'cafe' })).toBe(cafe);
  });

  it('resets to the current counter’s own book, not the default one', () => {
    const larder = orderbookReducer(initState([]), { type: 'switch-edition', edition: 'larder' });
    const cleared = orderbookReducer(larder, { type: 'reset' });
    expect(cleared.edition).toBe('larder');
    expect(cleared.brand.name).toBe('Ember Larder');
    expect(cleared.orders.length).toBeGreaterThan(0);
  });

  it('is deterministic, so a reload shows the same trading book', () => {
    const now = new Date('2026-10-17T00:00:00Z');
    for (const e of editions) {
      const a = seedOrders(e.menu, e.brand, { ...e.profile, days: 20, now });
      const b = seedOrders(e.menu, e.brand, { ...e.profile, days: 20, now });
      expect(b.map((o) => o.billNumber)).toEqual(a.map((o) => o.billNumber));
      expect(b.map((o) => o.lines.map((l) => l.name).join('+'))).toEqual(a.map((o) => o.lines.map((l) => l.name).join('+')));
    }
  });

  it('seeds each counter with a book that looks like its own trade', () => {
    const now = new Date('2026-10-17T00:00:00Z');
    const books = Object.fromEntries(
      editions.map((e) => [e.id, seedOrders(e.menu, e.brand, { ...e.profile, days: 20, now })]),
    );
    expect(books.salon.length).toBeLessThan(books.cafe.length);
    const hours = (list: typeof books.cafe) =>
      list.map((o) => new Date(o.createdAt).getUTCHours());
    expect(Math.min(...hours(books.salon))).toBeGreaterThanOrEqual(byId('salon').profile.openHour);
    expect(Math.min(...hours(books.cafe))).toBeGreaterThanOrEqual(byId('cafe').profile.openHour);
    // Named guests are the salon’s norm and the café’s exception.
    const named = (list: typeof books.cafe) => list.filter((o) => o.customer).length / list.length;
    expect(named(books.salon)).toBeGreaterThan(named(books.cafe));
  });
});
