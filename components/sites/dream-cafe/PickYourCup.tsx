'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { pickerTabs } from './menu';
import { Reveal } from './Reveal';

export function PickYourCup() {
  const [tabIndex, setTabIndex] = useState(0);
  const [pick, setPick] = useState(0);

  const tab = pickerTabs[tabIndex];
  const active = tab.items[pick];

  return (
    <section id="top" aria-label="Pick your cup" className="dc-pick relative overflow-hidden">
      <div aria-hidden className="dc-pick-wash" />
      <div aria-hidden className="dc-hero-grain absolute inset-0" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-12 px-5 pb-16 pt-28 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-24">
        <div>
          <Reveal>
            <p className="dc-display text-[11px] uppercase tracking-[0.26em] text-[rgba(251,244,233,0.78)]">
              Pick your cup
            </p>
            <h1 className="dc-display dc-hero-title mt-4 text-white">
              Bagels baked while the street is{' '}
              <span className="dc-serif font-normal italic text-[var(--dc-honey)]">still asleep</span>
            </h1>
          </Reveal>

          <Reveal delay={90}>
            <div className="dc-pick-tabs" role="tablist" aria-label="Menu section">
              <span aria-hidden className="dc-pick-pill" data-pos={tabIndex} />
              {pickerTabs.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={i === tabIndex}
                  className="dc-display dc-pick-tab"
                  onClick={() => {
                    setTabIndex(i);
                    setPick(0);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="dc-pick-info" key={`${tab.id}-${active.id}`}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="dc-pick-reason">{active.reason}</span>
                <span className="dc-display text-2xl tabular-nums text-white">{active.price}</span>
              </div>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[rgba(251,244,233,0.9)]">
                {active.note}
              </p>
            </div>
          </Reveal>

          <Reveal delay={230}>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#menu" className="focus-ring dc-btn dc-btn-cream">
                Read the board
              </a>
              <a href="#visit" className="focus-ring dc-btn dc-btn-ghost">
                Find the door
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="dc-pick-stage">
          <div className="dc-pick-hero">
            <div className="dc-pick-frame">
              {tab.items.map((item, i) => (
                <Image
                  key={`${tab.id}-${item.id}`}
                  src={item.src}
                  alt={item.name}
                  width={900}
                  height={900}
                  priority={i === 0}
                  className={
                    'dc-pick-img' + (i === pick ? ' dc-pick-img-on' : '')
                  }
                />
              ))}
              <h2 className="dc-display dc-pick-name" key={`${tab.id}-${active.id}`}>
                {active.name}
              </h2>
            </div>
          </div>

          {tab.items.map((item, i) => (
            <button
              key={`${tab.id}-${item.id}`}
              type="button"
              className="dc-pick-card"
              data-slot={i}
              data-active={i === pick}
              style={{ '--i': i } as CSSProperties}
              aria-pressed={i === pick}
              aria-label={`${item.name}, ${item.price}`}
              onClick={() => setPick(i)}
            >
              <Image
                src={item.src}
                alt=""
                width={900}
                height={900}
                className="!h-full !w-full object-cover"
              />
              <span className="dc-pick-card-name">{item.name}</span>
            </button>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
