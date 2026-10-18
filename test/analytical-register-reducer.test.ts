// test/analytical-register-reducer.test.ts
import { describe, expect, it } from 'vitest';
import { initState, orderbookReducer } from '@/components/sites/analytical-register/reducer';
import { defaultMenu } from '@/components/sites/analytical-register/menu-data';

const item = (id: string, price: number) => defaultMenu.find((m) => m.id === id) ?? { id, name: id, category: 'X', price, active: true };

describe('orderbookReducer — ticket', () => {
  it('add-line increments an existing line rather than duplicating', () => {
    let s = orderbookReducer(initState(), { type: 'add-line', item: item('cappuccino', 180) });
    s = orderbookReducer(s, { type: 'add-line', item: item('cappuccino', 180) });
    expect(s.ticket).toHaveLength(1);
    expect(s.ticket[0].qty).toBe(2);
  });
  it('set-qty removes a line when qty drops to zero', () => {
    const s = orderbookReducer(
      orderbookReducer(initState(), { type: 'add-line', item: item('cappuccino', 180) }),
      { type: 'set-qty', menuItemId: 'cappuccino', qty: 0 },
    );
    expect(s.ticket).toHaveLength(0);
  });
  it('clear-ticket empties the ticket', () => {
    const s = orderbookReducer(
      orderbookReducer(initState(), { type: 'add-line', item: item('cappuccino', 180) }),
      { type: 'clear-ticket' },
    );
    expect(s.ticket).toEqual([]);
  });
});

describe('orderbookReducer — create-order', () => {
  // initState([]) — a clean order book so bill numbers and lengths are exact.
  // initState() seeds 800+ orders (pinned by the 'initState' block below).
  const withTicket = () =>
    orderbookReducer(
      orderbookReducer(initState([]), { type: 'add-line', item: item('cappuccino', 180) }),
      { type: 'set-ticket-customer', customer: { phone: '919988776655', name: 'Aditi' } },
    );

  it('moves the ticket into a paid order with totals and clears it', () => {
    const s = orderbookReducer(withTicket(), { type: 'create-order', id: 'o1', now: '2026-10-17T10:00:00Z' });
    expect(s.ticket).toEqual([]);
    expect(s.orders).toHaveLength(1);
    const order = s.orders[0];
    expect(order.billNumber).toBe(1);
    expect(order.status).toBe('paid');
    expect(order.brandName).toBe(s.brand.name);
    expect(Math.round((order.subtotal + order.cgst + order.sgst + order.roundOff) * 100))
      .toBe(Math.round(order.total * 100));
  });
  it('assigns sequential bill numbers', () => {
    let s = orderbookReducer(withTicket(), { type: 'create-order', id: 'o1', now: '2026-10-17T10:00:00Z' });
    s = orderbookReducer(
      orderbookReducer(s, { type: 'add-line', item: item('flat-white', 120) }),
      { type: 'create-order', id: 'o2', now: '2026-10-17T10:05:00Z' },
    );
    expect(s.orders.map((o) => o.billNumber)).toEqual([1, 2]);
  });
  it('upserts the customer by phone', () => {
    const s = orderbookReducer(withTicket(), { type: 'create-order', id: 'o1', now: '2026-10-17T10:00:00Z' });
    expect(s.customers.map((c) => c.phone)).toContain('919988776655');
  });
  it('ignores create-order on an empty ticket', () => {
    const s = orderbookReducer(initState([]), { type: 'create-order', id: 'o1', now: '2026-10-17T10:00:00Z' });
    expect(s.orders).toHaveLength(0);
  });
});

describe('orderbookReducer — menu, brand, reset', () => {
  it('archive-item keeps the item for history but drops it from the active grid', () => {
    const s = orderbookReducer(initState(), { type: 'archive-item', id: 'cappuccino' });
    expect(s.menu.find((m) => m.id === 'cappuccino')?.active).toBe(false);
  });
  it('update-brand patches fields', () => {
    const s = orderbookReducer(initState(), { type: 'update-brand', patch: { name: 'New Name', accent: '#123456' } });
    expect(s.brand.name).toBe('New Name');
    expect(s.brand.accent).toBe('#123456');
  });
  it('reset restores defaults and a fresh seed', () => {
    let s = orderbookReducer(initState(), { type: 'update-brand', patch: { name: 'Changed' } });
    s = orderbookReducer(s, { type: 'reset' });
    expect(s.brand.name).not.toBe('Changed');
    expect(s.orders.length).toBeGreaterThan(0);
  });
});

describe('initState', () => {
  it('seeds orders when none provided', () => {
    expect(initState().orders.length).toBeGreaterThan(0);
  });
  it('accepts a provided order list', () => {
    expect(initState([]).orders).toEqual([]);
  });
});
