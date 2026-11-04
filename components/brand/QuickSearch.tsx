'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import { searchIndex, type NavRow } from '@/content/brand/nav';

const MAX_RESULTS = 9;

/** Every word of the query has to appear somewhere in the row's text. */
function matches(row: NavRow, query: string): boolean {
  const haystack = `${row.title} ${row.description} ${row.tag ?? ''} ${row.href}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/**
 * Quick search over the pages the nav already knows about. No index of its
 * own, so a row can only appear here if the menu or a page already ships it.
 */
export function QuickSearch({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return searchIndex.slice(0, MAX_RESULTS);
    return searchIndex.filter((row) => matches(row, trimmed)).slice(0, MAX_RESULTS);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query]);

  // The palette is a modal: the page behind it stops scrolling.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (results.length === 0) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActive((index) => (index + step + results.length) % results.length);
        return;
      }
      if (event.key === 'Enter') {
        const row = results[active];
        if (row) window.location.assign(row.href);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, onClose, results]);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-canvas/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search this site"
        className="gs-drop gs-menu relative w-full max-w-xl overflow-hidden"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <Search aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services, products, work"
            aria-label="Search this site"
            className="w-full bg-transparent py-4 font-display text-base text-ink outline-none placeholder:text-ink-3"
          />
          <kbd className="gs-label hidden shrink-0 border border-hairline px-1.5 py-1 sm:block">
            Esc
          </kbd>
        </div>

        {results.length === 0 ? (
          <p className="gs-label px-4 py-6 text-center">No page matches that</p>
        ) : (
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Pages"
            className="max-h-[min(24rem,60vh)] overflow-y-auto p-1.5"
          >
            {results.map((row, index) => (
              <li key={row.href} role="option" aria-selected={index === active}>
                <Link
                  href={row.href}
                  onMouseEnter={() => setActive(index)}
                  onClick={onClose}
                  aria-current={row.href.split('#')[0] === pathname ? 'page' : undefined}
                  data-active={index === active ? 'true' : undefined}
                  className="focus-ring gs-nav-row flex gap-3 px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-bold text-ink">
                      {row.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-2">
                      {row.description}
                    </span>
                  </span>
                  {index === active ? (
                    <CornerDownLeft aria-hidden className="mt-1 h-4 w-4 shrink-0 text-plane" />
                  ) : (
                    <span className="gs-label mt-1 shrink-0">{row.tag ?? row.href}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-4 border-t border-hairline px-4 py-2.5">
          <span className="gs-label">Arrows to move</span>
          <span className="gs-label">Enter to open</span>
          <span className="gs-label ml-auto">{`${results.length} of ${searchIndex.length}`}</span>
        </div>
      </div>
    </div>
  );
}
