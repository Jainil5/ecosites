'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { isRecommended, type MenuItem } from './menu';
import { MAX_QTY, inr, variantKey, type CartAction } from './cart';

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
  const [sizeId, setSizeId] = useState<string | undefined>(item.sizes?.[0]?.id);
  const [addonIds, setAddonIds] = useState<string[]>([]);

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

  const key = variantKey(item.id, sizeId, addonIds.length ? addonIds : undefined);
  const unitPrice = item.amount
    + (item.sizes?.find((s) => s.id === sizeId)?.extra ?? 0)
    + addonIds.reduce((sum, id) => sum + (item.addons?.find((a) => a.id === id)?.price ?? 0), 0);

  const toggleAddon = (id: string) => {
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

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
            <span className="cc-dialog-price">{inr(unitPrice)}</span>
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

          {item.sizes && (
            <fieldset className="cc-dialog-variants">
              <legend className="cc-dialog-label">Size</legend>
              <div className="cc-variant-group">
                {item.sizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="cc-variant-btn"
                    data-active={sizeId === s.id ? 'true' : 'false'}
                    onClick={() => setSizeId(s.id)}
                  >
                    {s.label}
                    {s.extra > 0 && <span className="cc-variant-extra">+{inr(s.extra)}</span>}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {item.addons && (
            <fieldset className="cc-dialog-variants">
              <legend className="cc-dialog-label">Add-ons</legend>
              <div className="cc-variant-group">
                {item.addons.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="cc-variant-btn"
                    data-active={addonIds.includes(a.id) ? 'true' : 'false'}
                    onClick={() => toggleAddon(a.id)}
                    aria-pressed={addonIds.includes(a.id)}
                  >
                    {a.label}
                    <span className="cc-variant-extra">+{inr(a.price)}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

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
                  onClick={() => dispatch({ type: 'setQty', id: key, qty: qty - 1 })}
                  aria-label={`One fewer ${item.name}`}
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  disabled={qty >= MAX_QTY}
                  onClick={() => dispatch({ type: 'setQty', id: key, qty: qty + 1 })}
                  aria-label={`One more ${item.name}`}
                >
                  +
                </button>
              </div>
              <span className="cc-dialog-line-total">{inr(unitPrice * qty)}</span>
              <button type="button" className="cc-dialog-done" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="cc-dialog-add"
              onClick={() => dispatch({ type: 'add', id: key })}
            >
              + Add to order — {inr(unitPrice)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
