'use client';
import { useRef } from 'react';

export type ViewKey = 'items' | 'places';

/**
 * Rendered as the second row of the sticky header rather than its own sticky bar,
 * so the two never need matching `top` offsets and no content peeks between them.
 */

export const VIEW_TABS: { key: ViewKey; label: string; panelId: string }[] = [
  { key: 'items', label: 'Items', panelId: 'dishes' },
  { key: 'places', label: 'Places', panelId: 'places' },
];

interface Props {
  view: ViewKey;
  onChange: (view: ViewKey) => void;
  counts: Record<ViewKey, number>;
}

export function ViewTabs({ view, onChange, counts }: Props) {
  const refs = useRef<Record<ViewKey, HTMLButtonElement | null>>({ items: null, places: null });

  const activate = (key: ViewKey) => {
    onChange(key);
    refs.current[key]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = VIEW_TABS.findIndex((t) => t.key === view);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 1 : -1;
      activate(VIEW_TABS[(index + step + VIEW_TABS.length) % VIEW_TABS.length].key);
    } else if (e.key === 'Home') {
      e.preventDefault();
      activate(VIEW_TABS[0].key);
    } else if (e.key === 'End') {
      e.preventDefault();
      activate(VIEW_TABS[VIEW_TABS.length - 1].key);
    }
  };

  return (
    <div className="border-t border-[var(--sv-line)]/70">
      <div role="tablist" aria-label="Browse the guide" className="mx-auto flex max-w-6xl gap-1 px-4">
        {VIEW_TABS.map((t) => {
          const selected = t.key === view;
          return (
            <button
              key={t.key}
              ref={(el) => {
                refs.current[t.key] = el;
              }}
              type="button"
              role="tab"
              id={`${t.key}-tab`}
              aria-selected={selected}
              aria-controls={t.panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.key)}
              onKeyDown={onKeyDown}
              className={`border-b-2 px-3 pb-2 pt-1.5 text-sm transition-colors ${
                selected
                  ? 'border-[var(--sv-accent)] text-[var(--sv-text)]'
                  : 'border-transparent text-[var(--sv-muted)] hover:text-[var(--sv-text)]'
              }`}
            >
              {t.label}
              <span className="ml-1.5 tabular-nums text-[var(--sv-accent)]">{counts[t.key]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
