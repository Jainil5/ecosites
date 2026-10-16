'use client';

import { useCallback, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

/** The tree-circuit split into plates: crown behind, trunk seated, pads floating in front. */
const PLATES = [
  {
    key: 'crown',
    lz: '-16px',
    delay: '0ms',
    body: (
      <g stroke="#16A34A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M10 6.4 12 4.2l2 2.2" />
        <path d="M8 10.6 12 6.2l4 4.4" />
        <path d="M6 14.8 12 8.4l6 6.4" />
      </g>
    ),
  },
  {
    key: 'trunk',
    lz: '0px',
    delay: '140ms',
    body: (
      <g stroke="#22C55E" strokeWidth={1.8} strokeLinecap="round" fill="none">
        <path d="M12 20.6v-5.8" />
        <path d="M9.6 20.6h4.8" opacity={0.55} />
      </g>
    ),
  },
  {
    key: 'pads',
    lz: '18px',
    delay: '280ms',
    body: (
      <g fill="#4ADE80">
        <circle cx="6" cy="14.8" r="1.2" />
        <circle cx="18" cy="14.8" r="1.2" />
        <circle cx="8" cy="10.6" r="1.1" />
        <circle cx="16" cy="10.6" r="1.1" />
      </g>
    ),
  },
];

interface PlateStyle extends CSSProperties {
  '--lz'?: string;
  '--d'?: string;
}

interface Logo3DProps {
  /** Sizes the square stage, e.g. 'h-40 w-40'. */
  className?: string;
}

/**
 * The brand mark as a real object: three SVG plates fly in along the Z
 * axis and seat at different depths, then breathe a slow yaw. The cursor
 * leans the whole stack; CSS owns every loop, so a reduced-motion browser
 * just gets the assembled flat mark.
 */
export function Logo3D({ className }: Logo3DProps) {
  const stage = useRef<HTMLDivElement>(null);

  const lean = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const el = stage.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--gy', `${(dx * 30).toFixed(1)}`);
    el.style.setProperty('--gx', `${(dy * -16).toFixed(1)}`);
  }, []);

  const settle = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    el.style.removeProperty('--gy');
    el.style.removeProperty('--gx');
  }, []);

  return (
    <div
      aria-label="Website IN 3D logo"
      role="img"
      onPointerMove={lean}
      onPointerLeave={settle}
      className={`go-logo-scene relative ${className ?? 'h-36 w-36'}`}
    >
      <span
        aria-hidden
        className="absolute inset-[-18%] rounded-full bg-accent/15 blur-3xl"
      />
      <div ref={stage} className="go-logo h-full w-full">
        <div className="go-logo-idle preserve-3d relative h-full w-full">
          {PLATES.map((plate) => (
            <div
              key={plate.key}
              className="go-logo-plate"
              style={{ '--lz': plate.lz, '--d': plate.delay } as PlateStyle}
            >
              <svg viewBox="0 0 24 24" fill="none">
                {plate.body}
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
