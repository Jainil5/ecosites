import Link from 'next/link';
import { ArrowRight, MessagesSquare } from 'lucide-react';
import { CursorLit } from '@/components/brand/CursorLit';
import { OfferBadge } from '@/components/brand/OfferBand';
import { PRODUCT_ICONS } from '@/components/brand/product-icons';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { productGroups, products } from '@/content/brand/products';
import type { Product } from '@/content/brand/types';

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
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="gs-display gs-h3">{product.title}</h3>
            <OfferBadge />
          </div>
          <p className="mt-2 leading-relaxed text-ink-2">{product.summary}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5">
        {product.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3 text-sm leading-snug text-ink">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-plane" />
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

      <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
        {product.demoPath ? (
          <Link href={product.demoPath} className="focus-ring gs-btn gs-btn-solid">
            Open it live
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        ) : product.repoUrl ? (
          <a
            href={product.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring gs-btn gs-btn-solid"
          >
            View the build
            <ArrowRight aria-hidden className="h-4 w-4" />
          </a>
        ) : (
          <Link href="/contact" className="focus-ring gs-btn gs-btn-solid">
            Ask for a walkthrough
            <ArrowRight aria-hidden className="h-4 w-4" />
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
 * The catalogue, on shelves. The registry decides what a system is; the group
 * decides which shelf it sits on and how the band above it is worded, so
 * someone looking for an agent and someone looking for a till read two
 * different pages out of one list.
 */
export function ProductsGrid({ showHeading = true }: { showHeading?: boolean }) {
  // The registry's own order inside each shelf: a group is a filter, not a
  // re-sort, so the counter still leads the software band.
  const shelves = productGroups.map((group) => ({
    group,
    items: products.filter((p) => p.group === group.id),
  }));

  return (
    <section id="products" className="gs-reveal scroll-mt-24">
      {showHeading ? (
        <SectionIntro index="04" label="products" title="What we build, running — not boxes we sell">
          {products.length} systems on {productGroups.length} shelves: agents that answer out of
          your own data, the software a counter or a desk runs on, the page a customer finds you on,
          and the portfolio that carries your name. Everything shown is our own build — click
          through the flow before we build yours with your items, your market and your own work —
          tell us the scope and you approve the quote before any work starts.
        </SectionIntro>
      ) : null}

      <nav aria-label="Product shelves" className="mb-10 flex flex-wrap gap-2">
        {shelves
          .filter((shelf) => shelf.items.length > 0)
          .map((shelf) => (
            <a
              key={shelf.group.id}
              href={`#${shelf.group.id}`}
              className="focus-ring gs-btn gs-btn-sm gs-btn-ghost"
            >
              {shelf.group.label}
              <span className="gs-label text-ink-3">
                {String(shelf.items.length).padStart(2, '0')}
              </span>
            </a>
          ))}
      </nav>

      <div className="space-y-16">
        {shelves.map((shelf) =>
          shelf.items.length === 0 ? null : (
            <div key={shelf.group.id} id={shelf.group.id} className="scroll-mt-32">
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
              <CursorLit className="grid gap-4 lg:grid-cols-2">
                {shelf.items.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </CursorLit>
            </div>
          ),
        )}
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
