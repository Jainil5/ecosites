import { describe, expect, it } from 'vitest';
import {
  CART_KEY,
  MAX_QTY,
  cartCount,
  cartReducer,
  cartTotal,
  lineItems,
  loadCart,
  orderNumber,
  saveCart,
  type CartState,
  type KvStore,
} from '@/components/sites/coffee-cups/cart';

// Reference items by id, not position: the menu sections were restructured
// (Coffee · Food · Beverages) and index lookups were brittle.
const coldBrew = 'cold-brew';
const flatWhite = 'flat-white';
const everythingBagel = 'everything-bagel';

const fakeStore = (initial: Record<string, string> = {}): KvStore & { data: Record<string, string> } => {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
};

describe('cart reducer', () => {
  it('adds one and merges repeats', () => {
    let s: CartState = {};
    s = cartReducer(s, { type: 'add', id: coldBrew });
    s = cartReducer(s, { type: 'add', id: coldBrew });
    expect(s[coldBrew]).toBe(2);
    expect(cartCount(s)).toBe(2);
  });

  it('caps a single line at MAX_QTY', () => {
    const s = cartReducer({ [coldBrew]: MAX_QTY }, { type: 'add', id: coldBrew });
    expect(s[coldBrew]).toBe(MAX_QTY);
  });

  it('setQty 0 removes the line and clamps big quantities', () => {
    let s: CartState = { [coldBrew]: 2, [flatWhite]: 1 };
    s = cartReducer(s, { type: 'setQty', id: coldBrew, qty: 0 });
    expect(coldBrew in s).toBe(false);
    s = cartReducer(s, { type: 'setQty', id: flatWhite, qty: 999 });
    expect(s[flatWhite]).toBe(MAX_QTY);
  });

  it('clear empties the tray', () => {
    const s = cartReducer({ [coldBrew]: 3 }, { type: 'clear' });
    expect(s).toEqual({});
  });

  it('replace loads a stored tray wholesale', () => {
    const s = cartReducer({ [flatWhite]: 9 }, { type: 'replace', state: { [coldBrew]: 2 } });
    expect(s).toEqual({ [coldBrew]: 2 });
  });

  it('totals the tray in menu order', () => {
    const s: CartState = { [coldBrew]: 2, [everythingBagel]: 1 };
    const lines = lineItems(s);
    expect(lines.map((l) => l.item.id)).toEqual([coldBrew, everythingBagel]);
    expect(cartTotal(s)).toBe(220 + 260 * 2);
  });
});

describe('cart session storage', () => {
  it('round-trips through a store', () => {
    const store = fakeStore();
    const s: CartState = { [coldBrew]: 2 };
    saveCart(store, s);
    expect(store.data[CART_KEY]).toBeTruthy();
    expect(loadCart(store)).toEqual(s);
  });

  it('drops unknown ids and survives junk payloads', () => {
    expect(loadCart(fakeStore({ [CART_KEY]: JSON.stringify({ 'gone-item': 2, [coldBrew]: 1 }) }))).toEqual({
      [coldBrew]: 1,
    });
    expect(loadCart(fakeStore({ [CART_KEY]: 'not json{' }))).toEqual({});
    expect(loadCart(fakeStore({ [CART_KEY]: JSON.stringify({ [coldBrew]: -3 }) }))).toEqual({});
    expect(loadCart(fakeStore())).toEqual({});
  });

  it('removes the key when the tray empties', () => {
    const store = fakeStore();
    saveCart(store, { [coldBrew]: 1 });
    saveCart(store, {});
    expect(CART_KEY in store.data).toBe(false);
  });
});

describe('order ticket number', () => {
  it('looks like CC-1234', () => {
    expect(orderNumber(() => 0)).toBe('CC-1000');
    expect(orderNumber(() => 0.99999)).toMatch(/^CC-\d{4}$/);
    expect(orderNumber()).toMatch(/^CC-\d{4}$/);
  });
});
