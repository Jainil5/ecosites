// test/order-bridge.test.ts
import { describe, expect, it } from 'vitest';
import {
  PUBLISHED_KEY,
  mergePublished,
  publishOrder,
  readPublished,
  type PublishedOrder,
} from '@/components/sites/order-bridge';
import { defaultBrand } from '@/components/sites/analytical-register/menu-data';

const memStore = () => {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
};

const first: PublishedOrder = {
  id: 'br-1',
  createdAt: '2026-10-18T09:30:00.000Z',
  lines: [{ menuItemId: 'flat-white', name: 'Flat White', qty: 2, unitPrice: 220 }],
  customer: { phone: '919876500000', name: 'Aditi' },
};
const second: PublishedOrder = {
  id: 'br-2',
  createdAt: '2026-10-18T10:00:00.000Z',
  lines: [{ menuItemId: 'espresso', name: 'Espresso', qty: 1, unitPrice: 150 }],
};

describe('order bridge (Brewery → OrderBook)', () => {
  it('publishes a cafe order into shared storage and reads it back', () => {
    const s = memStore();
    publishOrder(s, first);
    expect(readPublished(s)).toEqual([first]);
  });
  it('ignores duplicate ids on publish', () => {
    const s = memStore();
    publishOrder(s, first);
    publishOrder(s, first);
    expect(readPublished(s)).toHaveLength(1);
  });
  it('returns nothing for corrupt payloads', () => {
    const s = memStore();
    s.setItem(PUBLISHED_KEY, '{oops');
    expect(readPublished(s)).toEqual([]);
  });
  it('mergePublished materialises orders with GST snapshots and bills', () => {
    const out = mergePublished([], [first], defaultBrand);
    expect(out).toHaveLength(1);
    const o = out[0];
    expect(o.billNumber).toBe(1);
    expect(o.status).toBe('paid');
    expect(o.brandName).toBe(defaultBrand.name);
    expect(o.customer?.name).toBe('Aditi');
    expect(Math.round((o.subtotal + o.cgst + o.sgst + o.roundOff) * 100))
      .toBe(Math.round(o.total * 100));
  });
  it('skips orders already in the book and continues bill numbers', () => {
    const seeded = mergePublished([], [first], defaultBrand);
    const merged = mergePublished(seeded, [first, second], defaultBrand);
    expect(merged.map((o) => o.id)).toEqual(['br-1', 'br-2']);
    expect(merged.map((o) => o.billNumber)).toEqual([1, 2]);
  });
});
