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
      id: `cc-${Date.now()}-${num}`,
      createdAt: new Date().toISOString(),
      lines: lines.map(({ item, qty }) => ({ menuItemId: item.id, name: item.name, qty, unitPrice: item.amount })),
    });
    setTicket(num);
    dispatch({ type: 'clear' });
  };

  return (
    <aside className="cc-tray" aria-label="Your order" data-open={open ? 'true' : 'false'}>
      {/* Phones and tablets get the tray as a constant bar pinned over the
          scrolling menu; desktop hides it and keeps the sticky side panel. */}
      <button
        type="button"
        className="cc-tray-bar cc-display"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{count > 0 ? `${count} on your tray` : 'Your order'}</span>
        <span className="cc-tray-bar-total" key={total}>{inr(total)}</span>
        <span className="cc-tray-bar-chev" aria-hidden>{open ? '▾' : '▴'}</span>
      </button>
      <div className="cc-tray-scrim" aria-hidden onClick={() => setOpen(false)} />
      <div className="cc-tray-panel">
        {ticket && lines.length === 0 ? (
          <div className="cc-ticket" key={ticket}>
            <p className="cc-ticket-stamp cc-display">Order placed</p>
            <p className="cc-ticket-no cc-display">{ticket}</p>
            <p className="cc-ticket-eta">
              Ready at the counter in about 15 minutes. We will call this number, not your name.
            </p>
            <button type="button" className="cc-tray-restart" onClick={() => setTicket(null)}>
              Start another order
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="cc-tray-empty">
            <p className="cc-tray-head cc-display">Your order</p>
            <p>Nothing on the tray yet — tap + on anything.</p>
          </div>
        ) : (
          <>
            <p className="cc-tray-head cc-display">Your order</p>
            <ul className="cc-tray-lines">
              {lines.map(({ item, qty }) => (
                <li key={item.id} className="cc-tray-line">
                  <Image src={item.src} alt="" width={96} height={96} className="cc-tray-thumb" />
                  <div className="cc-tray-line-info">
                    <p className="cc-display text-[13px] leading-tight text-[var(--cc-ink)]">{item.name}</p>
                    <p className="cc-tray-each">{item.price} each</p>
                  </div>
                  <div className="cc-tray-step">
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
                  <span className="cc-tray-line-total">{inr(item.amount * qty)}</span>
                </li>
              ))}
            </ul>
            <div className="cc-tray-foot">
              <span className="cc-display">Total</span>
              <span className="cc-tray-total" key={total}>
                {inr(total)}
              </span>
            </div>
            <button type="button" className="cc-btn cc-tray-place" onClick={place}>
              Place order
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
