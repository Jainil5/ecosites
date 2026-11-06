'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Piece } from './Piece';
import { categories, metals, pieces, type Category, type Metal, type Piece as PieceType } from './data';
import { defaultChosen, inr, leadRange, lineKey, type CartAction, type CartState } from './cart';

type Sort = 'curated' | 'price-asc' | 'price-desc' | 'fastest';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'curated', label: 'The bench order' },
  { id: 'price-asc', label: 'Price, low first' },
  { id: 'price-desc', label: 'Price, high first' },
  { id: 'fastest', label: 'Ready soonest' },
];

interface CollectionProps {
  cart: CartState;
  dispatch: (action: CartAction) => void;
  onOpen: (piece: PieceType) => void;
}

/**
 * The whole bench on one shelf.
 *
 * Glossier's wear collection reads as a rack, not a catalogue: one filter row,
 * a sort, and a grid wide enough to see the shapes before the words. The count
 * above the grid is the honest one — it changes with the filters, so a reader
 * always knows how much of the work is on view.
 */
export function Collection({ cart, dispatch, onOpen }: CollectionProps) {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [metal, setMetal] = useState<Metal | 'all'>('all');
  const [sort, setSort] = useState<Sort>('curated');

  const visible = useMemo(() => {
    const rows = pieces.filter(
      (p) => (category === 'all' || p.category === category) && (metal === 'all' || p.metal === metal),
    );
    if (sort === 'price-asc') return [...rows].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...rows].sort((a, b) => b.price - a.price);
    if (sort === 'fastest') return [...rows].sort((a, b) => a.lead[0] - b.lead[0]);
    return rows;
  }, [category, metal, sort]);

  return (
    <section id="shop" className="rj-band rj-collection" aria-label="The pieces">
      <div className="rj-shell">
        <div className="rj-head">
          <p className="rj-eyebrow">This season at the bench</p>
          <h2 className="rj-display rj-h2">
            {pieces.length} pieces, each one made after you ask.
          </h2>
          <p className="rj-lede">
            Nothing here is sitting in a box waiting. The silver is bought, the stones are in the
            drawer, and the piece is finished once you choose the size — which is why the grid below
            is a shelf of shapes rather than a stock list.
          </p>
        </div>

        <div className="rj-filters">
          <div className="rj-filter-group" role="group" aria-label="Filter by what you are wearing it for">
            <span className="rj-filter-label">Wear</span>
            <Chip on={category === 'all'} onClick={() => setCategory('all')} count={pieces.length}>
              Everything
            </Chip>
            {categories.map((c) => (
              <Chip
                key={c.id}
                on={category === c.id}
                onClick={() => setCategory(c.id)}
                count={pieces.filter((p) => p.category === c.id).length}
              >
                {c.label}
              </Chip>
            ))}
          </div>

          <div className="rj-filter-group" role="group" aria-label="Filter by metal">
            <span className="rj-filter-label">Metal</span>
            <Chip on={metal === 'all'} onClick={() => setMetal('all')} count={pieces.length}>
              Any
            </Chip>
            {metals.map((m) => (
              <Chip
                key={m.id}
                on={metal === m.id}
                onClick={() => setMetal(m.id)}
                count={pieces.filter((p) => p.metal === m.id).length}
              >
                {m.label}
              </Chip>
            ))}
          </div>

          <label className="rj-sort">
            <span className="rj-filter-label">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort the pieces"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="rj-count" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'piece' : 'pieces'} on view
          {category === 'all' && metal === 'all' ? '' : ' — filtered'}
        </p>

        <motion.div layout className="rj-grid">
          <AnimatePresence mode="popLayout">
            {visible.map((piece, i) => (
              <Card
                key={piece.slug}
                piece={piece}
                index={i}
                cart={cart}
                dispatch={dispatch}
                onOpen={onOpen}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 ? (
          <p className="rj-empty">
            Nothing on the bench fits that pair of filters. Widen one of them, or write to her and
            ask for the piece you have in mind — most of what she makes starts as a sentence like that.
          </p>
        ) : null}
      </div>
    </section>
  );
}

interface ChipProps {
  on: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}

function Chip({ on, count, onClick, children }: ChipProps) {
  return (
    <button type="button" className="rj-chip" aria-pressed={on} onClick={onClick}>
      {children}
      <span className="rj-chip-count">{count}</span>
    </button>
  );
}

interface CardProps {
  piece: PieceType;
  index: number;
  cart: CartState;
  dispatch: (action: CartAction) => void;
  onOpen: (piece: PieceType) => void;
}

function Card({ piece, index, cart, dispatch, onOpen }: CardProps) {
  const chosen = defaultChosen(piece);
  const key = lineKey(piece.slug, chosen);
  const inCart = cart[key]?.qty ?? 0;

  const add = () => dispatch({ type: 'add', line: { key, slug: piece.slug, chosen, qty: 1 } });

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.035, ease: [0.22, 1, 0.36, 1] }}
      className="rj-card"
    >
      <button type="button" className="rj-card-figure" onClick={() => onOpen(piece)} aria-label={`See the ${piece.name}`}>
        <span className="rj-card-badges">
          <span className="rj-badge">{piece.stamp}</span>
          {piece.stone ? <span className="rj-badge rj-badge-stone">{piece.stone.split(',')[0]}</span> : null}
        </span>
        {/* Two drawings in one frame: the paper view, and the loupe over the setting. */}
        <span className="rj-drawing">
          <Piece form={piece.form} className="rj-piece" tone={piece.metal === 'gold' ? 'var(--rj-gold)' : undefined} />
          <Piece
            form={piece.form}
            detail
            className="rj-piece rj-piece-detail"
            tone={piece.metal === 'gold' ? 'var(--rj-gold)' : undefined}
          />
        </span>
        <span className="rj-card-zoom">Loupe</span>
      </button>

      <div className="rj-card-body">
        <h3 className="rj-card-name">{piece.name}</h3>
        <p className="rj-card-type">{piece.type}</p>
        <p className="rj-card-size">
          {piece.measure.label}: {chosen}
        </p>
        <p className="rj-card-price">
          {inr(piece.price)}
          <span className="rj-card-tax"> incl. GST</span>
        </p>
        <p className="rj-card-lead">{leadRange(piece)}</p>

        <div className="rj-card-actions">
          {inCart > 0 ? (
            <span className="rj-in-cart" aria-live="polite">
              {inCart} in the box
            </span>
          ) : (
            <button type="button" className="rj-add" onClick={add}>
              Add to box
            </button>
          )}
          <button type="button" className="rj-details" onClick={() => onOpen(piece)}>
            Choose a size
          </button>
        </div>
      </div>
    </motion.article>
  );
}
