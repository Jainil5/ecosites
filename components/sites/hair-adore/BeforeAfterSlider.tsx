'use client';

import { useCallback, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import type { Transformation } from './data';

// Pointer/keyboard-draggable before→after reveal using clip-path.
export function BeforeAfterSlider({ item }: { item: Transformation }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = Math.min(0.98, Math.max(0.02, (clientX - rect.left) / rect.width));
    setPct(next * 100);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') setPct((p) => Math.max(2, p - 4));
    if (e.key === 'ArrowRight') setPct((p) => Math.min(98, p + 4));
  }

  return (
    <div
      ref={containerRef}
      className="ha-shadow group relative h-64 cursor-ew-resize select-none overflow-hidden rounded-2xl border border-white/60"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && update(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      {/* After (base) */}
      <img src={item.after} alt={`${item.title} after`} className="absolute inset-0 h-full w-full object-cover" />

      {/* Before (clipped to the left of the divider) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <img src={item.before} alt={`${item.title} before`} className="h-full w-full object-cover" />
      </div>

      {/* Divider + handle */}
      <div className="absolute inset-y-0 z-10 w-0.5 bg-white/90 shadow" style={{ left: `${pct}%` }}>
        <button
          type="button"
          role="slider"
          aria-label={`Reveal ${item.title} before and after`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-valuetext={`${Math.round(pct)}% after`}
          onKeyDown={onKeyDown}
          className="focus-ring absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-[#C1613C] text-white shadow-md"
        >
          <MoveHorizontal aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-0.5 text-[11px] uppercase tracking-widest text-white">
        Before
      </span>
      <span className="absolute bottom-3 right-3 rounded bg-black/50 px-2 py-0.5 text-[11px] uppercase tracking-widest text-white">
        After
      </span>
    </div>
  );
}
