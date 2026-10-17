// components/sites/analytical-register/OrdersLog.tsx
'use client';
import { useMemo, useState } from 'react';
import { useOrderBook } from './store';
import { formatMoney } from './pricing';
import { BillView } from './BillView';
import type { Order } from './types';

export function OrdersLog() {
  const { state } = useOrderBook();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Order | null>(null);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...state.orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((o) => !needle
        || String(o.billNumber).includes(needle)
        || (o.customer?.name ?? '').toLowerCase().includes(needle)
        || o.lines.some((l) => l.name.toLowerCase().includes(needle)));
  }, [state.orders, q]);

  return (
    <section className="ob-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Orders</h2>
        <input placeholder="Search bill, customer, item" value={q} onChange={(e) => setQ(e.target.value)}
          className="w-56 rounded-lg border border-[var(--ob-line)] px-3 py-1.5 text-sm" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--ob-muted)]">
            <tr><th className="py-2">#</th><th>Date</th><th>Customer</th><th>Items</th><th className="text-right">Total</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-[var(--ob-line)]">
                <td className="py-2">{o.billNumber}</td>
                <td>{new Date(o.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td>{o.customer?.name ?? '—'}</td>
                <td>{o.lines.reduce((n, l) => n + l.qty, 0)}</td>
                <td className="text-right font-semibold">{formatMoney(o.total, o.currency)}</td>
                <td className="text-right"><button className="ob-btn-ghost py-1 text-xs" onClick={() => setOpen(o)}>View bill</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-[var(--ob-muted)]">No orders match.</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <BillView order={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
