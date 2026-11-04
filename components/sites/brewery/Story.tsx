'use client';

import { brewery } from './brewery';
import { Reveal } from './Reveal';
import { BreweryMark } from './BreweryMark';

export function Story() {
  return (
    <section id="story" className="br-story relative scroll-mt-20 overflow-hidden py-20 sm:py-24">
      <div aria-hidden className="br-story-glow absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-5 text-center">
        <Reveal>
          <h2 className="sr-only">The story behind the bar</h2>
          <BreweryMark className="mx-auto h-9 w-9 text-[var(--br-amber)]" />
          <blockquote className="br-serif mt-8 text-2xl italic leading-snug text-[var(--br-cream)] sm:text-[2rem]">
            “A taproom lives or dies by the pint people come back for. Everything else on this
            counter is just waiting for the kettle to cool.”
          </blockquote>
          <p className="br-display mt-6 text-[11px] uppercase tracking-[0.26em] text-[var(--br-amber)]">
            Why we brew in the back room
          </p>
        </Reveal>

        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-2xl leading-relaxed text-[#fbf4e9]/75">
            {brewery.story}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
