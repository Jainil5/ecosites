// test/analytical-register-bill-text.test.ts
import { describe, expect, it } from 'vitest';
import { billToText, buildWaMeLink } from '@/components/sites/analytical-register/bill-text';
import type { Brand, Order } from '@/components/sites/analytical-register/types';

const brand: Brand = {
  id: 'ob', name: 'Bean & Brunch', tagline: 'x', accent: '#000',
  gstNumber: '27ABCDE1234F1Z5', phone: '919876543210', currency: '₹', gstRate: 0.05,
};
const order: Order = {
  id: '1', billNumber: 7, createdAt: '2026-10-17T09:30:00.000Z',
  lines: [{ menuItemId: 'm1', name: 'Cappuccino', qty: 2, unitPrice: 180 }],
  subtotal: 360, cgst: 9, sgst: 9, roundOff: 0, total: 378,
  customer: { phone: '919988776655', name: 'Aditi' },
  status: 'paid', brandName: 'Bean & Brunch', gstRate: 0.05, currency: '₹',
};

describe('billToText', () => {
  it('includes brand, bill number, lines, GST and total', () => {
    const t = billToText(order, brand);
    expect(t).toContain('Bean & Brunch');
    expect(t).toContain('#7');
    expect(t).toContain('Cappuccino');
    expect(t).toContain('CGST');
    expect(t).toContain('₹378.00');
    expect(t).toContain('Thank you');
  });
  it('omits CGST/SGST when the rate is zero', () => {
    const t = billToText({ ...order, cgst: 0, sgst: 0, gstRate: 0 }, brand);
    expect(t).not.toContain('CGST');
  });
});

describe('buildWaMeLink', () => {
  it('opens wa.me with the customer phone and encoded text', () => {
    const link = buildWaMeLink(order, brand);
    expect(link.startsWith('https://wa.me/919988776655?text=')).toBe(true);
    expect(link).toContain(encodeURIComponent('Thank you'));
  });
  it('returns an empty string when there is no phone', () => {
    expect(buildWaMeLink({ ...order, customer: undefined }, brand)).toBe('');
  });
});
