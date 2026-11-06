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
      id: `bc-${Date.now()}-${num}`,
      createdAt: new Date().toISOString(),
      lines: lines.map(({ item, qty, unitPrice }) => ({ menuItemId: item.id, name: item.name, qty, unitPrice })),
    });
    setTicket(num);
    dispatch({ type: 'clear' });
  };

  return (
    <aside
      className="bc-tray"
      aria-label="Your order"
      data-open={open ? 'true' : 'false'}
      data-idle={idle ? 'true' : 'false'}
    >
      {/* Phones and tablets get the tray as a constant bar pinned over the
          scrolling menu; desktop hides it and keeps the sticky side panel. */}
      <button
        type="button"
        className="bc-tray-bar bc-display"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{count > 0 ? `${count} on your tray` : 'Your order'}</span>
        <span className="bc-tray-bar-total" key={total}>{inr(total)}</span>
        <span className="bc-tray-bar-chev" aria-hidden>{open ? '▾' : '▴'}</span>
      </button>
      <div className="bc-tray-scrim" aria-hidden onClick={() => setOpen(false)} />
      <div className="bc-tray-panel">
        {ticket && lines.length === 0 ? (
          <div className="bc-ticket" key={ticket}>
            <p className="bc-ticket-stamp bc-display">Order placed</p>
            <p className="bc-ticket-no bc-display">{ticket}</p>
            <p className="bc-ticket-eta">
              Ready at the counter in about 15 minutes. We will call this number, not your name.
            </p>
            <button type="button" className="bc-tray-restart" onClick={() => setTicket(null)}>
              Start another order
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="bc-tray-empty">
            <p className="bc-tray-head bc-display">Your order</p>
            <p>Nothing on the tray yet — tap + on anything.</p>
          </div>
        ) : (
          <>
            <p className="bc-tray-head bc-display">Your order</p>
            <ul className="bc-tray-lines">
              {lines.map(({ key, item, qty, unitPrice }) => {
                const { sizeId, addonIds } = parseVariantKey(key);
                const sizeLabel = sizeId && item.sizes ? item.sizes.find(s => s.id === sizeId)?.label : null;
                const addonLabels = addonIds.length && item.addons
                  ? addonIds.map(id => item.addons!.find(a => a.id === id)?.label).filter(Boolean)
                  : [];
                const variantText = [sizeLabel, ...addonLabels].filter(Boolean).join(', ');
                return (
                  <li key={key} className="bc-tray-line">
                    <Image src={item.src} alt="" width={96} height={96} className="bc-tray-thumb" />
                    <div className="bc-tray-line-info">
                      <p className="bc-display text-[13px] leading-tight text-[var(--bc-ink)]">{item.name}</p>
                      {variantText && <p className="bc-tray-variant">{variantText}</p>}
                      <p className="bc-tray-each">{inr(unitPrice)} each</p>
                    </div>
                    <div className="bc-tray-step">
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
                    <span className="bc-tray-line-total">{inr(unitPrice * qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="bc-tray-foot">
              <span className="bc-display">Total</span>
              <span className="bc-tray-total" key={total}>
                {inr(total)}
              </span>
            </div>
            <button type="button" className="bc-btn bc-tray-place" onClick={place}>
              Place order
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
