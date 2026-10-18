'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  cartCount,
  cartTotal,
  inr,
  lineItems,
  orderNumber,
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

  const place = () => {
    const num = orderNumber();
    // Hand the bill to the OrderBook demo so the two stories stay connected.
    publishOrder(window.localStorage, {
      id: `dc-${Date.now()}-${num}`,
      createdAt: new Date().toISOString(),
      lines: lines.map(({ item, qty }) => ({ menuItemId: item.id, name: item.name, qty, unitPrice: item.amount })),
    });
    setTicket(num);
    dispatch({ type: 'clear' });
  };

  return (
    <aside className="dc-tray" aria-label="Your order" data-open={open ? 'true' : 'false'}>
      {/* Phones and tablets get the tray as a constant bar pinned over the
          scrolling menu; desktop hides it and keeps the sticky side panel. */}
      <button
        type="button"
        className="dc-tray-bar dc-display"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{count > 0 ? `${count} on your tray` : 'Your order'}</span>
        <span className="dc-tray-bar-total" key={total}>{inr(total)}</span>
        <span className="dc-tray-bar-chev" aria-hidden>{open ? '▾' : '▴'}</span>
      </button>
      <div className="dc-tray-scrim" aria-hidden onClick={() => setOpen(false)} />
      <div className="dc-tray-panel">
        {ticket && lines.length === 0 ? (
          <div className="dc-ticket" key={ticket}>
            <p className="dc-ticket-stamp dc-display">Order placed</p>
            <p className="dc-ticket-no dc-display">{ticket}</p>
            <p className="dc-ticket-eta">
              Ready at the counter in about 15 minutes. We will call this number, not your name.
            </p>
            <button type="button" className="dc-tray-restart" onClick={() => setTicket(null)}>
              Start another order
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="dc-tray-empty">
            <p className="dc-tray-head dc-display">Your order</p>
            <p>Nothing on the tray yet — tap + on anything.</p>
          </div>
        ) : (
          <>
            <p className="dc-tray-head dc-display">Your order</p>
            <ul className="dc-tray-lines">
              {lines.map(({ item, qty }) => (
                <li key={item.id} className="dc-tray-line">
                  <Image src={item.src} alt="" width={96} height={96} className="dc-tray-thumb" />
                  <div className="dc-tray-line-info">
                    <p className="dc-display text-[13px] leading-tight text-[var(--dc-ink)]">{item.name}</p>
                    <p className="dc-tray-each">{item.price} each</p>
                  </div>
                  <div className="dc-tray-step">
                    <button
                      type="button"
                      aria-label={`One fewer ${item.name}`}
                      onClick={() => dispatch({ type: 'setQty', id: item.id, qty: qty - 1 })}
                    >
                      −
                    </button>
                    <span aria-live="polite">{qty}</span>
                    <button
                      type="button"
                      aria-label={`One more ${item.name}`}
                      onClick={() => dispatch({ type: 'setQty', id: item.id, qty: qty + 1 })}
                    >
                      +
                    </button>
                  </div>
                  <span className="dc-tray-line-total">{inr(item.amount * qty)}</span>
                </li>
              ))}
            </ul>
            <div className="dc-tray-foot">
              <span className="dc-display">Total</span>
              <span className="dc-tray-total" key={total}>
                {inr(total)}
              </span>
            </div>
            <button type="button" className="dc-btn dc-tray-place" onClick={place}>
              Place order
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
