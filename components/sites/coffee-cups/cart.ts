import { menuGroups, type MenuItem } from './menu';

export const CART_KEY = 'cc-cart-v1';
export const MAX_QTY = 20;

/** itemId -> quantity */
export type CartState = Record<string, number>;

export type CartAction =
  | { type: 'add'; id: string }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'replace'; state: CartState }
  | { type: 'clear' };

const byId = new Map<string, MenuItem>(menuGroups.flatMap((g) => g.items.map((i) => [i.id, i] as const)));

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const qty = (state[action.id] ?? 0) + 1;
      return { ...state, [action.id]: Math.min(qty, MAX_QTY) };
    }
    case 'setQty': {
      if (action.qty <= 0) {
        const rest = { ...state };
        delete rest[action.id];
        return rest;
      }
      return { ...state, [action.id]: Math.min(action.qty, MAX_QTY) };
    }
    case 'replace':
      return action.state;
    case 'clear':
      return {};
  }
}

/** Lines in menu order, ignoring ids the menu no longer serves. */
export function lineItems(state: CartState): { item: MenuItem; qty: number }[] {
  return menuGroups
    .flatMap((g) => g.items)
    .filter((item) => state[item.id])
    .map((item) => ({ item, qty: state[item.id] }));
}

export const cartCount = (state: CartState): number =>
  Object.values(state).reduce((n, qty) => n + qty, 0);

export const cartTotal = (state: CartState): number =>
  lineItems(state).reduce((sum, l) => sum + l.item.amount * l.qty, 0);

export const inr = (n: number): string => '₹' + n.toLocaleString('en-IN');

export interface KvStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function loadCart(store: KvStore): CartState {
  try {
    const raw = store.getItem(CART_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const state: CartState = {};
    for (const [key, qty] of Object.entries(parsed)) {
      if (byId.has(key) && Number.isInteger(qty) && (qty as number) > 0) {
        state[key] = Math.min(qty as number, MAX_QTY);
      }
    }
    return state;
  } catch {
    return {};
  }
}

export function saveCart(store: KvStore, state: CartState): void {
  if (Object.keys(state).length === 0) store.removeItem(CART_KEY);
  else store.setItem(CART_KEY, JSON.stringify(state));
}

export const orderNumber = (rand: () => number = Math.random): string =>
  'CC-' + Math.floor(1000 + rand() * 9000);
