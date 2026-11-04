'use client';

import { Clock, Mail, MapPin } from 'lucide-react';
import { brewery } from './brewery';
import { Reveal } from './Reveal';

export function Visit() {
  return (
    <section id="visit" className="scroll-mt-24 border-t border-[var(--br-line)] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <p className="br-display text-[11px] uppercase tracking-[0.26em] text-[var(--br-brass)]">
            Visit
          </p>
          <h2 className="br-display mt-3 text-4xl text-[var(--br-ink)] sm:text-5xl">
            The brass door in Old Mill Yard
          </h2>
          <a href="#menu" className="focus-ring br-btn br-btn-outline mt-6">
            Order from the board
          </a>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <div className="br-card h-full p-7 sm:p-8">
              <h3 className="br-display flex items-center gap-2.5 text-lg text-[var(--br-ink)]">
                <Clock aria-hidden className="h-4 w-4 text-[var(--br-brass)]" />
                Hours
              </h3>
              <dl className="mt-5 divide-y divide-[var(--br-line)]">
                {brewery.hours.map((slot) => (
                  <div key={slot.days} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="br-display text-[13px] uppercase tracking-[0.14em] text-[var(--br-muted)]">
                      {slot.days}
                    </dt>
                    <dd className="br-display tabular-nums text-[var(--br-ink)]">{slot.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm leading-relaxed text-[var(--br-muted)]">
                The kitchen stops an hour before the taps do. When the wings are gone, they are
                gone — the board says so, and the board is never wrong.
              </p>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={80}>
              <div className="br-card p-7">
                <h3 className="br-display flex items-center gap-2.5 text-lg text-[var(--br-ink)]">
                  <MapPin aria-hidden className="h-4 w-4 text-[var(--br-brass)]" />
                  Where
                </h3>
                <p className="mt-4 leading-relaxed text-[var(--br-muted)]">{brewery.address}</p>
                <ul className="mt-5 space-y-2">
                  {brewery.notes.map((note) => (
                    <li key={note} className="flex gap-2.5 text-sm text-[var(--br-muted)]">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--br-copper)]" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="br-card p-7">
                <h3 className="br-display flex items-center gap-2.5 text-lg text-[var(--br-ink)]">
                  <Mail aria-hidden className="h-4 w-4 text-[var(--br-brass)]" />
                  Growlers to go
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--br-muted)]">
                  A filled growler and a bag of crisps waiting at the bar when you get in. Write the
                  day and the time.
                </p>
                <a
                  href={`mailto:${brewery.email}?subject=Growler%20to%20go`}
                  className="focus-ring br-btn br-btn-solid mt-6 w-full"
                >
                  {brewery.email}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
