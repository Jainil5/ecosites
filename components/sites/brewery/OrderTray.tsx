'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  cartCount,
  cartTotal,
  inr,
  lineItems,
  orderNumber,
  parseVariantKey,
  type CartAction,
  type CartState,
} from './cart';
import { publishOrder } from '../order-bridge';

export function OrderTray({ cart, dispatch }: { cart: CartState; dispatch: (action: CartAction) => void }) {
  const [ticket, setTicket] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const lines = lineItems(cart);
  const total = cartTotal(cart);
  const count = cartCount(cart);
  const idle = count === 0 && !ticket;

  const place = () => {
    const num = orderNumber();
    publishOrder(window.localStorage, {
      id: `br-${Date.now()}-${num}`,
      createdAt: new Date().toISOString(),
      lines: lines.map(({ item, qty, unitPrice }) => ({ menuItemId: item.id, name: item.name, qty, unitPrice })),
    });
    setTicket(num);
    dispatch({ type: 'clear' });
  };

  return (
    <aside
      className="br-tray"
      aria-label="Your order"
      data-open={open ? 'true' : 'false'}
      data-idle={idle ? 'true' : 'false'}
    >
      {/* Phones and tablets get the tray as a constant bar pinned over the
          scrolling menu; desktop hides it and keeps the sticky side panel. */}
      <button
        type="button"
        className="br-tray-bar br-display"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{count > 0 ? `${count} on your tray` : 'Your order'}</span>
        <span className="br-tray-bar-total" key={total}>{inr(total)}</span>
        <span className="br-tray-bar-chev" aria-hidden>{open ? '▾' : '▴'}</span>
      </button>
      <div className="br-tray-scrim" aria-hidden onClick={() => setOpen(false)} />
      <div className="br-tray-panel">
        {ticket && lines.length === 0 ? (
          <div className="br-ticket" key={ticket}>
            <p className="br-ticket-stamp br-display">Order placed</p>
            <p className="br-ticket-no br-display">{ticket}</p>
            <p className="br-ticket-eta">
              Ready at the counter in about 15 minutes. We will call this number, not your name.
            </p>
            <button type="button" className="br-tray-restart" onClick={() => setTicket(null)}>
              Start another order
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="br-tray-empty">
            <p className="br-tray-head br-display">Your order</p>
            <p>Nothing on the tray yet — tap + on anything.</p>
          </div>
        ) : (
          <>
            <p className="br-tray-head br-display">Your order</p>
            <ul className="br-tray-lines">
              {lines.map(({ key, item, qty, unitPrice }) => {
                const { sizeId, addonIds } = parseVariantKey(key);
                const sizeLabel = sizeId && item.sizes ? item.sizes.find(s => s.id === sizeId)?.label : null;
                const addonLabels = addonIds.length && item.addons
                  ? addonIds.map(id => item.addons!.find(a => a.id === id)?.label).filter(Boolean)
                  : [];
                const variantText = [sizeLabel, ...addonLabels].filter(Boolean).join(', ');
                return (
                  <li key={key} className="br-tray-line">
                    <Image src={item.src} alt="" width={96} height={96} className="br-tray-thumb" />
                    <div className="br-tray-line-info">
                      <p className="br-display text-[13px] leading-tight text-[var(--br-ink)]">{item.name}</p>
                      {variantText && <p className="br-tray-variant">{variantText}</p>}
                      <p className="br-tray-each">{inr(unitPrice)} each</p>
                    </div>
                    <div className="br-tray-step">
                      <button
                        type="button"
                        aria-label={`One fewer ${item.name}`}
                        onClick={() => dispatch({ type: 'setQty', id: key, qty: qty - 1 })}
                      >
                        −
                      </button>
                      <span aria-live="polite">{qty}</span>
                      <button
                        type="button"
                        aria-label={`One more ${item.name}`}
                        onClick={() => dispatch({ type: 'setQty', id: key, qty: qty + 1 })}
                      >
                        +
                      </button>
                    </div>
                    <span className="br-tray-line-total">{inr(unitPrice * qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="br-tray-foot">
              <span className="br-display">Total</span>
              <span className="br-tray-total" key={total}>
                {inr(total)}
              </span>
            </div>
            <button type="button" className="br-btn br-tray-place" onClick={place}>
              Place order
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
