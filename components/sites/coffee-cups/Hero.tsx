'use client';

import Image from 'next/image';
import { cafe } from './cafe';
import { BeansField } from './BeansField';
import { PourScene } from './PourScene';
import { Reveal } from './Reveal';

const facts = [
  { value: '1', label: 'Espresso base, all day' },
  { value: '7:00', label: 'First shot, first tray' },
  { value: '16', label: 'Seats, one long bench' },
];

/** The landing read: the coffee comes first, the room is what you drink it in. */
export function Hero() {
  return (
    <section id="top" aria-label="The coffee" className="cc-hero relative overflow-hidden">
      <Image
        src={cafe.heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="cc-hero-wash absolute inset-0" />
      <div aria-hidden className="cc-hero-grain absolute inset-0" />
      <BeansField />

      <PourScene className="cc-pour-anchor" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-20 pt-32 sm:pb-24">
        <Reveal>
          <p className="cc-display text-[11px] uppercase tracking-[0.26em] text-[var(--cc-honey)]">
            {cafe.kicker}
          </p>
          <h1 className="cc-display mt-4 max-w-3xl text-[2.6rem] leading-[0.95] text-white sm:text-6xl">
            <span className="cc-serif font-normal italic text-[var(--cc-honey)]">Coffee</span>{' '}
            first, everything else after
          </h1>
        </Reveal>

        <Reveal delay={80}>
          <p className="cc-serif mt-7 max-w-xl text-xl leading-snug text-white sm:text-2xl">
            {cafe.intro}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#menu" className="focus-ring cc-btn cc-btn-solid cc-hero-cta">
              See the menu
            </a>
            <a href="#voices" className="focus-ring cc-btn cc-btn-ghost">
              What the regulars say
            </a>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/25 pt-7">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <span className="cc-display block text-2xl text-[var(--cc-honey)] sm:text-3xl">
                    {f.value}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-white/75">{f.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
