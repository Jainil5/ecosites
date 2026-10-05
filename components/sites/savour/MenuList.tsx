'use client';
import { useState } from 'react';
import { SaveButton } from './SaveButton';
import { VegMark, price } from './DishCardView';
import { WishlistProvider } from './wishlist';
import type { Course, MenuItemRow } from './types';

export const COURSE_LABEL: Record<Course, string> = {
  aperitif: 'Aperitifs',
  starter: 'Starters',
  main: 'Mains',
  breads: 'Breads',
  dessert: 'Desserts',
  beverage: 'Drinks',
};

export const COURSE_ORDER: Course[] = ['aperitif', 'starter', 'main', 'breads', 'dessert', 'beverage'];

const byCourseOrder = (a: MenuItemRow, b: MenuItemRow): number =>
  COURSE_ORDER.indexOf(a.course) - COURSE_ORDER.indexOf(b.course) ||
  a.course_rank - b.course_rank ||
  a.name.localeCompare(b.name);

export function MenuList({ items }: { items: MenuItemRow[] }) {
  const [announcement, setAnnouncement] = useState('');
  const sorted = [...items].sort(byCourseOrder);
  // Every course is on the page at once; the grouping is a heading, not a tab.
  const groups = COURSE_ORDER.map((course) => ({ course, rows: sorted.filter((i) => i.course === course) })).filter(
    (g) => g.rows.length > 0,
  );

  return (
    <WishlistProvider>
      <section className="mt-8">
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
        {groups.map((g) => (
          <div key={g.course} className="mb-8">
            <h2 className="savour-display mb-3 border-b border-[var(--sv-line)] pb-1 text-xl font-semibold">
              {COURSE_LABEL[g.course]}
            </h2>
            <ul className="flex flex-col divide-y divide-[var(--sv-line)]">
              {g.rows.map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      <VegMark veg={item.is_veg} />
                      {item.name}
                      {item.is_signature && (
                        <span className="rounded-full border border-[var(--sv-accent-deep)] px-2 py-0.5 text-[0.7rem] text-[var(--sv-accent)]">
                          Signature
                        </span>
                      )}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-xs leading-relaxed text-[var(--sv-muted)]">{item.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm tabular-nums">{price(item.price)}</span>
                  <SaveButton
                    menuItemId={item.id}
                    dishName={item.name}
                    onSaved={(dish, list) => setAnnouncement(`Saved ${dish} to ${list}`)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </WishlistProvider>
  );
}
