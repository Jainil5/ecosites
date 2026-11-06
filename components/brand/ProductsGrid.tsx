'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, MessagesSquare, Smartphone } from 'lucide-react';
import { CursorLit } from '@/components/brand/CursorLit';
import { PRODUCT_ICONS } from '@/components/brand/product-icons';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { productGroups, products } from '@/content/brand/products';
import type { Product } from '@/content/brand/types';

/** The tab that shows every shelf, so the page can still be read as one list. */
const ALL = 'all';

/**
 * The catalogue, on shelves. The registry decides what a system is; the group
 * decides which shelf it sits on and how the band above it is worded, so
 * someone looking for an agent and someone looking for a till read two
 * different pages out of one list.
 *
 * A shelf that is declared and empty still reads — the grid says there is
 * nothing to open rather than dropping the category.
 */
const shelves = productGroups.map((group) => ({
  group,
  items: products.filter((p) => p.group === group.id),
}));

/** Every tab the bar draws: the whole catalogue first, then one per shelf. */
const tabs = [
  { id: ALL, label: 'All', count: products.length, href: '#products' },
  ...shelves.map((shelf) => ({
    id: shelf.group.id,
    label: shelf.group.label,
    count: shelf.items.length,
    href: `#${shelf.group.id}`,
  })),
];

/**
 * Which shelf a hash names — the shelf itself, or the shelf holding that
 * card. Anything else (`#offer`, `#products`) is not ours to switch on.
 */
function shelfNamedBy(hash: string): string | null {
  if (productGroups.some((group) => group.id === hash)) return hash;
  return products.find((product) => product.slug === hash)?.group ?? null;
}

/**
 * One card: what the system is, the two halves it ships with, and the way in.
 * Either the running surface or the public build — never both, and never a
 * route that does not exist yet.
 */
function ProductCard({ product }: { product: Product }) {
  const Icon = PRODUCT_ICONS[product.icon];
  return (
    <article
      id={product.slug}
      className="gs-card gs-lit gs-lit-drift flex h-full flex-col scroll-mt-32 p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="gs-icon shrink-0">
          <Icon aria-hidden className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h3 className="gs-display gs-h3">{product.title}</h3>
          <p className="mt-2 leading-relaxed text-ink-2">{product.summary}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5">
        {product.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3 text-sm leading-snug text-ink">
            <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-forest" />
            {bullet}
          </li>
        ))}
      </ul>

      <dl className="mt-6 grid gap-px bg-hairline">
        {product.modules.map((module) => (
          <div key={module.name} className="bg-paper p-4">
            <dt className="gs-label gs-label-hot">{module.name}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink-2">{module.detail}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-7">
        {product.demoPath ? (
          <Link href={product.demoPath} className="focus-ring gs-link group">
            Open it live
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        ) : product.repoUrl ? (
          <a
            href={product.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring gs-link group"
          >
            View the build
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        ) : (
          <Link href="/contact" className="focus-ring gs-link group">
            Ask for a walkthrough
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        )}
        <span className="gs-label">
          {product.demoPath
            ? 'everything shown is our own build — yours is built with your own'
            : product.repoUrl
              ? 'source available on GitHub'
              : 'in build — ask to see it'}
        </span>
      </div>
    </article>
  );
}

/**
 * A shelf the registry declares and nothing sits on. The band still reads,
 * because the category is real and the answer is: not yet.
 */
function EmptyShelf() {
  return (
    <div className="gs-card flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
      <div className="flex items-start gap-4">
        <span className="gs-icon shrink-0">
          <Smartphone aria-hidden className="h-6 w-6" />
        </span>
        <div>
          <h3 className="gs-display gs-h3">Nothing to open yet</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-2">
            No build of ours is published on this shelf, so there is nothing here to click through.
          </p>
        </div>
      </div>
      <Link href="/contact" className="focus-ring gs-btn gs-btn-ghost shrink-0">
        Tell us what you need
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function ProductsGrid({ showHeading = true }: { showHeading?: boolean }) {
  const [active, setActive] = useState<string>(ALL);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // A hash that arrived from the menu, kept until its band is on screen.
  const [target, setTarget] = useState<string | null>(null);

  // The menu points at a card, and a card lives inside a shelf. Resolve the
  // hash to its shelf before anything else happens on the page.
  useEffect(() => {
    const follow = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const shelf = shelfNamedBy(id);
      if (!shelf) return;
      setActive(shelf);
      setTarget(id);
    };
    follow();
    window.addEventListener('hashchange', follow);
    return () => window.removeEventListener('hashchange', follow);
  }, []);

  // The scroll waits for the unfold. In the render where the hash arrives the
  // rest of the catalogue is still on the page, so measuring then lands on a
  // layout that collapses a moment later and leaves the reader somewhere else.
  // The next frame is waited for too: on a same-document jump the browser runs
  // its own fragment scroll after the hashchange handler, against the old
  // positions, and that pass has to be the one that loses.
  useEffect(() => {
    if (!target) return;
    const id = target;
    setTarget(null);
    const jump = () =>
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'auto' });
    jump();
    // Not cancellable: clearing the target re-runs this effect straight away,
    // and a cleanup here would call off the second jump before it happens.
    requestAnimationFrame(jump);
  }, [target, active]);

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  const shown = (id: string) => active === ALL || active === id;

  return (
    <section id="products" className="gs-reveal scroll-mt-24">
      {showHeading ? (
        <SectionIntro index="04" label="products" title="What we build, running — not boxes we sell">
          {products.length} systems on {productGroups.length} shelves: agents that answer out of
          your own data, the software a counter or a desk runs on, the page a customer finds you on,
          the portfolio that carries your name, and one shelf still waiting for its first build.
          Everything shown is our own build — click through the flow before we build yours with your
          items, your market and your own work — tell us the scope and you approve the quote before
          any work starts.
        </SectionIntro>
      ) : null}

      {/* One control per shelf, and the shelf stays a real anchor: without
          JavaScript the bar is still a table of contents that walks the reader
          down the bands. With it, a tab folds the catalogue to one shelf. */}
      <nav aria-label="Product shelves" className="mb-10">
        <div role="tablist" className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <a
              key={tab.id}
              id={`shelf-tab-${tab.id}`}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              aria-selected={active === tab.id}
              aria-controls={tab.id === ALL ? 'products' : tab.id}
              tabIndex={active === tab.id ? 0 : -1}
              href={tab.href}
              onClick={(event) => {
                event.preventDefault();
                setActive(tab.id);
              }}
              onKeyDown={(event) => onKeyDown(event, index)}
              className="focus-ring gs-btn gs-btn-sm gs-btn-ghost gs-tab"
            >
              {tab.label}
              <span className="gs-label gs-tab-count">{String(tab.count).padStart(2, '0')}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-16">
        {shelves.map((shelf) => (
          <div
            key={shelf.group.id}
            id={shelf.group.id}
            role="tabpanel"
            aria-labelledby={`shelf-tab-${shelf.group.id}`}
            hidden={!shown(shelf.group.id)}
            className="scroll-mt-32"
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-4">
              <div className="max-w-2xl">
                <h3 className="gs-display gs-h3">
                  {shelf.group.label}
                  <span className="gs-label ml-3 align-middle text-ink-3">
                    {String(shelf.items.length).padStart(2, '0')} systems
                  </span>
                </h3>
                {shelf.group.blurb ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{shelf.group.blurb}</p>
                ) : null}
              </div>
            </div>
            {shelf.items.length === 0 ? (
              <EmptyShelf />
            ) : (
              <CursorLit className="grid gap-4 lg:grid-cols-2">
                {shelf.items.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </CursorLit>
            )}
          </div>
        ))}
      </div>

      <div className="gs-card mt-4 flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <span className="gs-icon shrink-0">
            <MessagesSquare aria-hidden className="h-6 w-6" />
          </span>
          <div>
            <h3 className="gs-display text-xl">Something else</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-2">
              Not sure what you need? Tell us what hurts in your business and we will say honestly
              whether we can help.
            </p>
          </div>
        </div>
        <Link href="/contact" className="focus-ring gs-btn gs-btn-ghost shrink-0">
          Talk to us
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
