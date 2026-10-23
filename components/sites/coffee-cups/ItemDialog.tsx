'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { isRecommended, type MenuItem } from './menu';
import { MAX_QTY, inr, type CartAction } from './cart';

interface ItemDialogProps {
  item: MenuItem;
  /** Which category tile group this item belongs to, e.g. "Coffee". */
  groupTitle: string;
  qty: number;
  dispatch: (action: CartAction) => void;
  onClose: () => void;
}

export function ItemDialog({ item, groupTitle, qty, dispatch, onClose }: ItemDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="cc-dialog-scrim" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name}, ${groupTitle}`}
        className="cc-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="cc-dialog-close"
          onClick={onClose}
          aria-label={`Close ${item.name}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="cc-dialog-img">
          <Image src={item.src} alt={item.name} width={720} height={540} priority className="!h-full !w-full object-cover" />
        </div>

        <div className="cc-dialog-body">
          <p className="cc-dialog-cat">{groupTitle}</p>
          <div className="cc-dialog-row">
            <h3 className="cc-dialog-name">{item.name}</h3>
            <span className="cc-dialog-price">{item.price}</span>
          </div>
          {isRecommended(item) && item.badge ? <p className="cc-dialog-reason">★ {item.badge}</p> : null}
          <p className="cc-dialog-note">{item.note}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span key={tag} className="cc-pill">
                {tag}
              </span>
            ))}
          </div>

          <p className="cc-dialog-label">In it</p>
          <p className="cc-dialog-text">{item.details.ingredients.join(' · ')}</p>
          <p className="cc-dialog-label">Allergens</p>
          <p className="cc-dialog-text">
            {item.details.allergens.length ? item.details.allergens.join(', ') : 'None worth flagging'}
          </p>
          <p className="cc-dialog-kcal">{item.details.kcal} kcal</p>

          {qty > 0 ? (
            <div className="cc-dialog-actions">
              <div className="cc-tray-step" role="group" aria-label={`How many ${item.name}`}>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'setQty', id: item.id, qty: qty - 1 })}
                  aria-label={`One fewer ${item.name}`}
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  disabled={qty >= MAX_QTY}
                  onClick={() => dispatch({ type: 'setQty', id: item.id, qty: qty + 1 })}
                  aria-label={`One more ${item.name}`}
                >
                  +
                </button>
              </div>
              <span className="cc-dialog-line-total">{inr(item.amount * qty)}</span>
              <button type="button" className="cc-dialog-done" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="cc-dialog-add"
              onClick={() => dispatch({ type: 'add', id: item.id })}
            >
              + Add to order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
