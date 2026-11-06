'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Menu, Search, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { QuickSearch } from '@/components/brand/QuickSearch';
import { Wordmark } from '@/components/brand/Wordmark';
import { ctaLink, navGroups, navLinks, navSections, type NavRow, type NavSection } from '@/content/brand/nav';

/** The row's page is on screen, whichever anchor of it the row points at. */
function isCurrent(href: string, pathname: string): boolean {
  const path = href.split('#')[0];
  return path === pathname || (path !== '/' && pathname.startsWith(`${path}/`));
}

function RowMarker({ row }: { row: NavRow }) {
  if (row.Icon) {
    return (
      <span className="gs-icon gs-icon-sm shrink-0">
        <row.Icon aria-hidden className="h-4 w-4" />
      </span>
    );
  }
  // A shipped site brings its own colour: paint it flat, never hide it.
  if (row.swatch) {
    return (
      <span
        aria-hidden
        className="mt-0.5 inline-block h-4 w-4 shrink-0 border border-hairline"
        style={{ background: row.swatch }}
      />
    );
  }
  return <span aria-hidden className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-forest" />;
}

function DropdownRow({ row, onPick }: { row: NavRow; onPick: () => void }) {
  const pathname = usePathname();
  const current = isCurrent(row.href, pathname);
  return (
    <Link
      href={row.href}
      onClick={onPick}
      aria-current={current ? 'page' : undefined}
      data-current={current ? 'true' : undefined}
      className="focus-ring gs-nav-row flex gap-3 px-3 py-2.5"
    >
      <RowMarker row={row} />
      <span className="min-w-0">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-display text-sm font-bold text-ink">{row.title}</span>
          {row.tag ? <span className="gs-label ml-auto shrink-0">{row.tag}</span> : null}
        </span>
        <span className="mt-1 block text-xs leading-snug text-ink-2">{row.description}</span>
      </span>
    </Link>
  );
}

/**
 * A block of rows under its own heading. The heading is aria-hidden because
 * the group it names already carries that text, and no id is used because the
 * same group can be on screen twice — the desktop panel and the mobile sheet.
 */
function PanelSection({
  section,
  first,
  onPick,
}: {
  section: NavSection;
  first: boolean;
  onPick: () => void;
}) {
  const rows = (
    <ul>
      {section.rows.map((row) => (
        <li key={row.href}>
          <DropdownRow row={row} onPick={onPick} />
        </li>
      ))}
    </ul>
  );
  if (!section.label) return rows;
  return (
    <div role="group" aria-label={section.label}>
      <p aria-hidden className={`gs-label px-3 pb-1 text-lime ${first ? 'pt-1' : 'pt-3'}`}>
        {section.label}
      </p>
      {rows}
    </div>
  );
}

function PanelFooter({ row, onPick }: { row: NavRow; onPick: () => void }) {
  return (
    <Link
      href={row.href}
      onClick={onPick}
      title={row.description}
      className="focus-ring gs-nav-row mt-1 flex items-center gap-2 border-t border-hairline px-3 py-2.5"
    >
      <span className="gs-label gs-label-hot">{row.title}</span>
      <ArrowRight aria-hidden className="ml-auto h-3.5 w-3.5 text-ink-3" />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  // The bar carries its own body: content scrolls under a sticky card of frosted
  // glass, and a headline showing through the nav reads as a defect, not depth.
  // So it is darker and less transparent than the cards on the page.
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [search, setSearch] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Landing on a new route leaves nothing half-open behind it.
  useEffect(() => {
    setOpen(null);
    setSheet(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(null);
        setSheet(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearch((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <header className="gs-shell sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:pt-5">
      <div ref={barRef} className="relative mx-auto max-w-7xl">
        <nav
          aria-label="Primary"
          className="gs-bar flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4"
        >
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="focus-ring inline-flex min-h-10 items-center gap-2 rounded font-display text-sm font-extrabold uppercase leading-[1.15] tracking-tight text-ink sm:text-base sm:leading-normal"
            >
              <Logo className="h-5 w-5 text-accent" />
              <Wordmark />
            </Link>

            <ul className="hidden items-center lg:flex">
              {navLinks.map((link) => {
                const group = navGroups.find((item) => item.href === link.href);
                if (!group) {
                  const current = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={current ? 'page' : undefined}
                        className={`focus-ring gs-label group relative block px-2.5 py-2 transition-colors hover:text-ink ${
                          current ? 'text-ink' : ''
                        }`}
                      >
                        {link.label}
                        <span
                          aria-hidden
                          className="absolute inset-x-2.5 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                        />
                      </Link>
                    </li>
                  );
                }

                const expanded = open === group.href;
                const lit = group.rows.some((row) => isCurrent(row.href, pathname));
                return (
                  <li
                    key={group.href}
                    className="relative"
                    onMouseEnter={() => setOpen(group.href)}
                    onMouseLeave={() => setOpen(null)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                        setOpen(null);
                      }
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-haspopup="true"
                      onClick={() => setOpen(expanded ? null : group.href)}
                      onFocus={() => setOpen(group.href)}
                      className={`focus-ring gs-label inline-flex items-center gap-1 px-2.5 py-2 transition-colors hover:text-ink ${
                        lit || expanded ? 'text-ink' : ''
                      }`}
                    >
                      {link.label}
                      <ChevronDown
                        aria-hidden
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expanded && (
                      <div className="absolute left-0 top-full z-50 pt-2">
                        <div className="gs-drop gs-menu max-h-[min(34rem,80vh)] w-[min(25rem,calc(100vw-3rem))] overflow-y-auto overscroll-contain p-1.5">
                          {navSections(group).map((section, index) => (
                            <PanelSection
                              key={section.label ?? group.href}
                              section={section}
                              first={index === 0}
                              onPick={() => setOpen(null)}
                            />
                          ))}
                          <PanelFooter row={group.footer} onPick={() => setOpen(null)} />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearch(true)}
              aria-haspopup="dialog"
              className="focus-ring gs-label inline-flex min-h-10 items-center gap-2 border border-hairline px-2.5 text-ink-2 transition-colors hover:text-ink"
            >
              <Search aria-hidden className="h-4 w-4" />
              <span className="hidden xl:inline">Search</span>
            </button>

            <Link
              href={ctaLink.href}
              className="focus-ring gs-btn gs-btn-solid gs-btn-sm hidden sm:inline-flex"
            >
              {ctaLink.label}
            </Link>

            <button
              type="button"
              onClick={() => setSheet((value) => !value)}
              aria-expanded={sheet}
              aria-haspopup="dialog"
              aria-label={sheet ? 'Close menu' : 'Open menu'}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center border border-hairline text-ink-2 transition-colors hover:text-ink lg:hidden"
            >
              {sheet ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {sheet && (
          <div className="gs-drop gs-menu absolute inset-x-0 top-full z-50 mt-2 max-h-[calc(100vh-7rem)] overflow-y-auto p-2 lg:hidden">
            <ul className="space-y-0.5">
              {navLinks.map((link) => {
                const group = navGroups.find((item) => item.href === link.href);
                if (!group) {
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="focus-ring gs-nav-row block px-3 py-3 font-display text-base font-bold text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={group.href}>
                    <details className="group">
                      <summary className="focus-ring gs-nav-row flex cursor-pointer list-none items-center gap-2 px-3 py-3 font-display text-base font-bold text-ink">
                        {link.label}
                        <ChevronDown
                          aria-hidden
                          className="ml-auto h-4 w-4 text-ink-3 transition-transform duration-200 group-open:rotate-180"
                        />
                      </summary>
                      <div className="pb-1">
                        {navSections(group).map((section, index) => (
                          <PanelSection
                            key={section.label ?? 'rows'}
                            section={section}
                            first={index === 0}
                            onPick={() => setSheet(false)}
                          />
                        ))}
                      </div>
                      <PanelFooter row={group.footer} onPick={() => setSheet(false)} />
                    </details>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 border-t border-hairline pt-2">
              <Link href={ctaLink.href} className="focus-ring gs-btn gs-btn-solid gs-btn-sm w-full">
                {ctaLink.label}
              </Link>
            </div>
          </div>
        )}
      </div>

      {search && <QuickSearch onClose={() => setSearch(false)} />}
    </header>
  );
}
