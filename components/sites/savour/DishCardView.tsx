'use client';
import Link from 'next/link';
import { SaveButton } from './SaveButton';
import type { DishCard } from './types';

export function VegMark({ veg }: { veg: boolean | null }) {
  const color = veg === true ? 'var(--sv-veg)' : veg === false ? 'var(--sv-nonveg)' : 'var(--sv-muted)';
  const title = veg === true ? 'Vegetarian' : veg === false ? 'Non-vegetarian' : 'Veg status not listed';
  return (
    <span
      title={title}
      aria-label={title}
      role="img"
      className="inline-block h-3.5 w-3.5 shrink-0 border"
      style={{ borderColor: color }}
    >
      <span className="block h-full w-full scale-[0.45]" style={{ background: veg === null ? 'transparent' : color }} />
    </span>
  );
}

export function price(v: number): string {
  return `₹${Number.isInteger(v) ? v : v.toFixed(2)}`;
}

interface Props {
  card: DishCard;
  onSaved?: (dishName: string, listName: string) => void;
}

export function DishCardView({ card, onSaved }: Props) {
  const { item, place } = card;
  return (
    <article className="sv-card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="savour-display text-lg font-semibold leading-snug">{item.name}</h3>
          <Link
            href={`/savour/${place.slug}`}
            className="text-xs text-[var(--sv-muted)] underline-offset-4 hover:text-[var(--sv-accent)] hover:underline"
          >
            {place.name} · {place.area ?? place.city}
          </Link>
        </div>
        <SaveButton menuItemId={item.id} dishName={item.name} onSaved={onSaved} />
      </div>
      {item.description && <p className="text-sm leading-relaxed text-[var(--sv-muted)]">{item.description}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
        <VegMark veg={item.is_veg} />
        {item.is_signature && (
          <span className="rounded-full border border-[var(--sv-accent-deep)] px-2 py-0.5 text-[var(--sv-accent)]">
            Signature
          </span>
        )}
        <span className="ml-auto tabular-nums">{price(item.price)}</span>
      </div>
    </article>
  );
}
