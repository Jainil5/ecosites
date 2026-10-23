'use client';
import { useMemo, useState } from 'react';
import { Heart, Search, UtensilsCrossed } from 'lucide-react';
import { DishGrid } from './DishGrid';
import { FilterBar } from './FilterBar';
import { PlaceGrid } from './PlaceGrid';
import { ViewTabs, type ViewKey } from './ViewTabs';
import { WishlistDrawer } from './WishlistDrawer';
import { applyFilters, availableCities, availableCuisines, filterPlaces } from './filters';
import { buildDishCards } from './dishes';
import { EMPTY_FILTERS, type Catalogue, type Filters } from './types';
import { useWishlist, WishlistProvider } from './wishlist';

export function Savour({ catalogue }: { catalogue: Catalogue }) {
  return (
    <WishlistProvider>
      <Shell catalogue={catalogue} />
    </WishlistProvider>
  );
}

function Shell({ catalogue }: { catalogue: Catalogue }) {
  const w = useWishlist();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [view, setView] = useState<ViewKey>('items');
  const [drawer, setDrawer] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const allCards = useMemo(() => buildDishCards(catalogue.places, catalogue.items), [catalogue]);
  const cards = useMemo(() => applyFilters(allCards, filters, w.saved), [allCards, filters, w.saved]);
  const places = useMemo(() => filterPlaces(allCards, filters, w.saved), [allCards, filters, w.saved]);
  const cities = useMemo(() => availableCities(allCards), [allCards]);
  const cuisines = useMemo(() => availableCuisines(allCards), [allCards]);
  const onSaved = (dishName: string, listName: string) => setAnnouncement(`Saved ${dishName} to ${listName}`);

  return (
    <div className="savour min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--sv-line)] bg-[color:var(--sv-canvas)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="savour-display text-xl font-semibold tracking-wide">Savour</span>
          <span className="hidden text-xs text-[var(--sv-muted)] sm:inline">Dish-first guide</span>
          <div className="ml-auto flex items-center gap-2">
            <label className="relative">
              <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--sv-muted)]" />
              <input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Search dishes or places"
                aria-label="Search dishes or places"
                className="w-40 rounded-full border border-[var(--sv-line)] bg-[var(--sv-elevated)] py-1.5 pl-8 pr-3 text-sm outline-none focus:border-[var(--sv-accent)] sm:w-56"
              />
            </label>
            <button type="button" onClick={() => setDrawer(true)} className="sv-chip flex items-center gap-1.5" aria-haspopup="dialog">
              <Heart size={14} />
              Saved
              <span className="tabular-nums">{w.items.length}</span>
            </button>
          </div>
        </div>
        <ViewTabs view={view} onChange={setView} counts={{ items: cards.length, places: places.length }} />
      </header>

      {catalogue.degraded && (
        <p className="sv-degraded mx-auto max-w-6xl px-4 py-2 text-xs">
          Showing a bundled sample subset — the database is unavailable right now. Browsing works;
          saving is disabled.
        </p>
      )}
      {w.error && (
        <p role="alert" className="mx-auto max-w-6xl px-4 py-2 text-xs text-[var(--sv-accent)]">
          {w.error}{' '}
          <button type="button" className="underline" onClick={() => void w.retry()}>
            Retry
          </button>
        </p>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-10">
        <p className="mb-2 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-[var(--sv-accent)]">
          <UtensilsCrossed size={13} /> {catalogue.places.length} places · {allCards.length} dishes
        </p>
        <h1 className="savour-display max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
          Save the dish, not the restaurant.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--sv-muted)]">
          A guide built around the thing you actually remember: one item, on one menu, at one place.
        </p>
      </section>

      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        cities={cities}
        cuisines={cuisines}
        resultCount={view === 'items' ? cards.length : places.length}
        resultNoun={view === 'items' ? 'dishes' : 'places'}
      />
      {view === 'items' ? (
        <DishGrid cards={cards} onSaved={onSaved} />
      ) : (
        <PlaceGrid places={places} />
      )}

      <footer className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-xs leading-relaxed text-[var(--sv-muted)]">
        <p>
          Venue names, areas, coordinates and hours come from OpenStreetMap via the Overpass API (© OpenStreetMap
          contributors). Ratings and review counts were checked by hand against public listings on the date each venue
          shows; menus and prices are curated rather than live, and the 4★-and-up figure is an estimate.
        </p>
        <p className="mt-2">Built by Website & Intelligence. Not affiliated with the venues shown.</p>
      </footer>

      <WishlistDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}
