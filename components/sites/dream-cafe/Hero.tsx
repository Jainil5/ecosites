'use client';

import Image from 'next/image';
import { cafe } from './cafe';
import { PourScene } from './PourScene';
import { Reveal } from './Reveal';

const facts = [
  { value: '7:00', label: 'First tray lands' },
  { value: '16', label: 'Seats, one long bench' },
  { value: '3', label: 'Bakes through the day' },
];

export function Hero() {
  return (
    <section id="top" aria-label="Introduction" className="dc-hero relative overflow-hidden">
      <Image
        src={cafe.heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="dc-hero-wash absolute inset-0" />
      <div aria-hidden className="dc-hero-grain absolute inset-0" />

      <PourScene className="dc-pour-anchor" />

      <div className="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-end px-5 pb-20 pt-40 sm:pb-24">
        <Reveal>
          <p className="dc-display inline-flex w-fit items-center gap-2 rounded-full border border-white/35 bg-black/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white backdrop-blur-sm">
            {cafe.address.split(',')[0]} · open at seven
          </p>
        </Reveal>

        <Reveal delay={90}>
          <h1 className="dc-display dc-hero-title mt-6 max-w-4xl text-white">
            Bagels baked while
            <br />
            the street is{' '}
            <span className="dc-serif font-normal italic text-[var(--dc-honey)]">still asleep</span>
          </h1>
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/90">{cafe.intro}</p>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#menu" className="focus-ring dc-btn dc-btn-solid">
              Read the board
            </a>
            <a href="#visit" className="focus-ring dc-btn dc-btn-ghost">
              Find the door
            </a>
          </div>
        </Reveal>

        <Reveal delay={340}>
          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/25 pt-7">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <span className="dc-display block text-2xl text-[var(--dc-honey)] sm:text-3xl">
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
