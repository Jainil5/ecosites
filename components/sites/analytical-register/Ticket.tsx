// components/sites/analytical-register/Ticket.tsx
'use client';
import { useState } from 'react';
import { useOrderBook } from './store';
import { computeTotals, formatMoney } from './pricing';
import { BillView } from './BillView';
import type { Order } from './types';

const digits = (s: string) => s.replace(/\D/g, '');

export function Ticket() {
  const { state, dispatch } = useOrderBook();
  const [lastBill, setLastBill] = useState<Order | null>(null);
  const totals = computeTotals(state.ticket, state.brand.gstRate);
  const cust = state.ticketCustomer ?? { phone: '', name: '' };

  const create = () => {
    const cleanPhone = digits(cust.phone);
    const order = {
      id: (crypto.randomUUID?.() ?? String(Date.now())),
      now: new Date().toISOString(),
    };
    dispatch({ type: 'set-ticket-customer', customer: cleanPhone || cust.name ? { phone: cleanPhone, name: cust.name } : undefined });
    dispatch({ type: 'create-order', id: order.id, now: order.now });
    // Build the preview order locally so the memo opens immediately.
    const preview: Order = {
      id: order.id,
      // Same logic as the reducer's nextBill: orders are not contiguous,
      // so base the preview on the highest existing bill number.
      billNumber: Math.max(0, ...state.orders.map(o => o.billNumber)) + 1,
      createdAt: order.now,
      lines: state.ticket,
      ...totals,
      customer: cleanPhone || cust.name ? { phone: cleanPhone, name: cust.name } : undefined,
      note: state.ticketNote,
      status: 'paid',
      brandName: state.brand.name,
      gstRate: state.brand.gstRate,
      currency: state.brand.currency,
    };
    setLastBill(preview);
  };

  return (
    <aside className="ob-card h-fit p-4 lg:sticky lg:top-20">
      <h2 className="mb-3 text-lg font-bold">Current ticket</h2>
      {state.ticket.length === 0 && <p className="text-sm text-[var(--ob-muted)]">Tap menu items to add them.</p>}
      <ul className="space-y-2">
        {state.ticket.map((l) => (
          <li key={l.menuItemId} className="flex items-center gap-2 text-sm">
            <span className="flex-1">{l.name}</span>
            <button className="rounded border border-[var(--ob-line)] px-2" onClick={() => dispatch({ type: 'set-qty', menuItemId: l.menuItemId, qty: l.qty - 1 })}>−</button>
            <span className="w-6 text-center">{l.qty}</span>
            <button className="rounded border border-[var(--ob-line)] px-2" onClick={() => dispatch({ type: 'set-qty', menuItemId: l.menuItemId, qty: l.qty + 1 })}>+</button>
            <span className="w-16 text-right">{formatMoney(l.unitPrice * l.qty, state.brand.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-2 border-t border-[var(--ob-line)] pt-3 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(totals.subtotal, state.brand.currency)}</span></div>
        {totals.cgst > 0 && <div className="flex justify-between"><span>CGST</span><span>{formatMoney(totals.cgst, state.brand.currency)}</span></div>}
        {totals.sgst > 0 && <div className="flex justify-between"><span>SGST</span><span>{formatMoney(totals.sgst, state.brand.currency)}</span></div>}
        {totals.roundOff !== 0 && <div className="flex justify-between"><span>Round off</span><span>{formatMoney(totals.roundOff, state.brand.currency)}</span></div>}
        <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatMoney(totals.total, state.brand.currency)}</span></div>
      </div>
      <div className="mt-3 space-y-2">
        <input placeholder="Customer name" className="w-full rounded-lg border border-[var(--ob-line)] px-3 py-2 text-sm"
          value={cust.name} onChange={(e) => dispatch({ type: 'set-ticket-customer', customer: { ...cust, name: e.target.value } })} />
        <input placeholder="Phone (with country code)" className="w-full rounded-lg border border-[var(--ob-line)] px-3 py-2 text-sm"
          value={cust.phone} onChange={(e) => dispatch({ type: 'set-ticket-customer', customer: { ...cust, phone: e.target.value } })} />
      </div>
      <div className="mt-4 flex gap-2">
        <button className="ob-btn-ghost flex-1" onClick={() => dispatch({ type: 'clear-ticket' })} disabled={state.ticket.length === 0}>Clear</button>
        <button className="ob-btn flex-1" onClick={create} disabled={state.ticket.length === 0}>Create bill</button>
      </div>
      {lastBill && <BillView order={lastBill} onClose={() => setLastBill(null)} />}
    </aside>
  );
}
