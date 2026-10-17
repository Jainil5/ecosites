// test/analytical-register-pricing.test.ts
import { describe, expect, it } from 'vitest';
import { computeTotals, formatMoney } from '@/components/sites/analytical-register/pricing';
import type { OrderLine } from '@/components/sites/analytical-register/types';

const line = (unitPrice: number, qty: number): OrderLine => ({
  menuItemId: 'm', name: 'X', unitPrice, qty,
});

describe('computeTotals', () => {
  it('splits GST into two halves that sum to the tax', () => {
    const t = computeTotals([line(57.5, 2)], 0.05);
    expect(t.subtotal).toBe(115);
    expect(t.cgst).toBe(2.87);
    expect(t.sgst).toBe(2.88);
    expect(t.total).toBe(121);
    expect(t.roundOff).toBe(0.25);
  });
  it('invariant: subtotal + cgst + sgst + roundOff === total', () => {
    for (const l of [[line(33, 3)], [line(99.99, 7), line(1, 1)], [line(150, 1)]]) {
      const t = computeTotals(l, 0.05);
      const sum = Math.round((t.subtotal + t.cgst + t.sgst + t.roundOff) * 100);
      expect(sum).toBe(Math.round(t.total * 100));
    }
  });
  it('handles a zero GST rate with no tax', () => {
    const t = computeTotals([line(100, 1)], 0);
    expect(t.cgst).toBe(0);
    expect(t.sgst).toBe(0);
    expect(t.total).toBe(100);
  });
  it('rounds to the nearest whole rupee', () => {
    expect(computeTotals([line(10, 1)], 0.05).total).toBe(11); // 10 + 0.5 -> 10.5 -> 11
    expect(computeTotals([line(20, 1)], 0.05).total).toBe(21); // 20 + 1.0 -> 21
  });
});

describe('formatMoney', () => {
  it('formats with the currency symbol and two decimals', () => {
    expect(formatMoney(121, '₹')).toBe('₹121.00');
    expect(formatMoney(1234.5, '₹')).toBe('₹1,234.50');
  });
});
