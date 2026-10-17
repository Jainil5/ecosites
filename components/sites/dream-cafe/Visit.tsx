'use client';

import { Clock, Mail, MapPin } from 'lucide-react';
import { cafe } from './cafe';
import { Reveal } from './Reveal';

export function Visit() {
  return (
    <section id="visit" className="scroll-mt-24 border-t border-[var(--dc-line)] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <p className="dc-display text-[11px] uppercase tracking-[0.26em] text-[var(--dc-ember)]">
            Visit
          </p>
          <h2 className="dc-display mt-3 text-4xl text-[var(--dc-ink)] sm:text-5xl">
            The yellow door on Sunrise Lane
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <div className="dc-card h-full p-7 sm:p-8">
              <h3 className="dc-display flex items-center gap-2.5 text-lg text-[var(--dc-ink)]">
                <Clock aria-hidden className="h-4 w-4 text-[var(--dc-ember)]" />
                Hours
              </h3>
              <dl className="mt-5 divide-y divide-[var(--dc-line)]">
                {cafe.hours.map((slot) => (
                  <div key={slot.days} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="dc-display text-[13px] uppercase tracking-[0.14em] text-[var(--dc-muted)]">
                      {slot.days}
                    </dt>
                    <dd className="dc-display tabular-nums text-[var(--dc-ink)]">{slot.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm leading-relaxed text-[var(--dc-muted)]">
                Kitchen stops thirty minutes before the door does. When the trays go, they go — we
                write the time on the chalkboard.
              </p>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={80}>
              <div className="dc-card p-7">
                <h3 className="dc-display flex items-center gap-2.5 text-lg text-[var(--dc-ink)]">
                  <MapPin aria-hidden className="h-4 w-4 text-[var(--dc-ember)]" />
                  Where
                </h3>
                <p className="mt-4 leading-relaxed text-[var(--dc-muted)]">{cafe.address}</p>
                <ul className="mt-5 space-y-2">
                  {cafe.notes.map((note) => (
                    <li key={note} className="flex gap-2.5 text-sm text-[var(--dc-muted)]">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--dc-apricot)]" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="dc-card p-7">
                <h3 className="dc-display flex items-center gap-2.5 text-lg text-[var(--dc-ink)]">
                  <Mail aria-hidden className="h-4 w-4 text-[var(--dc-ember)]" />
                  Order ahead
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--dc-muted)]">
                  Trays, trays of bagels and anything you want waiting on the counter when you get
                  in. Write the day and the time.
                </p>
                <a
                  href={`mailto:${cafe.email}?subject=Order%20ahead`}
                  className="focus-ring dc-btn dc-btn-solid mt-6 w-full"
                >
                  {cafe.email}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
