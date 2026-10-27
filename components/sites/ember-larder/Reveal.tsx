'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds before the band lifts. */
  delay?: number;
  /** Travel distance in px; the axis is what reads as movement. */
  y?: number;
}

/**
 * One lift-and-set reveal for the bands down the page. `MotionConfig
 * reducedMotion="user"` on the root turns the transform off without touching
 * the fade, so the content still arrives for anyone who asked for less motion.
 */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
