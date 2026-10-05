'use client';
import Link from 'next/link';
import type { PlaceRow } from './types';

const COURSE_LABEL = (c: string) => c.replace(/_/g, ' ');

export function PlaceGrid({ places }: { places: PlaceRow[] }) {
  return (
    <section
      id="places"
      role="tabpanel"
      aria-labelledby="places-tab"
      className="mx-auto max-w-6xl px-4 pb-10"
    >
      <h2 className="savour-display sr-only">Places</h2>
      {places.length === 0 ? (
        <p className="sv-card p-6 text-center text-sm text-[var(--sv-muted)]">
          No places match these filters.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <article key={p.id} className="sv-card flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="savour-display text-lg font-semibold leading-snug">
                    <Link
                      href={`/savour/${p.slug}`}
                      className="underline-offset-4 hover:text-[var(--sv-accent)] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-[var(--sv-muted)]">{p.area ?? p.city}</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-[var(--sv-accent)]">{p.price_band}</span>
              </div>

              {p.cuisines.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {p.cuisines.map((c) => (
                    <span key={c} className="rounded-full border border-[var(--sv-line)] px-2 py-0.5 text-[0.7rem] text-[var(--sv-muted)]">
                      {COURSE_LABEL(c)}
                    </span>
                  ))}
                </div>
              )}

              <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <dt className="text-[var(--sv-muted)]">Rating</dt>
                <dd className="text-right tabular-nums">
                  {p.rating === null ? '—' : `${p.rating.toFixed(1)} ★`}
                  <span className="ml-1 text-[var(--sv-muted)]">
                    ({p.num_reviews.toLocaleString('en-IN')})
                  </span>
                </dd>
                <dt className="text-[var(--sv-muted)]">Cost for two</dt>
                <dd className="text-right tabular-nums">{p.cost_for_two === null ? '—' : `₹${p.cost_for_two}`}</dd>
                {p.verified_at && (
                  <>
                    <dt className="text-[var(--sv-muted)]">Checked</dt>
                    <dd className="text-right tabular-nums">{p.verified_at}</dd>
                  </>
                )}
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
