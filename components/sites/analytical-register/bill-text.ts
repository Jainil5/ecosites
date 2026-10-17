// components/sites/analytical-register/bill-text.ts
import { formatMoney } from './pricing';
import type { Brand, Order } from './types';

function day(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function billToText(order: Order, brand: Brand): string {
  const cur = order.currency;
  const lines = order.lines.map(
    (l) => `• ${l.name} x${l.qty}  ${formatMoney(l.unitPrice * l.qty, cur)}`,
  );
  const parts = [
    `*${order.brandName}*`,
    order.customer ? `Hi ${order.customer.name}, here is your bill.` : 'Here is your bill.',
    '',
    `Bill #${order.billNumber} · ${day(order.createdAt)}`,
    ...lines,
    '',
    `Subtotal: ${formatMoney(order.subtotal, cur)}`,
  ];
  if (order.cgst > 0 || order.sgst > 0) {
    parts.push(`CGST: ${formatMoney(order.cgst, cur)}`, `SGST: ${formatMoney(order.sgst, cur)}`);
  }
  if (order.roundOff !== 0) parts.push(`Round off: ${formatMoney(order.roundOff, cur)}`);
  parts.push(`*Total: ${formatMoney(order.total, cur)}*`);
  if (brand.gstNumber) parts.push(`GSTIN: ${brand.gstNumber}`);
  parts.push('', 'Thank you — visit again!');
  return parts.join('\n');
}

export function buildWaMeLink(order: Order, brand: Brand): string {
  const digits = (order.customer?.phone ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(billToText(order, brand))}`;
}
