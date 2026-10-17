'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { SPRINGS } from './motion/tokens';
import { inr } from './format';

export function RangeBar({ label, low, high, current }: { label: string; low?: number; high?: number; current?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();

  if (low == null || high == null || current == null || high <= low) {
    return (
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">{label}</p>
        <p className="mt-1 font-mono text-xs text-[#8A98B0]">—</p>
      </div>
    );
  }
  const pos = Math.min(Math.max(((current - low) / (high - low)) * 100, 0), 100);
  return (
    <div ref={ref}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">{label}</p>
      <div className="relative mt-2 h-1.5 rounded-full bg-[#1C2740]">
        <motion.div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#0A0F1A] bg-[#4DA3FF]"
          initial={{ left: '0%' }}
          animate={inView || reduced ? { left: `calc(${pos}% - 6px)` } : { left: '0%' }}
          transition={reduced ? { duration: 0 } : SPRINGS.number}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-[#5B6B85]">
        <span>{inr(low)}</span>
        <span>{inr(high)}</span>
      </div>
    </div>
  );
}
