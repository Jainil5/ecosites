'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { isRecommended, type Product } from './data';
import {
  MAX_QTY,
  chosenLabel,
  defaultChosen,
  inr,
  lineKey,
  unitPrice,
  type CartAction,
} from './cart';
import { FlameMark } from './FlameMark';

interface ProductDialogProps {
  product: Product;
  /** How many of this exact variant the basket already holds. */
  inCart: number;
  dispatch: (action: CartAction) => void;
  onClose: () => void;
}

/**
 * The order sheet. Variant choices live here, not on the card, because the
 * price changes with them — half rack is not the same ticket as a full one.
 */
export function ProductDialog({ product, inCart, dispatch, onClose }: ProductDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [chosen, setChosen] = useState<Record<string, string>>(() => defaultChosen(product));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

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

  const price = unitPrice(product, chosen);
  const key = lineKey(product.id, chosen);
  const trail = chosenLabel(product, chosen);

  const placeOrder = () => {
    dispatch({ type: 'add', qty, line: { key, id: product.id, chosen, qty } });
    setAdded(true);
  };

  /** Re-choosing a variant means the previous "in basket" confirmation is stale. */
  const pick = (choiceId: string, optionId: string) => {
    setChosen((prev) => ({ ...prev, [choiceId]: optionId }));
    setAdded(false);
  };

  return (
    <motion.div
      className="el-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="el-dialog"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          ref={closeRef}
          type="button"
          className="el-dialog-close"
          onClick={onClose}
          aria-label={`Close ${product.name}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="el-dialog-media">
          <Image
            src={product.image}
            alt={product.name}
            width={product.w}
            height={product.h}
            sizes="(max-width: 860px) 100vw, 44vw"
            className="el-dialog-img"
          />
          {isRecommended(product) ? (
            <span className="el-dialog-award">
              <FlameMark className="el-dialog-award-mark" />
              House signature
            </span>
          ) : null}
        </div>

        <div className="el-dialog-body">
          <p className="el-kicker">{product.group === 'fire' ? 'From the fire' : 'The pantry shelf'}</p>
          <h3 className="el-display el-dialog-name">{product.name}</h3>
          <p className="el-serif el-dialog-note">{product.note}</p>

          <ul className="el-card-tags">
            {product.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="el-dialog-list">
            <p className="el-field-label">What goes in it</p>
            <ul>{product.details.ingredients.map((i) => <li key={i}>{i}</li>)}</ul>
            <p className="el-field-label">{product.group === 'fire' ? 'On the plate' : 'In the jar'}</p>
            <p className="el-dialog-plain">{product.details.metric}</p>
            {product.details.allergens.length ? (
              <p className="el-dialog-allergens">
                Contains {product.details.allergens.join(', ')} — tell us at the table and we will
                work around it.
              </p>
            ) : (
              <p className="el-dialog-allergens">No listed allergens on this line.</p>
            )}
          </div>

          {product.choices?.length ? (
            <div className="el-dialog-choices">
              {product.choices.map((c) => (
                <fieldset key={c.id} className="el-choice">
                  <legend className="el-field-label">{c.label}</legend>
                  <div className="el-choice-opts">
                    {c.options.map((o) => {
                      const on = chosen[c.id] === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          className="el-opt"
                          aria-pressed={on}
                          onClick={() => pick(c.id, o.id)}
                        >
                          <span>{o.label}</span>
                          {o.delta !== 0 ? (
                            <span className="el-opt-delta">{o.delta > 0 ? `+${inr(o.delta)}` : `−${inr(-o.delta)}`}</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          ) : null}

          <div className="el-dialog-foot">
            <div className="el-stepper el-stepper-lg" role="group" aria-label="How many">
              <button type="button" aria-label="One fewer" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                aria-label="One more"
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
              >
                +
              </button>
            </div>

            <button type="button" className="el-dialog-add" onClick={placeOrder}>
              {added ? `In basket${trail ? ` · ${trail}` : ''} ✓` : `Add · ${inr(price * qty)}`}
            </button>
          </div>

          {inCart > 0 && !added ? (
            <p className="el-dialog-hint">{inCart} already in the basket, this adds {qty} more.</p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
