'use client';

import { useRef, type ReactNode } from 'react';

/**
 * The hero's perspective stage. Pointer position is written to the stage as
 * two unitless custom properties, and each `.gs-plane` multiplies them by its
 * own --dx/--dy amplitude — so the layers separate instead of sliding as one.
 * Reduced motion leaves them seated at 0.
 */
export function HeroStage({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  const settle = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={settle}
      className={`gs-stage ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
