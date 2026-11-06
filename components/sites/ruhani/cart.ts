import { FREE_SHIPPING_OVER, GST_RATE, SHIPPING_FLAT, gstInclusive, maker, pieces, type Piece } from './data';

/**
 * The basket for a bench that makes one piece at a time.
 *
 * Two things set it apart from a shop's cart. A line is keyed by piece *and*
 * the size or length chosen, because a 62mm bangle and a 66mm bangle are not
 * the same object. And the printed price already carries the 3% GST that
 * Indian jewellery is sold on, so the ticket shows how much of what you are
 * paying is tax instead of quietly adding it at the end.
 */
export const CART_KEY = 'rj-cart-v1';

/** Four of anything is more than one workbench has in a week. */
export const MAX_QTY = 4;

export interface CartLine {
  key: string;
  slug: string;
  chosen: string;
  qty: number;
}

export type CartState = Record<string, CartLine>;

export type CartAction =
  | { type: 'add'; line: CartLine }
  | { type: 'setQty'; key: string; qty: number }
  | { type: 'clear' }
  | { type: 'replace'; state: CartState };

export const pieceBySlug = (slug: string): Piece | undefined =>
  pieces.find((p) => p.slug === slug);

export const lineKey = (slug: string, chosen: string): string => `${slug}::${chosen}`;

/** The first option is the default, so the card price and the ticket agree. */
export const defaultChosen = (piece: Piece): string => piece.measure.options[0];

export const inr = (n: number): string => '₹' + Math.round(n).toLocaleString('en-IN');

export const lineTotal = (line: CartLine): number => {
  const piece = pieceBySlug(line.slug);
  return piece ? piece.price * line.qty : 0;
};

export const cartCount = (cart: CartState): number =>
  Object.values(cart).reduce((sum, line) => sum + line.qty, 0);

export interface Totals {
  /** Everything on the ticket, tax already inside it. */
  subtotal: number;
  /** The part of the subtotal that is GST. */
  gst: number;
  shipping: number;
  total: number;
  free: boolean;
  /** Rupees short of the free-courier line, zero once it is crossed. */
  toFree: number;
}

export function totals(cart: CartState): Totals {
  const lines = Object.values(cart);
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const gst = lines.reduce((sum, line) => sum + gstInclusive(lineTotal(line)), 0);
  const free = subtotal >= FREE_SHIPPING_OVER;
  const shipping = subtotal === 0 || free ? 0 : SHIPPING_FLAT;
  return {
    subtotal,
    gst,
    shipping,
    total: subtotal + shipping,
    free,
    toFree: free ? 0 : Math.max(0, FREE_SHIPPING_OVER - subtotal),
  };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state[action.line.key];
      const qty = Math.min(MAX_QTY, (existing?.qty ?? 0) + action.line.qty);
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

/** Re-read a saved basket, dropping anything the bench no longer sells. */
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
    if (typeof line?.slug !== 'string' || typeof line.qty !== 'number') continue;
    const piece = pieceBySlug(line.slug);
    if (!piece) continue;
    const chosen =
      typeof line.chosen === 'string' && piece.measure.options.includes(line.chosen)
        ? line.chosen
        : defaultChosen(piece);
    if (lineKey(piece.slug, chosen) !== key) continue;
    next[key] = {
      key,
      slug: piece.slug,
      chosen,
      qty: Math.max(1, Math.min(MAX_QTY, Math.round(line.qty))),
    };
  }
  return next;
}

export function saveCart(store: KvStore | undefined | null, cart: CartState): void {
  if (!store) return;
  if (Object.keys(cart).length === 0) store.removeItem(CART_KEY);
  else store.setItem(CART_KEY, JSON.stringify(cart));
}

export const leadFor = (line: CartLine): string => {
  const piece = pieceBySlug(line.slug);
  return piece ? leadRange(piece) : '';
};

/**
 * The message the order button opens on WhatsApp: a readable ticket, the
 * chosen sizes, and the tax line, so the bench can reply with a total instead
 * of a question.
 */
export function orderText(cart: CartState): string {
  const lines = Object.values(cart);
  const { gst, shipping, total } = totals(cart);
  const body = lines.map((line) => {
    const piece = pieceBySlug(line.slug);
    if (!piece) return '';
    return `• ${piece.name} — ${line.chosen} × ${line.qty}: ${inr(lineTotal(line))} (${leadFor(line)})`;
  });
  const courier = shipping === 0 ? 'Courier: free' : `Courier: ${inr(SHIPPING_FLAT)}`;
  return [
    `Hi ${maker.name}! I would like to order:`,
    '',
    ...body.filter(Boolean),
    '',
    `Total: ${inr(total)} — includes ${GST_RATE}% GST of ${inr(gst)}`,
    courier,
    '',
    'Tell me if a size is off and I will wait.',
  ].join('\n');
}

export function whatsappOrder(number: string, text: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

/**
 * A single-piece enquiry, opened from the product sheet. The size and the
 * price go in the message so the answer can be an answer, not another question.
 */
export function pieceText(piece: Piece, chosen: string, qty = 1): string {
  return [
    `Hi ${maker.name}! I would like the ${piece.name}${chosen ? ` in ${chosen}` : ''}.`,
    qty > 1 ? `Quantity: ${qty}.` : '',
    `I saw it at ${inr(piece.price)}, inclusive of GST, in ${leadRange(piece)}.`,
    '',
    'Is it possible, and when could it leave the bench?',
  ]
    .filter(Boolean)
    .join('\n');
}

export const leadRange = (piece: Piece): string => `${piece.lead[0]}–${piece.lead[1]} working days`;
