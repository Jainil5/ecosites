// components/sites/analytical-register/pricing.ts
import type { OrderLine, Totals } from './types';

const paise = (n: number) => Math.round(n * 100);
const rupees = (p: number) => p / 100;

export function computeTotals(lines: OrderLine[], gstRate: number): Totals {
  let subtotalP = 0;
  for (const l of lines) subtotalP += paise(l.unitPrice) * l.qty;
  const taxP = Math.round(subtotalP * gstRate);
  const cgstP = Math.floor(taxP / 2);
  const sgstP = taxP - cgstP;
  const rawTotalP = subtotalP + taxP;
  const roundedTotalP = Math.round(rawTotalP / 100) * 100; // nearest whole rupee
  const roundOffP = roundedTotalP - rawTotalP;
  return {
    subtotal: rupees(subtotalP),
    cgst: rupees(cgstP),
    sgst: rupees(sgstP),
    roundOff: rupees(roundOffP),
    total: rupees(roundedTotalP),
  };
}

export function formatMoney(n: number, currency: string): string {
  return currency + n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
