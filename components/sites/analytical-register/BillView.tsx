// components/sites/analytical-register/BillView.tsx
'use client';
import { useEffect } from 'react';
import { useOrderBook } from './store';
import { formatMoney } from './pricing';
import { billToText, buildWaMeLink } from './bill-text';
import type { Order } from './types';

export function BillView({ order, onClose }: { order: Order; onClose: () => void }) {
  const { state } = useOrderBook();
  const link = buildWaMeLink(order, state.brand);
  const cur = order.currency;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Bill ${order.billNumber}`}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="ob-card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="text-lg font-extrabold ob-accent-text">{order.brandName}</div>
          <div className="text-xs text-[var(--ob-muted)]">Bill #{order.billNumber}</div>
        </div>
        <ul className="my-4 space-y-1 text-sm">
          {order.lines.map((l) => (
            <li key={l.menuItemId} className="flex justify-between"><span>{l.name} ×{l.qty}</span><span>{formatMoney(l.unitPrice * l.qty, cur)}</span></li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-[var(--ob-line)] pt-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(order.subtotal, cur)}</span></div>
          {order.cgst > 0 && <div className="flex justify-between"><span>CGST</span><span>{formatMoney(order.cgst, cur)}</span></div>}
          {order.sgst > 0 && <div className="flex justify-between"><span>SGST</span><span>{formatMoney(order.sgst, cur)}</span></div>}
          {order.roundOff !== 0 && <div className="flex justify-between"><span>Round off</span><span>{formatMoney(order.roundOff, cur)}</span></div>}
          <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatMoney(order.total, cur)}</span></div>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          {link
            ? <a className="ob-btn text-center" href={link} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
            : <button className="ob-btn" disabled title="Add a customer phone to enable WhatsApp">Send on WhatsApp</button>}
          <button className="ob-btn-ghost" onClick={() => navigator.clipboard?.writeText(billToText(order, state.brand))}>Copy bill</button>
          <button className="text-sm text-[var(--ob-muted)]" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
