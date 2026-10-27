'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { BasketBar } from './BasketBar';
import { CartDrawer } from './CartDrawer';
import { EmberField } from './EmberField';
import { Hero } from './Hero';
import { Nav } from './Nav';
import { ProductDialog } from './ProductDialog';
import { Products } from './Products';
import { Reserve } from './Reserve';
import { Reviews } from './Reviews';
import { SetMenu } from './SetMenu';
import { SiteFooter } from './SiteFooter';
import { Story } from './Story';
import { Visit } from './Visit';
import { cartCount, cartReducer, loadCart, saveCart, type CartState } from './cart';
import type { Product, ProductGroup } from './data';

/**
 * One page, two businesses: the kitchen sells plates and the shelf next to the
 * door sells jars, and they share a single ticket. The basket lives in session
 * storage, so a reload mid-order keeps the table's ticket but a fresh visit
 * starts cold — which is what a walk-in counter would do anyway.
 *
 * The coals are the page's light source, so they run once, fixed behind the
 * whole document, and every panel is translucent enough to let them through.
 */
export function EmberLarder() {
  const [cart, dispatch] = useReducer(cartReducer, {} as CartState);
  const [ready, setReady] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const [dialog, setDialog] = useState<Product | null>(null);
  const [filter, setFilter] = useState<ProductGroup | 'all'>('all');

  useEffect(() => {
    dispatch({ type: 'replace', state: loadCart(window.sessionStorage) });
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveCart(window.sessionStorage, cart);
  }, [cart, ready]);

  // The sheet and the dialog each lock body scroll and take Escape themselves,
  // so nothing here has to know which one is open.

  const dialogCount = useMemo(() => {
    if (!dialog) return 0;
    return Object.values(cart)
      .filter((l) => l.id === dialog.id)
      .reduce((sum, l) => sum + l.qty, 0);
  }, [cart, dialog]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="ember-larder min-h-screen" data-bar-up={cartCount(cart) > 0 ? 'true' : 'false'}>
        <EmberField className="el-ember" count={64} />

        <Nav cart={cart} onOpenBasket={() => setBasketOpen(true)} />

        <main>
          <Hero />
          <Products
            cart={cart}
            dispatch={dispatch}
            onOpen={setDialog}
            filter={filter}
            onFilter={setFilter}
          />
          <Story />
          <SetMenu />
          <Reviews />
          <Reserve />
          <Visit />
        </main>

        <SiteFooter />

        <BasketBar cart={cart} onOpen={() => setBasketOpen(true)} />

        <AnimatePresence>
          {dialog ? (
            <ProductDialog
              key={dialog.id}
              product={dialog}
              inCart={dialogCount}
              dispatch={dispatch}
              onClose={() => setDialog(null)}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {basketOpen ? (
            <CartDrawer key="drawer" cart={cart} dispatch={dispatch} onClose={() => setBasketOpen(false)} />
          ) : null}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
