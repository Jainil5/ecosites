'use client';

import { useRef, type ReactNode } from 'react';

/**
 * Pointer lighting for a grid of `.gs-lit` panels. The listener sits on the
 * container instead of on every card: one handler per grid, and only the card
 * under the cursor is written to. Coarse pointers and reduced motion leave the
 * surfaces flat — a touch screen would otherwise strand a light where the
 * finger last fell.
 */
export function CursorLit({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const lit = useRef<HTMLElement | null>(null);

  const clear = () => {
    const card = lit.current;
    if (!card) return;
    for (const prop of ['--gx', '--gy', '--lx', '--ly']) card.style.removeProperty(prop);
    lit.current = null;
  };

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = (event.target as Element).closest<HTMLElement>('.gs-lit');
    if (!card) {
      clear();
      return;
    }
    if (card !== lit.current) {
      clear();
      lit.current = card;
    }
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
    card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    card.style.setProperty('--lx', (px * 2 - 1).toFixed(3));
    card.style.setProperty('--ly', (py * 2 - 1).toFixed(3));
  };

  return (
    <div onPointerMove={onMove} onPointerLeave={clear} className={className}>
      {children}
    </div>
  );
}
