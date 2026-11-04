'use client';

import { useCallback, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactElement } from 'react';

/** Pint silhouette, shared by every plate so the stack reads as one object. */
const OUTER = 'M56 98 L65 208 Q100 222 135 208 L144 98 Z';
const INNER = 'M61 103 L69.5 204 Q100 216.5 130.5 204 L139 103 Z';

/** Sequenced plates take their slot in the 9s loop from this index. */
const step = (k: number) => ({ '--k': k }) as CSSProperties;

interface Plate {
  key: string;
  /** Depth in the stack, in px of translateZ. */
  lz: string;
  /** Entrance delay, so the object assembles front-to-back. */
  d: string;
  body: ReactElement;
}

const PLATES: Plate[] = [
  {
    key: 'halo',
    lz: '-60px',
    d: '0ms',
    body: (
      <>
        <defs>
          <radialGradient id="brPourHalo" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#F2C274" stopOpacity="0.68" />
            <stop offset="46%" stopColor="#B8721D" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#B8721D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="br-pour-halo" cx="100" cy="134" r="86" fill="url(#brPourHalo)" />
      </>
    ),
  },
  {
    key: 'glass-back',
    lz: '0px',
    d: '90ms',
    body: (
      <>
        <defs>
          <linearGradient id="brPourBeer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0B45A" />
            <stop offset="42%" stopColor="#D08A28" />
            <stop offset="100%" stopColor="#8A4A10" />
          </linearGradient>
          {/* Cylinder shading: the beer darkens at both walls and catches light left of centre. */}
          <linearGradient id="brPourShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2A211B" stopOpacity="0.24" />
            <stop offset="16%" stopColor="#2A211B" stopOpacity="0" />
            <stop offset="34%" stopColor="#FFFDF8" stopOpacity="0.34" />
            <stop offset="62%" stopColor="#FFFDF8" stopOpacity="0" />
            <stop offset="100%" stopColor="#2A211B" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="brPourGlass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFDF8" stopOpacity="0.3" />
            <stop offset="46%" stopColor="#FFFDF8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFDF8" stopOpacity="0.26" />
          </linearGradient>
          <clipPath id="brPourInnerBack">
            <path d={INNER} />
          </clipPath>
        </defs>
        <path d={OUTER} fill="url(#brPourGlass)" />
        <g clipPath="url(#brPourInnerBack)">
          <g className="br-pour-level">
            <rect x="50" y="130" width="100" height="92" fill="url(#brPourBeer)" />
            <rect x="50" y="130" width="100" height="92" fill="url(#brPourShade)" />
            <ellipse cx="100" cy="130" rx="36" ry="7.6" fill="#F7E3BC" opacity="0.92" />
          </g>
        </g>
        <ellipse cx="100" cy="210" rx="33" ry="6.6" fill="#2A211B" opacity="0.14" />
      </>
    ),
  },
  {
    key: 'stream',
    lz: '14px',
    d: '190ms',
    body: (
      <>
        <defs>
          {/* Fades out at the top so the pour enters the frame instead of a drawn tap spout. */}
          <linearGradient id="brPourShot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8A343" stopOpacity="0" />
            <stop offset="22%" stopColor="#E8A343" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#A4601A" />
          </linearGradient>
        </defs>
        <g stroke="url(#brPourShot)" strokeWidth={2.9} strokeLinecap="round" fill="none">
          <path className="br-pour-stream" style={step(0)} pathLength={100} d="M94 12c3 32-3 66 5 112" />
          <path className="br-pour-stream" style={step(1)} pathLength={100} d="M106 12c-3 32 3 66-5 112" />
        </g>
        <path
          className="br-pour-stream"
          style={step(2)}
          pathLength={100}
          d="M95 18c3 28-3 58 4 94"
          stroke="#F7E3BC"
          strokeWidth={1.1}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
      </>
    ),
  },
  {
    key: 'foam',
    lz: '26px',
    d: '280ms',
    body: (
      <>
        <defs>
          <radialGradient id="brPourCrema" cx="48%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#FBF3E2" />
            <stop offset="52%" stopColor="#EBD3A5" />
            <stop offset="100%" stopColor="#C99A4E" stopOpacity="0.6" />
          </radialGradient>
          <clipPath id="brPourInnerCrema">
            <path d={INNER} />
          </clipPath>
        </defs>
        <g clipPath="url(#brPourInnerCrema)">
          <g className="br-pour-level">
            <ellipse
              className="br-pour-plume"
              style={step(0)}
              cx="85"
              cy="139"
              rx="18"
              ry="5"
              fill="#F6E7C6"
            />
            <ellipse
              className="br-pour-plume"
              style={step(1)}
              cx="116"
              cy="146"
              rx="15"
              ry="4.5"
              fill="#E9D2A0"
            />
            <ellipse
              className="br-pour-plume"
              style={step(2)}
              cx="100"
              cy="155"
              rx="21"
              ry="5.5"
              fill="#EFDCB4"
            />
            <ellipse
              className="br-pour-crema"
              cx="100"
              cy="130"
              rx="30"
              ry="8"
              fill="url(#brPourCrema)"
            />
            <ellipse
              className="br-pour-ripple"
              style={step(0)}
              cx="99"
              cy="130"
              rx="14"
              ry="4"
              fill="none"
              stroke="#FBF3E2"
              strokeWidth={1.6}
            />
            <ellipse
              className="br-pour-ripple"
              style={step(1)}
              cx="101"
              cy="131"
              rx="14"
              ry="4"
              fill="none"
              stroke="#FFFDF8"
              strokeWidth={1.2}
            />
            <ellipse
              className="br-pour-ripple"
              style={step(2)}
              cx="100"
              cy="130"
              rx="13"
              ry="3.6"
              fill="none"
              stroke="#E2BE7C"
              strokeWidth={1.2}
            />
          </g>
        </g>
      </>
    ),
  },
  {
    key: 'glass-front',
    lz: '52px',
    d: '380ms',
    body: (
      <>
        <path d={OUTER} fill="none" stroke="rgba(255,253,248,0.55)" strokeWidth={1.8} />
        <ellipse
          cx="100"
          cy="98"
          rx="44"
          ry="10.5"
          fill="none"
          stroke="rgba(255,253,248,0.7)"
          strokeWidth={1.8}
        />
        <path d={OUTER} fill="none" stroke="rgba(42,33,27,0.14)" strokeWidth={1} />
        <path
          className="br-pour-shine"
          style={step(0)}
          d="M70 114 L77 196"
          stroke="#FFFDF8"
          strokeWidth={3.4}
          strokeLinecap="round"
        />
        <path
          className="br-pour-shine"
          style={step(1)}
          d="M132 118 L127 190"
          stroke="#FFFDF8"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    key: 'bubbles',
    lz: '70px',
    d: '470ms',
    body: (
      <g fill="none" stroke="#F7E3BC" strokeWidth={1.6} strokeLinecap="round">
        <circle className="br-pour-steam" style={step(0)} cx="82" cy="120" r="4" opacity={0} />
        <circle className="br-pour-steam" style={step(1)} cx="118" cy="112" r="3" opacity={0} />
        <circle className="br-pour-steam" style={step(2)} cx="100" cy="124" r="5" opacity={0} />
      </g>
    ),
  },
];

interface PourSceneProps {
  /** Positions and sizes the scene, e.g. 'br-pour-anchor'. */
  className?: string;
}

/**
 * A pint filling from the tap, built as six SVG plates seated at real depths
 * and sharing one 9s timeline so the pour, the foam spreading, the bubbles
 * drifting and the head settling stay in step. CSS owns every loop, so a
 * reduced-motion browser gets the finished pint with the pour still in it.
 */
export function PourScene({ className = '' }: PourSceneProps) {
  const stage = useRef<HTMLDivElement>(null);

  const lean = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const el = stage.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--gy', `${(dx * 26).toFixed(1)}`);
    el.style.setProperty('--gx', `${(dy * -13).toFixed(1)}`);
  }, []);

  const settle = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    el.style.removeProperty('--gy');
    el.style.removeProperty('--gx');
  }, []);

  return (
    <div
      aria-label="Beer pouring from a tap into a pint glass"
      role="img"
      onPointerMove={lean}
      onPointerLeave={settle}
      className={`br-pour-scene ${className}`}
    >
      <div ref={stage} className="br-pour-stage">
        <div className="br-pour-idle">
          {PLATES.map((plate) => (
            <div key={plate.key} className="br-pour-plate" style={{ '--lz': plate.lz, '--d': plate.d } as CSSProperties}>
              <svg viewBox="0 0 200 260" fill="none" aria-hidden="true">
                {plate.body}
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
