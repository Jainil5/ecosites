'use client';

import type { CSSProperties } from 'react';
import { menuGroups, type MenuItem } from './menu';
import { Reveal } from './Reveal';

function Row({ item, index }: { item: MenuItem; index: number }) {
  return (
    <li className="dc-item" style={{ '--i': index } as CSSProperties}>
      <div className="flex items-baseline gap-3">
        <h4 className="dc-display shrink-0 text-[17px] text-[var(--dc-ink)]">{item.name}</h4>
        <span aria-hidden className="dc-leader" />
        <span className="dc-display shrink-0 text-[15px] tabular-nums text-[var(--dc-ember)]">
          {item.price}
        </span>
      </div>

      <p className="mt-1 text-sm leading-relaxed text-[var(--dc-muted)]">{item.note}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {item.badge ? (
          <span className="dc-pill dc-pill-badge">{item.badge}</span>
        ) : null}
        {item.tags.map((tag) => (
          <span key={tag} className="dc-pill">
            {tag}
          </span>
        ))}
      </div>
    </li>
  );
}

export function MenuBoard() {
  return (
    <section id="menu" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <p className="dc-display text-[11px] uppercase tracking-[0.26em] text-[var(--dc-ember)]">
            The board
          </p>
          <h2 className="dc-display mt-3 text-4xl text-[var(--dc-ink)] sm:text-5xl">
            Everything we make, on one page
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--dc-muted)]">
            No folded card and no scrolling to find the good stuff. The whole board reads top to
            bottom, the way it does on the wall behind the counter.
          </p>
        </Reveal>

        <div className="mt-14 space-y-16">
          {menuGroups.map((group, i) => (
            <Reveal key={group.id} variant="unfold" delay={i * 80}>
              <div className="dc-group">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[var(--dc-ink)]/85 pb-4">
                  <div>
                    <p className="dc-display text-[11px] uppercase tracking-[0.24em] text-[var(--dc-muted)]">
                      {group.kicker}
                    </p>
                    <h3 className="dc-display mt-2 text-2xl text-[var(--dc-ink)] sm:text-3xl">
                      {group.title}
                    </h3>
                  </div>
                  <p className="max-w-sm text-sm leading-relaxed text-[var(--dc-muted)]">
                    {group.blurb}
                  </p>
                </div>

                <ul className="dc-items">
                  {group.items.map((item, j) => (
                    <Row key={item.name} item={item} index={j} />
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-14 border-t border-[var(--dc-line)] pt-6 text-sm text-[var(--dc-muted)]">
            <span className="dc-display uppercase tracking-[0.14em] text-[var(--dc-ink)]/70">
              Vegan · Vegetarian · Gluten-free
            </span>{' '}
            — marked as we cook it. Oat, almond and soy milk are always in and cost nothing extra.
            Prices include taxes; the board empties early on Saturdays.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
