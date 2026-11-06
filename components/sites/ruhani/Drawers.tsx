'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Piece } from './Piece';
import { GST_RATE, gstInclusive, maker, type Piece as PieceType } from './data';
import {
  MAX_QTY,
  cartCount,
  inr,
  leadRange,
  lineKey,
  lineTotal,
  orderText,
  pieceBySlug,
  pieceText,
  totals,
  whatsappOrder,
  type CartAction,
  type CartState,
} from './cart';

/** Lock the page behind a sheet, and hand Escape back to whoever opened it. */
function useSheet(onClose: () => void) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return closeRef;
}

const CloseMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden className="rj-x">
    <path
      d="M6 6l12 12M18 6L6 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

interface PieceSheetProps {
  piece: PieceType;
  /** How many of this exact size the box already holds. */
  inCart: number;
  dispatch: (action: CartAction) => void;
  onClose: () => void;
}

/**
 * The piece, opened.
 *
 * The size lives here and not on the card because it is the only number that
 * decides whether the piece can be made at all — and because an engraved
 * question ("which length sits under your collar?") is what she actually
 * answers on WhatsApp, so the sheet is written to be replied to.
 */
export function PieceSheet({ piece, inCart, dispatch, onClose }: PieceSheetProps) {
  const closeRef = useSheet(onClose);
  const [chosen, setChosen] = useState(piece.measure.options[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Choosing again invalidates the "in the box" confirmation, and a new piece
  // must not inherit the previous sheet's size.
  const pick = (option: string) => {
    setChosen(option);
    setAdded(false);
  };

  const key = lineKey(piece.slug, chosen);
  const total = piece.price * qty;

  const add = () => {
    dispatch({ type: 'add', line: { key, slug: piece.slug, chosen, qty } });
    setAdded(true);
  };

  return (
    <motion.div className="rj-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={piece.name}
        className="rj-sheet"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 36, mass: 0.8 }}
      >
        <header className="rj-sheet-head">
          <p className="rj-eyebrow">{piece.finish}</p>
          <button ref={closeRef} type="button" className="rj-close" onClick={onClose} aria-label={`Close ${piece.name}`}>
            <CloseMark />
          </button>
        </header>

        <div className="rj-sheet-scroll">
          <div className={`rj-sheet-figure rj-sheet-figure-${piece.metal}`}>
            <Piece form={piece.form} className="rj-piece-lg" tone={piece.metal === 'gold' ? 'var(--rj-gold)' : undefined} />
          </div>

          <h2 className="rj-display rj-sheet-name">{piece.name}</h2>
          <p className="rj-sheet-type">{piece.type}</p>
          <p className="rj-sheet-note">{piece.note}</p>

          <p className="rj-sheet-price">
            {inr(piece.price)}
            <span className="rj-sheet-tax">
              {' '}
              — the {GST_RATE}% GST of {inr(gstInclusive(piece.price))} is already inside it
            </span>
          </p>

          <fieldset className="rj-choice">
            <legend className="rj-field-label">{piece.measure.label}</legend>
            <div className="rj-opts">
              {piece.measure.options.map((o) => (
                <button key={o} type="button" className="rj-opt" aria-pressed={chosen === o} onClick={() => pick(o)}>
                  {o}
                </button>
              ))}
            </div>
            <p className="rj-choice-hint">
              {piece.measure.options.length > 2
                ? 'Between two of them? Take the larger — the bench can always take it in.'
                : `Say the word if you need another ${piece.measure.label.toLowerCase()}, it is made the same price.`}
            </p>
          </fieldset>

          <dl className="rj-spec">
            <div>
              <dt>Metal</dt>
              <dd>{piece.finish}</dd>
            </div>
            <div>
              <dt>Stone</dt>
              <dd>{piece.stone ?? 'None — the metal is the stone'}</dd>
            </div>
            <div>
              <dt>Stamped</dt>
              <dd>{piece.stamp}</dd>
            </div>
            <div>
              <dt>Ready in</dt>
              <dd>{leadRange(piece)}</dd>
            </div>
          </dl>

          <p className="rj-care">{piece.care}</p>
          {piece.metal === 'gold' ? <p className="rj-care rj-care-gold">{maker.hallmarkNote}</p> : null}

          <div className="rj-sheet-foot">
            <div className="rj-stepper" role="group" aria-label="How many">
              <button type="button" aria-label="One fewer" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{qty}</span>
              <button type="button" aria-label="One more" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}>
                +
              </button>
            </div>
            <button type="button" className="rj-btn rj-btn-solid" onClick={add}>
              {added ? `In the box · ${chosen} ✓` : `Add to box · ${inr(total)}`}
            </button>
          </div>

          {inCart > 0 && !added ? (
            <p className="rj-hint">
              {inCart} already in the box. This adds {qty} more in {chosen}.
            </p>
          ) : null}

          <div className="rj-sheet-ask">
            <p className="rj-field-label">Or ask her first</p>
            <div className="rj-ask-row">
              <a
                className="rj-btn rj-btn-line"
                href={whatsappOrder(maker.whatsapp, pieceText(piece, chosen, qty))}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp this piece
              </a>
              <a
                className="rj-btn rj-btn-line"
                href={`mailto:${maker.email}?subject=${encodeURIComponent(piece.name)}&body=${encodeURIComponent(pieceText(piece, chosen, qty))}`}
              >
                Email this piece
              </a>
            </div>
            <p className="rj-ask-fine">
              The message goes out already carrying the size you chose, so a reply can be a date and
              not another question.
            </p>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

interface CartDrawerProps {
  cart: CartState;
  dispatch: (action: CartAction) => void;
  onClose: () => void;
}

/**
 * The box. A made-to-order bench does not take a card payment at midnight: the
 * ticket goes to WhatsApp, she checks the metal and the size, and sends a
 * payment link back. Everything the maths needs is shown before it is sent —
 * including how much of the total is tax.
 */
export function CartDrawer({ cart, dispatch, onClose }: CartDrawerProps) {
  const closeRef = useSheet(onClose);
  const lines = Object.values(cart);
  const count = cartCount(cart);
  const { subtotal, gst, shipping, total, free, toFree } = totals(cart);

  return (
    <motion.div className="rj-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Your box"
        className="rj-sheet rj-cart"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 36, mass: 0.8 }}
      >
        <header className="rj-sheet-head">
          <div>
            <p className="rj-eyebrow">{maker.name}</p>
            <h2 className="rj-display rj-sheet-title">In the box</h2>
          </div>
          <button ref={closeRef} type="button" className="rj-close" onClick={onClose} aria-label="Close the box">
            <CloseMark />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="rj-box-empty">
            <p className="rj-serif">The box is empty.</p>
            <p className="rj-box-empty-copy">
              Nothing chosen yet. The Chandni studs are where most people start — they are the pair
              nobody takes off.
            </p>
            <a href="#shop" className="rj-btn rj-btn-line" onClick={onClose}>
              Back to the shelf
            </a>
          </div>
        ) : (
          <>
            <ul className="rj-lines rj-sheet-scroll">
              {lines.map((line) => {
                const unit = lineTotal(line) / line.qty;
                return (
                  <motion.li key={line.key} layout className="rj-line">
                    <div className="rj-line-body">
                      <p className="rj-line-name">{nameOf(line.slug)}</p>
                      <p className="rj-line-var">
                        {line.chosen} · {inr(unit)} each
                      </p>
                      <div className="rj-stepper rj-stepper-sm" role="group" aria-label={`${nameOf(line.slug)} quantity`}>
                        <button
                          type="button"
                          aria-label={`One fewer ${nameOf(line.slug)}`}
                          onClick={() => dispatch({ type: 'setQty', key: line.key, qty: line.qty - 1 })}
                        >
                          −
                        </button>
                        <span>{line.qty}</span>
                        <button
                          type="button"
                          aria-label={`One more ${nameOf(line.slug)}`}
                          disabled={line.qty >= MAX_QTY}
                          onClick={() => dispatch({ type: 'add', line: { ...line, qty: line.qty + 1 } })}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="rj-line-drop"
                          aria-label={`Take the ${nameOf(line.slug)} out`}
                          onClick={() => dispatch({ type: 'setQty', key: line.key, qty: 0 })}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <span className="rj-line-total">{inr(lineTotal(line))}</span>
                  </motion.li>
                );
              })}
            </ul>

            <footer className="rj-cart-foot">
              {!free ? (
                <p className="rj-freebar">
                  {inr(toFree)} more and the courier is on her.
                </p>
              ) : (
                <p className="rj-freebar rj-freebar-on">Courier is free on this ticket.</p>
              )}

              <dl className="rj-sums">
                <div>
                  <dt>Goods, tax inside</dt>
                  <dd>{inr(subtotal)}</dd>
                </div>
                <div className="rj-sums-tax">
                  <dt>of which {GST_RATE}% GST</dt>
                  <dd>{inr(gst)}</dd>
                </div>
                <div>
                  <dt>Courier from Jaipur</dt>
                  <dd>{shipping === 0 ? 'Free' : inr(shipping)}</dd>
                </div>
                <div className="rj-sums-total">
                  <dt>To pay</dt>
                  <dd>{inr(total)}</dd>
                </div>
              </dl>

              <p className="rj-cart-fine">
                {count} {count === 1 ? 'piece' : 'pieces'} · nothing is charged here — she sends a
                payment link once the size and the metal are confirmed.
              </p>

              <a
                className="rj-btn rj-btn-solid rj-btn-send"
                href={whatsappOrder(maker.whatsapp, orderText(cart))}
                target="_blank"
                rel="noopener noreferrer"
              >
                Send the order on WhatsApp · {inr(total)}
              </a>
              <button type="button" className="rj-btn rj-btn-quiet" onClick={() => dispatch({ type: 'clear' })}>
                Empty the box
              </button>
            </footer>
          </>
        )}
      </motion.aside>
    </motion.div>
  );
}

const nameOf = (slug: string): string => pieceBySlug(slug)?.name ?? 'that piece';
