'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { groups, isRecommended, products, type Product, type ProductGroup } from './data';
import { defaultChosen, inr, lineKey, unitPrice, type CartAction, type CartState } from './cart';
import { FlameMark } from './FlameMark';
import { Reveal } from './Reveal';

interface ProductsProps {
  cart: CartState;
  dispatch: (action: CartAction) => void;
  onOpen: (product: Product) => void;
  filter: ProductGroup | 'all';
  onFilter: (next: ProductGroup | 'all') => void;
}

/**
 * The shelf itself: everything the kitchen sells, plates and jars in one grid.
 * Cards tilt toward the pointer, the photograph pushes into it and a glare
 * follows — the depth lives in the tilt and the zoom rather than in a `translateZ`
 * lift, because a lifted layer paints where the button is drawn but not where
 * the browser thinks it is, and the add button stops taking clicks.
 */
export function Products({ cart, dispatch, onOpen, filter, onFilter }: ProductsProps) {
  const visible = filter === 'all' ? products : products.filter((p) => p.group === filter);
  const active = groups.find((g) => g.id === filter) ?? groups[0];

  return (
    <section id="products" className="el-band el-products" aria-label="What we sell">
      <div className="el-shell">
        <Reveal>
          <p className="el-kicker">The card, and the shelf by the door</p>
          <h2 className="el-display el-h2">
            <span className="el-serif el-h2-em">{products.length} lines</span>, and every one of them priced
          </h2>
        </Reveal>

        <div className="el-tabs" role="tablist" aria-label="What kind of thing">
          {groups.map((g) => {
            const on = g.id === filter;
            return (
              <button
                key={g.id}
                role="tab"
                type="button"
                aria-selected={on}
                className="el-tab"
                data-on={on ? 'true' : 'false'}
                onClick={() => onFilter(g.id)}
              >
                {g.label}
                <span className="el-tab-count">{countFor(g.id)}</span>
                {on ? <motion.span layoutId="el-tab-underline" className="el-tab-line" /> : null}
              </button>
            );
          })}
        </div>
        <p className="el-tab-blurb">{active.blurb}</p>

        <motion.div layout className="el-grid">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <TiltCard
                key={p.id}
                product={p}
                index={i}
                cart={cart}
                dispatch={dispatch}
                onOpen={onOpen}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

const countFor = (id: ProductGroup | 'all'): number =>
  id === 'all' ? products.length : products.filter((p) => p.group === id).length;

interface TiltCardProps {
  product: Product;
  index: number;
  cart: CartState;
  dispatch: (action: CartAction) => void;
  onOpen: (product: Product) => void;
}

function TiltCard({ product, index, cart, dispatch, onOpen }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawY, { stiffness: 180, damping: 18, mass: 0.5 });
  const rotateY = useSpring(rawX, { stiffness: 180, damping: 18, mass: 0.5 });
  const glareX = useSpring(rawX, { stiffness: 120, damping: 20 });
  const glareY = useSpring(rawY, { stiffness: 120, damping: 20 });

  const chosen = defaultChosen(product);
  const key = lineKey(product.id, chosen);
  const inCart = cart[key]?.qty ?? 0;

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(px * 9);
    rawY.set(-py * 9);
  };

  const reset = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const add = () => {
    if (product.choices?.length) {
      onOpen(product);
      return;
    }
    dispatch({ type: 'add', qty: 1, line: { key, id: product.id, chosen, qty: 1 } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14, scale: 0.97 }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="el-tilt-wrap"
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY }}
        className="el-card"
      >
        <div className="el-card-media">
          <Image
            src={product.image}
            alt={product.name}
            width={product.w}
            height={product.h}
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className="el-card-img"
          />
          <motion.span
            aria-hidden
            className="el-card-glare"
            style={{ x: glareX, y: glareY }}
          />
          {isRecommended(product) ? (
            <span className="el-card-award">
              <FlameMark className="el-card-award-mark" />
              Worth the early booking
            </span>
          ) : null}
          <button type="button" className="el-card-zoom" onClick={() => onOpen(product)}>
            Look closer
          </button>
        </div>

        <div className="el-card-body">
          <div className="el-card-row">
            <h3 className="el-card-name">{product.name}</h3>
            <span className="el-card-price">{inr(unitPrice(product, chosen))}</span>
          </div>
          <p className="el-card-note">{product.note}</p>
          <ul className="el-card-tags">
            {product.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="el-card-foot">
            {inCart > 0 ? (
              <div className="el-stepper" role="group" aria-label={`${product.name} in basket`}>
                <button
                  type="button"
                  aria-label={`One fewer ${product.name}`}
                  onClick={() => dispatch({ type: 'setQty', key, qty: inCart - 1 })}
                >
                  −
                </button>
                <span aria-live="polite">{inCart}</span>
                <button
                  type="button"
                  aria-label={`One more ${product.name}`}
                  onClick={() => dispatch({ type: 'add', qty: 1, line: { key, id: product.id, chosen, qty: inCart + 1 } })}
                >
                  +
                </button>
              </div>
            ) : (
              <button type="button" className="el-card-add" onClick={add}>
                {product.choices?.length ? 'Choose and add' : '+ Add'}
              </button>
            )}
            <span className="el-card-unit">{product.details.metric}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
