'use client';

import { useRef } from 'react';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from 'framer-motion';
import { SPRINGS } from './tokens';

export interface Tilt3DProps {
  children: React.ReactNode;
  /** Max rotation in degrees. Keep ≤ 8 — data panels must not feel like toys. */
  intensity?: number;
  glow?: boolean;
  className?: string;
}

export function Tilt3D({ children, intensity = 7, glow = true, className }: Tilt3DProps) {
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, SPRINGS.tiltFollow);
  const sry = useSpring(ry, SPRINGS.tiltFollow);
  const glowBg = useMotionTemplate`radial-gradient(240px circle at ${gx}% ${gy}%, rgba(77,163,255,0.10), transparent 65%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * intensity * 2);
    rx.set((0.5 - py) * intensity * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const settle = (mv: MotionValue<number>) => animate(mv, 0, SPRINGS.tiltReturn);
  const onLeave = () => {
    settle(rx);
    settle(ry);
  };

  return (
    <div ref={boxRef} onPointerMove={onMove} onPointerLeave={onLeave} className={`relative [perspective:900px] ${className ?? ''}`}>
      <motion.div
        style={reduced ? undefined : { rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        className="relative h-full"
      >
        {children}
        {glow && !reduced && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ backgroundImage: glowBg }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </div>
  );
}
