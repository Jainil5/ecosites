'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { SiteFrame } from '@/components/brand/SiteFrame';
import { websites } from '@/content/websites/sites';

/**
 * Where each plate rests in the stack, in the 3D space of `.hero-stage`,
 * and how far it travels when the stack explodes. Separation is along Z
 * rather than on the page, so perspective shrinks the back plates the way
 * a real stack shrinks them.
 */
const PLATES = [
  {
    x: '0rem',
    y: '0rem',
    z: '0rem',
    opacity: 1,
    out: { x: '2.2rem', y: '-2.6rem', z: '5rem', r: '2deg' },
  },
  {
    x: '1.1rem',
    y: '-1.9rem',
    z: '-15rem',
    opacity: 0.85,
    out: { x: '3.4rem', y: '-1.1rem', z: '-3rem', r: '1deg' },
  },
  {
    x: '2.2rem',
    y: '-3.8rem',
    z: '-30rem',
    opacity: 0.68,
    out: { x: '4.6rem', y: '0.3rem', z: '-11rem', r: '0deg' },
  },
];

/** Rake at rest, and how far the cursor can pull it from there. */
const BASE = { rx: 8, ry: -18 };
const SWING = { rx: 6, ry: 11 };

interface StageStyle extends CSSProperties {
  '--rx'?: string;
  '--ry'?: string;
  '--px'?: string;
  '--py'?: string;
  '--pz'?: string;
  '--delay'?: string;
  '--dur'?: string;
  '--ex'?: string;
  '--ey'?: string;
  '--ez'?: string;
  '--er'?: string;
}

/**
 * The hero visual: the delivered sites as plates of one object. They drift
 * apart along the Z axis and slide back into assembly, and the whole stack
 * leans toward the cursor. CSS does the looping; the pointer only writes two
 * custom properties.
 */
export function HeroPanel() {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return () => cancelAnimationFrame(frame.current);
  }, []);

  const steer = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const el = stage.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--ry', `${(BASE.ry + dx * SWING.ry * 2).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(BASE.rx - dy * SWING.rx * 2).toFixed(2)}deg`);
    });
  }, []);

  const settle = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.removeProperty('--ry');
    el.style.removeProperty('--rx');
  }, []);

  return (
    <div
      aria-hidden
      onPointerMove={steer}
      onPointerLeave={settle}
      className="scene-wide hidden shrink-0 lg:block"
    >
      <div ref={stage} className="hero-stage relative h-[21rem] w-[27rem]">
        <div className="hero-float">
          {/* the cast shadow the stack drops on the floor plane */}
          <span
            className="hero-shadow absolute bottom-[-1.6rem] left-1/2 h-6 w-[19rem] rounded-[50%] bg-black/70 blur-2xl"
            style={{ '--delay': '0s', '--dur': '12s' } as StageStyle}
          />
          {websites.slice(0, PLATES.length).map((site, index) => {
            const plate = PLATES[index];
            return (
              <div
                key={site.slug}
                className="plate"
                style={
                  {
                    '--px': plate.x,
                    '--py': plate.y,
                    '--pz': plate.z,
                    zIndex: PLATES.length - index,
                  } as StageStyle
                }
              >
                <div
                  className="plate-motion"
                  style={
                    {
                      '--delay': `${index * 0.55}s`,
                      '--dur': '12s',
                      '--ex': plate.out.x,
                      '--ey': plate.out.y,
                      '--ez': plate.out.z,
                      '--er': plate.out.r,
                    } as StageStyle
                  }
                >
                  <div
                    className="plate-face relative rounded-xl"
                    style={{ opacity: plate.opacity }}
                  >
                    {index === 0 ? (
                      <span
                        className="absolute -inset-6 -z-10 rounded-[2rem] blur-3xl"
                        style={{ background: `${site.accent}2e` }}
                      />
                    ) : null}
                    <SiteFrame site={site} decorative priority={index === 0} sizes="22rem" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
