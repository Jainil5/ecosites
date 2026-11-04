'use client';

import { useState } from 'react';
import { menuGroups } from './menu';
import { Reveal } from './Reveal';

/**
 * The wall of taps. Every beer the brewhouse pours gets a handle, a marker
 * and a line on the board; picking one reads out its strength, its bitterness
 * and what the kitchen says it goes with.
 */
const brews = menuGroups.find((g) => g.id === 'brews')!;

function TapHandle({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 64 132" aria-hidden className="br-tap-handle" data-active={active ? 'true' : 'false'}>
      {/* riser: the pipe the beer comes up through */}
      <rect x="25" y="44" width="14" height="88" rx="4" fill="url(#brTapPipe)" />
      {/* spout, leaning over the glass */}
      <path d="M25 48h-9a6 6 0 0 0-6 6v6" fill="none" stroke="url(#brTapPipe)" strokeWidth="7" strokeLinecap="round" />
      {/* collar */}
      <rect x="22" y="34" width="20" height="12" rx="4" fill="url(#brTapPipe)" />
      {/* the handle itself — it tips forward when the tap is pulled */}
      <g className="br-tap-grip">
        <rect x="6" y="20" width="52" height="13" rx="6.5" fill="url(#brTapBrass)" />
        <circle cx="12" cy="26.5" r="5" fill="url(#brTapBrass)" />
      </g>
      {/* cap on top of the riser */}
      <circle cx="32" cy="16" r="6" fill="url(#brTapBrass)" />
      <defs>
        <linearGradient id="brTapPipe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a6a3a" />
          <stop offset="45%" stopColor="#e3c187" />
          <stop offset="100%" stopColor="#6d5228" />
        </linearGradient>
        <linearGradient id="brTapBrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2c274" />
          <stop offset="55%" stopColor="#c08a34" />
          <stop offset="100%" stopColor="#8d5610" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Taps() {
  const [active, setActive] = useState(0);
  const beer = brews.items[active];

  return (
    <section id="taps" aria-label="The tap wall" className="br-taps scroll-mt-20">
      <div aria-hidden className="br-taps-glow" />
      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <Reveal className="max-w-2xl">
          <p className="br-display text-[11px] uppercase tracking-[0.26em] text-[var(--br-amber)]">
            The wall
          </p>
          <h2 className="br-display mt-3 text-4xl text-[var(--br-cream)] sm:text-5xl">
            Twelve taps, and the bench decides the list
          </h2>
          <p className="br-serif mt-5 text-lg leading-snug text-[rgba(251,244,233,0.78)]">
            Nothing on this wall is bought in. It is brewed two doors down, poured from the tank it
            settled in, and swapped every Monday when the brewhouse has something better.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="br-tap-wall" role="tablist" aria-label="Beers on tap">
            {brews.items.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                id={`br-tap-${b.id}`}
                aria-selected={i === active}
                aria-controls="br-tap-panel"
                className="br-tap"
                onClick={() => setActive(i)}
              >
                <span className="br-tap-riser">
                  <TapHandle active={i === active} />
                </span>
                <span className="br-tap-marker">
                  <span className="br-tap-name">{b.name}</span>
                  <span className="br-tap-abv">{b.abv}%</span>
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div
            id="br-tap-panel"
            role="tabpanel"
            aria-labelledby={`br-tap-${beer.id}`}
            className="br-tap-panel"
          >
            <div className="br-tap-panel-head">
              <p className="br-display text-[11px] uppercase tracking-[0.24em] text-[var(--br-amber)]">
                {beer.style}
              </p>
              <h3 className="br-display mt-2 text-3xl text-[var(--br-cream)] sm:text-4xl">
                {beer.name}
              </h3>
              <p className="br-serif mt-3 max-w-xl text-lg italic leading-snug text-[rgba(251,244,233,0.8)]">
                {beer.note}
              </p>
            </div>

            <dl className="br-tap-stats">
              <div>
                <dt>Strength</dt>
                <dd>{beer.abv}% ABV</dd>
              </div>
              <div>
                <dt>Bitterness</dt>
                <dd>{beer.ibu} IBU</dd>
              </div>
              <div>
                <dt>Pint</dt>
                <dd>{beer.price}</dd>
              </div>
            </dl>

            <p className="br-tap-pair">
              <span className="br-display text-[11px] uppercase tracking-[0.2em] text-[var(--br-amber)]">
                Pours with
              </span>
              <span className="br-tap-pair-name">{beer.pairing ?? 'Ask the counter'}</span>
            </p>

            <a href="#menu" className="focus-ring br-btn br-btn-solid">
              Order this one
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
