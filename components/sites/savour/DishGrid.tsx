'use client';
import { DishCardView } from './DishCardView';
import type { DishCard } from './types';

interface Props {
  cards: DishCard[];
  onSaved?: (dishName: string, listName: string) => void;
}

export function DishGrid({ cards, onSaved }: Props) {
  return (
    <section
      id="dishes"
      role="tabpanel"
      aria-labelledby="items-tab"
      className="mx-auto max-w-6xl px-4 pb-10"
    >
      <h2 className="savour-display sr-only">Dishes</h2>
      {cards.length === 0 ? (
        <p className="sv-card p-6 text-center text-sm text-[var(--sv-muted)]">
          No dishes match these filters.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <DishCardView key={c.item.id} card={c} onSaved={onSaved} />
          ))}
        </div>
      )}
    </section>
  );
}
