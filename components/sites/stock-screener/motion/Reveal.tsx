'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE } from './tokens';

export interface RevealProps {
  children: React.ReactNode;
  /** Seconds. Use i * DUR.stagger for sibling rhythm — nothing larger. */
  delay?: number;
  className?: string;
  y?: number;
}

export function Reveal({ children, delay = 0, className, y = 16 }: RevealProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <motion.div className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: DUR.enter,
        ease: EASE.enter,
        delay,
        opacity: { duration: DUR.fadeLead, ease: 'linear' },
      }}
    >
      {children}
    </motion.div>
  );
}
