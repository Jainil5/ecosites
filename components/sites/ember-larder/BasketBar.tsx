'use client';

import { motion } from 'framer-motion';
import { cartCount, inr, totals, type CartState } from './cart';

interface BasketBarProps {
  cart: CartState;
  onOpen: () => void;
}

/**
 * The bar that rides under the thumb on a phone: what is on the ticket, what it
 * costs, and one tap to the pass. It only exists while there is something to do.
 */
export function BasketBar({ cart, onOpen }: BasketBarProps) {
  const count = cartCount(cart);
  const { total } = totals(cart);

  return (
    <motion.div
      className="el-bar-wrap"
      initial={{ y: 96, opacity: 0 }}
      animate={{ y: count > 0 ? 0 : 96, opacity: count > 0 ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      aria-hidden={count === 0}
    >
      <button type="button" className="el-bar" onClick={onOpen} aria-label={`Open basket, ${count} items`}>
        <span className="el-bar-count">{count}</span>
        <span className="el-bar-copy">
          <strong>{count === 1 ? 'One thing on the ticket' : `${count} things on the ticket`}</strong>
          <span>Plates and jars, one bill</span>
        </span>
        <span className="el-bar-total">{inr(total)}</span>
        <span className="el-bar-go">Basket →</span>
      </button>
    </motion.div>
  );
}
