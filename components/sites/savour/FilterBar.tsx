'use client';
import { EMPTY_FILTERS, type Filters, type PriceBand, type SortKey } from './types';

const BANDS: PriceBand[] = ['₹', '₹₹', '₹₹₹', '₹₹₹₹'];
const SORTS: [SortKey, string][] = [
  ['rating', 'Top rated'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['name', 'Dish name'],
  ['saved', 'Saved first'],
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const isDirty = (f: Filters) => JSON.stringify(f) !== JSON.stringify(EMPTY_FILTERS);

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  cities: string[];
  cuisines: string[];
  resultCount: number;
  resultNoun: string;
}

export function FilterBar({ filters, onChange, cities, cuisines, resultCount, resultNoun }: Props) {
  return (
    <section aria-label="Filter the guide" className="mx-auto max-w-6xl px-4 pb-6">
      <div className="sv-card flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {cuisines.map((c) => (
            <button
              key={c}
              type="button"
              className="sv-chip"
              aria-pressed={filters.cuisines.includes(c)}
              onClick={() => onChange({ ...filters, cuisines: toggle(filters.cuisines, c) })}
            >
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div role="group" aria-label="Price band" className="flex items-center gap-2">
            <span className="text-xs text-[var(--sv-muted)]">Price</span>
            {BANDS.map((b) => (
              <button
                key={b}
                type="button"
                className="sv-chip"
                aria-pressed={filters.bands.includes(b)}
                onClick={() => onChange({ ...filters, bands: toggle(filters.bands, b) })}
              >
                {b}
              </button>
            ))}
          </div>

          {cities.length > 1 && (
            <label className="flex items-center gap-2">
              <span className="text-xs text-[var(--sv-muted)]">City</span>
              <select
                value={filters.city}
                onChange={(e) => onChange({ ...filters, city: e.target.value })}
                className="min-h-10 rounded-md border border-[var(--sv-line)] bg-[var(--sv-elevated)] px-2 py-2 text-sm outline-none focus:border-[var(--sv-accent)]"
              >
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex items-center gap-2">
            <span className="text-xs text-[var(--sv-muted)]">Sort</span>
            <select
              value={filters.sort}
              onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
              className="min-h-10 rounded-md border border-[var(--sv-line)] bg-[var(--sv-elevated)] px-2 py-2 text-sm outline-none focus:border-[var(--sv-accent)]"
            >
              {SORTS.map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex min-h-10 cursor-pointer select-none items-center gap-2">
            <input
              type="checkbox"
              checked={filters.vegOnly}
              onChange={(e) => onChange({ ...filters, vegOnly: e.target.checked })}
              className="h-6 w-6 shrink-0 accent-[var(--sv-accent)]"
            />
            Pure veg only
          </label>

          {isDirty(filters) && (
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTERS)}
              className="ml-auto text-xs text-[var(--sv-accent)] underline underline-offset-4"
            >
              Clear filters
            </button>
          )}
        </div>

        <p aria-live="polite" className="text-xs text-[var(--sv-muted)]">
          {resultCount} {resultNoun}
        </p>
      </div>
    </section>
  );
}
