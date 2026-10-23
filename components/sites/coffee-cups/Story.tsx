'use client';

import { cafe } from './cafe';
import { Reveal } from './Reveal';
import { SunriseMark } from './SunriseMark';

export function Story() {
  return (
    <section className="cc-story relative overflow-hidden py-20 sm:py-24">
      <div aria-hidden className="cc-story-glow absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-5 text-center">
        <Reveal>
          <SunriseMark className="mx-auto h-9 w-9 text-[var(--cc-honey)]" />
          <blockquote className="cc-serif mt-8 text-2xl italic leading-snug text-[var(--cc-cream)] sm:text-[2rem]">
            “A bagel is finished at four in the morning. Everything else on this counter is just
            waiting for the light to come up.”
          </blockquote>
          <p className="cc-display mt-6 text-[11px] uppercase tracking-[0.26em] text-[var(--cc-honey)]">
            Why we open early
          </p>
        </Reveal>

        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-2xl leading-relaxed text-[var(--cc-cream)]/75">
            {cafe.story}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
