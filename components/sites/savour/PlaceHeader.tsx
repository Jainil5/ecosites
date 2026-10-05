import type { PlaceRow } from './types';

const DAY_LABEL: Record<string, string> = {
  Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday',
};
const DAY_ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function PlaceHeader({ place }: { place: PlaceRow }) {
  const maps =
    place.lat !== null && place.lng !== null
      ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.city}`)}`;

  const hours = place.hours;

  return (
    <header className="mt-4 flex flex-col gap-4">
      <div>
        <h1 className="savour-display text-3xl font-semibold leading-tight sm:text-4xl">{place.name}</h1>
        <p className="mt-1 text-sm text-[var(--sv-muted)]">
          {[place.area, place.city, place.price_band].filter(Boolean).join(' · ')}
        </p>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        {place.rating !== null && (
          <p>
            <span className="savour-display text-xl font-semibold text-[var(--sv-accent)]">{place.rating.toFixed(1)}</span>
            <span className="ml-1 text-[var(--sv-muted)]">/ 5 · {place.num_reviews.toLocaleString('en-IN')} ratings</span>
          </p>
        )}
        {place.cost_for_two !== null && <p className="text-[var(--sv-muted)]">≈ ₹{place.cost_for_two.toLocaleString('en-IN')} for two</p>}
        {place.verified_at !== null && <p className="text-xs text-[var(--sv-muted)]">Checked {place.verified_at}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sv-card p-4 text-sm">
          <h2 className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--sv-muted)]">Find it</h2>
          <address className="not-italic leading-relaxed">
            {place.address ?? place.area ?? place.city}
            {' '}
            <a href={maps} target="_blank" rel="noreferrer" className="text-[var(--sv-accent)] underline underline-offset-4">
              open in Maps
            </a>
          </address>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {place.phone && (
              <a href={`tel:${place.phone.replace(/[^+\d]/g, '')}`} className="underline underline-offset-4 hover:text-[var(--sv-accent)]">
                {place.phone}
              </a>
            )}
            {place.website && (
              <a href={/^https?:/.test(place.website) ? place.website : `https://${place.website}`} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-[var(--sv-accent)]">
                Website
              </a>
            )}
            {place.instagram && (
              <a href={place.instagram} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-[var(--sv-accent)]">
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="sv-card p-4 text-sm">
          <h2 className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--sv-muted)]">Hours</h2>
          {hours ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {DAY_ORDER.filter((d) => hours[d]).map((d) => (
                <div key={d} className="contents">
                  <dt className="text-[var(--sv-muted)]">{DAY_LABEL[d]}</dt>
                  <dd className="text-right tabular-nums">{hours[d].join(' · ')}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs text-[var(--sv-muted)]">Hours not published — check the venue.</p>
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--sv-muted)]">
        Menu below is curated from published menus, not live.
      </p>
    </header>
  );
}
