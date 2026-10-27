import { products, type Product } from './data';

/**
 * The basket for both halves of the business — plates from the fire and jars
 * off the pantry shelf — so a customer can order dinner and a jar of the same
 * chilli oil in one ticket. Lines are keyed by product *and* chosen variants,
 * which is what keeps "half rack, hot" separate from "full rack, medium".
 */
export const CART_KEY = 'el-cart-v1';
export const GST_RATE = 0.05;
export const MAX_QTY = 12;

export interface CartLine {
  key: string;
  id: string;
  chosen: Record<string, string>;
  qty: number;
}

export type CartState = Record<string, CartLine>;

export type CartAction =
  | { type: 'add'; line: CartLine; qty: number }
  | { type: 'setQty'; key: string; qty: number }
  | { type: 'clear' }
  | { type: 'replace'; state: CartState };

export const productById = (id: string): Product | undefined => products.find((p) => p.id === id);

export const lineKey = (id: string, chosen: Record<string, string>): string =>
  [id, ...Object.keys(chosen).sort().map((k) => `${k}=${chosen[k]}`)].join(':');

/** First option priced at zero, so the card's printed price is the default. */
export const defaultChosen = (p: Product): Record<string, string> =>
  Object.fromEntries(
    (p.choices ?? []).map((c) => [c.id, (c.options.find((o) => o.delta === 0) ?? c.options[0]).id]),
  );

export const unitPrice = (p: Product, chosen: Record<string, string>): number =>
  p.price +
  (p.choices ?? []).reduce(
    (sum, c) => sum + (c.options.find((o) => o.id === chosen[c.id])?.delta ?? 0),
    0,
  );

/** "Full rack · Hot" — the variant trail a line was ordered with. */
export const chosenLabel = (p: Product, chosen: Record<string, string>): string =>
  (p.choices ?? [])
    .map((c) => c.options.find((o) => o.id === chosen[c.id])?.label)
    .filter(Boolean)
    .join(' · ');

export const inr = (n: number): string => '₹' + Math.round(n).toLocaleString('en-IN');

export const subtotal = (cart: CartState): number =>
  Object.values(cart).reduce((sum, line) => {
    const p = productById(line.id);
    return p ? sum + unitPrice(p, line.chosen) * line.qty : sum;
  }, 0);

export const cartCount = (cart: CartState): number =>
  Object.values(cart).reduce((sum, line) => sum + line.qty, 0);

export interface Totals {
  subtotal: number;
  gst: number;
  total: number;
}

export const totals = (cart: CartState): Totals => {
  const sub = subtotal(cart);
  const gst = Math.round(sub * GST_RATE);
  return { subtotal: sub, gst, total: sub + gst };
};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state[action.line.key];
      const qty = Math.min(MAX_QTY, (existing?.qty ?? 0) + action.qty);
      return { ...state, [action.line.key]: { ...action.line, qty } };
    }
    case 'setQty': {
      const line = state[action.key];
      if (!line) return state;
      if (action.qty <= 0) {
        const rest = { ...state };
        delete rest[action.key];
        return rest;
      }
      return { ...state, [action.key]: { ...line, qty: Math.min(MAX_QTY, action.qty) } };
    }
    case 'clear':
      return {};
    case 'replace':
      return action.state;
    default:
      return state;
  }
}

interface KvStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Hydrate a saved basket, dropping anything that no longer matches the card. */
export function loadCart(store: KvStore | undefined | null): CartState {
  if (!store) return {};
  let parsed: unknown;
  try {
    const raw = store.getItem(CART_KEY);
    if (!raw) return {};
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object') return {};
  const next: CartState = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    const line = value as Partial<CartLine>;
    if (typeof line?.id !== 'string' || typeof line.qty !== 'number') continue;
    const product = productById(line.id);
    if (!product) continue;
    const chosen = typeof line.chosen === 'object' && line.chosen ? line.chosen : defaultChosen(product);
    if (lineKey(product.id, chosen) !== key) continue;
    next[key] = { key, id: product.id, chosen, qty: Math.max(1, Math.min(MAX_QTY, Math.round(line.qty))) };
  }
  return next;
}

export function saveCart(store: KvStore | undefined | null, cart: CartState): void {
  if (!store) return;
  if (Object.keys(cart).length === 0) store.removeItem(CART_KEY);
  else store.setItem(CART_KEY, JSON.stringify(cart));
}

/** A counter ticket the kitchen can call, not a name the customer has to give. */
export const orderNumber = (rand: () => number = Math.random): string =>
  'EL-' + Math.floor(1000 + rand() * 9000);
