'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cafe } from './cafe';
import { BeansField } from './BeansField';
import { PourScene } from './PourScene';
import { Reveal } from './Reveal';

const facts = [
  { value: '7:00', label: 'First tray lands' },
  { value: '16', label: 'Seats, one long bench' },
  { value: '3', label: 'Bakes through the day' },
];

export function Hero() {
  return (
    <section aria-label="The morning room" className="cc-hero relative overflow-hidden">
      <Image
        src={cafe.heroImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="cc-hero-wash absolute inset-0" />
      <div aria-hidden className="cc-hero-grain absolute inset-0" />
      <BeansField />

      <PourScene className="cc-pour-anchor" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-20 pt-32 sm:pb-24">
        <Reveal>
          <p className="cc-serif max-w-xl text-2xl leading-snug text-white sm:text-3xl">
            {cafe.intro}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <Link href="/coffee-cups/menu" className="focus-ring cc-btn cc-btn-solid cc-hero-cta mt-9">
            View our menu
          </Link>
        </Reveal>

        <Reveal delay={120}>
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
