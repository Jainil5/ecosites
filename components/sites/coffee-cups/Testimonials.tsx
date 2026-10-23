'use client';

import { useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import Image from 'next/image';
import { menuGroups } from './menu';
import { testimonials } from './testimonialsData';
import { BeansField } from './BeansField';
import { Nav } from './Nav';
import { Reveal } from './Reveal';
import { SiteFooter } from './SiteFooter';

const itemsById = new Map(
  menuGroups.flatMap((g) => g.items).map((item) => [item.id, item] as const),
);

/** Depth seats, in px of translateZ — cards sit at different distances. */
const DEPTHS = [-40, 20, -15, 45, -30, 10, -45, 30];
const TILT_DEG = 9;

export function Testimonials() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const tiltTo = (e: PointerEvent<HTMLElement>) => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = e.currentTarget;
    const r = t.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    t.style.setProperty('--ry', `${(x * 2 * TILT_DEG).toFixed(2)}deg`);
    t.style.setProperty('--rx', `${(-y * 2 * TILT_DEG).toFixed(2)}deg`);
  };

  const untilt = (e: PointerEvent<HTMLElement>) => {
    const style = e.currentTarget.style;
    style.removeProperty('--rx');
    style.removeProperty('--ry');
  };

  return (
    <div className="coffee-cups min-h-screen">
      <Nav />
      <main>
        <section id="voices" className="cc-voices-section relative overflow-hidden py-20 sm:py-24">
          <BeansField />
          <div className="relative mx-auto max-w-6xl px-5">
            <Reveal className="text-center">
              <p className="cc-display text-[11px] uppercase tracking-[0.26em] text-[var(--cc-honey)]">
                Word of mouth
              </p>
              <h1 className="cc-display mt-3 text-4xl text-[var(--cc-paper)] sm:text-5xl">
                What the regulars say
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[rgba(251,244,233,0.72)]">
                Demo voices from the room — tap a card to pull it forward, move away and it drifts
                back into the stack.
              </p>
            </Reveal>

            <div
              className="cc-voices mt-14"
              data-has-active={activeId ? 'true' : 'false'}
            >
              {testimonials.map((t, i) => {
                const item = itemsById.get(t.itemId);
                const active = activeId === t.itemId + t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    className="cc-voice"
                    data-active={active ? 'true' : 'false'}
                    aria-pressed={active}
                    style={
                      {
                        '--z': `${DEPTHS[i % DEPTHS.length]}px`,
                        '--d': `${(i % 4) * -2.2}s`,
                      } as CSSProperties
                    }
                    onPointerMove={tiltTo}
                    onPointerLeave={untilt}
                    onClick={() => setActiveId(active ? null : t.itemId + t.name)}
                  >
                    <span className="cc-voice-top">
                      <span aria-hidden className="cc-voice-avatar">
                        {t.name.charAt(0)}
                      </span>
                      <span>
                        <span className="cc-voice-name">{t.name}</span>
                        <span className="cc-voice-when">{t.when}</span>
                      </span>
                    </span>
                    <span className="cc-voice-quote cc-serif">“{t.quote}”</span>
                    {item && (
                      <span className="cc-voice-tag">
                        <Image
                          src={item.src}
                          alt=""
                          width={64}
                          height={64}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        {item.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <Reveal className="mt-16 text-center">
              <a href="/coffee-cups/menu" className="focus-ring cc-btn cc-btn-solid">
                Order what they are talking about
              </a>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
