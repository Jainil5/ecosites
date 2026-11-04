'use client';

import Image from 'next/image';
import { brewery } from './brewery';
import { HopField } from './HopField';
import { PourScene } from './PourScene';
import { Reveal } from './Reveal';

const facts = [
  { value: '12', label: 'Taps on the wall' },
  { value: '4.2%', label: 'House pilsner, and the one we drink' },
  { value: '12:00', label: 'Kitchen opens, every single day' },
];

/** The landing read: the beer comes first, the room is what you drink it in. */
export function Hero() {
  return (
    <section id="top" aria-label="The brewery" className="br-hero relative overflow-hidden">
      <Image
        src={brewery.heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="br-hero-wash absolute inset-0" />
      <div aria-hidden className="br-hero-grain absolute inset-0" />
      <HopField />

      <PourScene className="br-pour-anchor" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-20 pt-32 sm:pb-24">
        <Reveal>
          <p className="br-display text-[11px] uppercase tracking-[0.26em] text-[var(--br-amber)]">
            {brewery.kicker}
          </p>
          <h1 className="br-display mt-4 max-w-3xl text-[2.6rem] leading-[0.95] text-white sm:text-6xl">
            <span className="br-serif font-normal italic text-[var(--br-amber)]">Brewed</span> in
            the back, poured in front of you
          </h1>
        </Reveal>

        <Reveal delay={80}>
          <p className="br-serif mt-7 max-w-xl text-xl leading-snug text-white sm:text-2xl">
            {brewery.intro}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#taps" className="focus-ring br-btn br-btn-solid br-hero-cta">
              See the wall
            </a>
            <a href="#menu" className="focus-ring br-btn br-btn-ghost">
              See the menu
            </a>
            <a href="#voices" className="focus-ring br-btn br-btn-ghost">
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
                  <span className="br-display block text-2xl text-[var(--br-amber)] sm:text-3xl">
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
