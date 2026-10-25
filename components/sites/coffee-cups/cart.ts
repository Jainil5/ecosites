import { menuGroups, type MenuItem } from './menu';

export const CART_KEY = 'cc-cart-v1';
export const MAX_QTY = 20;

/**
 * Cart key format: `baseId` or `baseId:sizeId` or `baseId:sizeId:addon1+addon2`.
 * This lets the same item appear multiple times with different variants.
 */
export function variantKey(baseId: string, sizeId?: string, addonIds?: string[]): string {
  const parts = [baseId];
  if (sizeId) parts.push(sizeId);
  if (addonIds?.length) parts.push([...addonIds].sort().join('+'));
  return parts.join(':');
}

export function parseVariantKey(key: string): { baseId: string; sizeId?: string; addonIds: string[] } {
  const parts = key.split(':');
  return { baseId: parts[0], sizeId: parts[1], addonIds: parts[2]?.split('+') ?? [] };
}

/** itemId -> quantity */
export type CartState = Record<string, number>;

export type CartAction =
  | { type: 'add'; id: string }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'replace'; state: CartState }
  | { type: 'clear' };

const byId = new Map<string, MenuItem>(menuGroups.flatMap((g) => g.items.map((i) => [i.id, i] as const)));

export function variantPrice(key: string): number {
  const { baseId, sizeId, addonIds } = parseVariantKey(key);
  const item = byId.get(baseId);
  if (!item) return 0;
  let total = item.amount;
  if (sizeId && item.sizes) {
    const sz = item.sizes.find((s) => s.id === sizeId);
    if (sz) total += sz.extra;
  }
  if (addonIds.length && item.addons) {
    for (const id of addonIds) {
      const ad = item.addons.find((a) => a.id === id);
      if (ad) total += ad.price;
    }
  }
  return total;
}

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

/** Lines in menu order, resolving variant keys back to items. */
export function lineItems(state: CartState): { key: string; item: MenuItem; qty: number; unitPrice: number }[] {
  const allItems = menuGroups.flatMap((g) => g.items);
  const lines: { key: string; item: MenuItem; qty: number; unitPrice: number }[] = [];
  for (const item of allItems) {
    for (const key of Object.keys(state)) {
      if (parseVariantKey(key).baseId === item.id && state[key]) {
        lines.push({ key, item, qty: state[key], unitPrice: variantPrice(key) });
      }
    }
  }
  return lines;
}

export const cartCount = (state: CartState): number =>
  Object.values(state).reduce((n, qty) => n + qty, 0);

/** Total qty across all variant keys for a given base item id. */
export function cartQtyForItem(state: CartState, baseId: string): number {
  let total = 0;
  for (const [key, qty] of Object.entries(state)) {
    if (parseVariantKey(key).baseId === baseId) total += qty;
  }
  return total;
}

export const cartTotal = (state: CartState): number =>
  lineItems(state).reduce((sum, l) => sum + l.unitPrice * l.qty, 0);

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
      const { baseId } = parseVariantKey(key);
      if (byId.has(baseId) && Number.isInteger(qty) && (qty as number) > 0) {
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
