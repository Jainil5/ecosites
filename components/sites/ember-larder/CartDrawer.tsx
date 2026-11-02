'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GST_RATE, MAX_QTY, cartCount, chosenLabel, inr, orderNumber, productById, totals, unitPrice, type CartAction, type CartState } from './cart';
import { larder } from './data';
import { FlameMark } from './FlameMark';

interface CartDrawerProps {
  cart: CartState;
  dispatch: (action: CartAction) => void;
  onClose: () => void;
}

/**
 * The pass. One ticket for both halves of the business, so a table can add a
 * jar to what they are already eating. Sending it is a studio action — the
 * number it prints is a counter call, not a real order.
 */
export function CartDrawer({ cart, dispatch, onClose }: CartDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [ticket, setTicket] = useState<string | null>(null);
  const lines = Object.values(cart);
  const count = cartCount(cart);
  const { subtotal, gst, total } = totals(cart);
  const pantry = useMemo(
    () => lines.some((l) => productById(l.id)?.group === 'pantry'),
    [lines],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const send = () => {
    if (count === 0) return;
    setTicket(orderNumber());
    dispatch({ type: 'clear' });
  };

  return (
    <motion.div className="el-scrim el-drawer-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.aside
        className="el-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Your basket"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 38, mass: 0.8 }}
      >
        <header className="el-drawer-head">
          <div>
            <p className="el-kicker">{larder.name}</p>
            <h2 className="el-display el-drawer-title">{ticket ? 'Sent to the fire' : 'On the pass'}</h2>
          </div>
          <button ref={closeRef} type="button" className="el-drawer-close" onClick={onClose} aria-label="Close basket">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {ticket ? (
          <div className="el-ticket">
            <FlameMark className="el-ticket-mark" />
            <p className="el-ticket-no">{ticket}</p>
            <p className="el-ticket-copy">
              The kitchen has the ticket. Hold the number and we will call it at the hearth rail —
              plates first, then the jars, packed on Tuesday.
            </p>
            <p className="el-ticket-fine">
              The Larder is our own house, built for this product — the ticket arithmetic is real,
              the plates are not, and{' '}
              <a href={`tel:+91${larder.phone}`}>{larder.phone}</a> is a reserved number, so a
              build like this one starts on our contact page.
            </p>
            <button type="button" className="el-btn el-btn-ember el-ticket-again" onClick={() => setTicket(null)}>
              Build another ticket
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="el-drawer-empty">
            <p className="el-serif">The basket is cold.</p>
            <p className="el-drawer-empty-copy">
              Nothing on the pass yet. Start with the ribs, or take a jar off the shelf.
            </p>
            <a href="#products" className="el-btn el-btn-ghost" onClick={onClose}>
              Back to the menu
            </a>
          </div>
        ) : (
          <>
            <ul className="el-lines">
              {lines.map((line) => {
                const p = productById(line.id);
                if (!p) return null;
                const unit = unitPrice(p, line.chosen);
                const trail = chosenLabel(p, line.chosen);
                return (
                  <motion.li key={line.key} layout className="el-line">
                    <Image
                      src={p.image}
                      alt=""
                      width={p.w}
                      height={p.h}
                      sizes="72px"
                      className="el-line-img"
                    />
                    <div className="el-line-body">
                      <p className="el-line-name">{p.name}</p>
                      {trail ? <p className="el-line-var">{trail}</p> : null}
                      <p className="el-line-unit">
                        {inr(unit)} {line.qty > 1 ? `each · ${line.qty} on the ticket` : ''}
                      </p>
                      <div className="el-stepper el-stepper-sm" role="group" aria-label={`${p.name} quantity`}>
                        <button
                          type="button"
                          aria-label={`One fewer ${p.name}`}
                          onClick={() => dispatch({ type: 'setQty', key: line.key, qty: line.qty - 1 })}
                        >
                          −
                        </button>
                        <span>{line.qty}</span>
                        <button
                          type="button"
                          aria-label={`One more ${p.name}`}
                          disabled={line.qty >= MAX_QTY}
                          onClick={() => dispatch({ type: 'add', qty: 1, line: { ...line, qty: line.qty + 1 } })}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="el-line-drop"
                          aria-label={`Drop ${p.name} from the basket`}
                          onClick={() => dispatch({ type: 'setQty', key: line.key, qty: 0 })}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <span className="el-line-total">{inr(unit * line.qty)}</span>
                  </motion.li>
                );
              })}
            </ul>

            <footer className="el-drawer-foot">
              {pantry ? (
                <p className="el-drawer-note">
                  Pantry jars leave with the Tuesday restock — collect at the door, or we post them.
                </p>
              ) : null}
              <dl className="el-sums">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{inr(subtotal)}</dd>
                </div>
                <div>
                  <dt>GST ({Math.round(GST_RATE * 100)}%)</dt>
                  <dd>{inr(gst)}</dd>
                </div>
                <div className="el-sums-total">
                  <dt>To pay</dt>
                  <dd>{inr(total)}</dd>
                </div>
              </dl>
              <p className="el-drawer-fine">
                {count} {count === 1 ? 'thing' : 'things'} on the ticket · the table settles at the end
              </p>
              <button type="button" className="el-btn el-btn-ember el-drawer-send" onClick={send}>
                Send to the fire · {inr(total)}
              </button>
            </footer>
          </>
        )}
      </motion.aside>
    </motion.div>
  );
}
