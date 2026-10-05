import { Star } from 'lucide-react';
import type { PlaceRow, ReviewRow } from './types';

function Stars({ value }: { value: number }) {
  return (
    <span role="img" aria-label={`${value} out of 5`} className="flex gap-0.5 text-[var(--sv-accent)]">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={13} fill={n <= value ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

export function ReviewPanel({ place, reviews }: { place: PlaceRow; reviews: ReviewRow[] }) {
  const buckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const positiveShare = place.num_reviews > 0 ? Math.round((place.positive_reviews / place.num_reviews) * 100) : null;

  return (
    <section className="mt-10">
      <h2 className="savour-display mb-3 text-xl font-semibold">What people say</h2>

      <div className="sv-card mb-4 p-4">
        {buckets.map((b) => (
          <div key={b.star} className="flex items-center gap-3 py-1 text-xs">
            <span className="w-8 shrink-0 tabular-nums text-[var(--sv-muted)]">{b.star}★</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--sv-elevated)]">
              <span
                className="block h-full rounded-full bg-[var(--sv-accent)]"
                style={{ width: `${Math.round((b.count / max) * 100)}%` }}
              />
            </span>
            <span className="w-6 shrink-0 text-right tabular-nums">{b.count}</span>
          </div>
        ))}
        <p className="mt-3 text-xs leading-relaxed text-[var(--sv-muted)]">
          {reviews.length} written impressions, chosen as a sample — {place.num_reviews.toLocaleString('en-IN')} ratings
          summarised across public listings
          {positiveShare !== null && (
            <>
              , of which ≈{place.positive_reviews.toLocaleString('en-IN')} are 4★ and up (estimate, {positiveShare}% of
              the total)
            </>
          )}
          .
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {reviews.map((r) => (
          <li key={r.id} className="sv-card p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{r.author}</span>
              <span className="ml-auto">
                <Stars value={r.rating} />
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--sv-text)]">{r.body}</p>
            {r.visited_on && <p className="mt-2 text-xs text-[var(--sv-muted)]">Visited {r.visited_on}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
