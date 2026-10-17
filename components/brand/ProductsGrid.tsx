import Link from 'next/link';
import { Activity, ArrowRight, ClipboardList, MessagesSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { products } from '@/content/brand/products';
import type { ProductIcon } from '@/content/brand/types';

const ICONS: Record<ProductIcon, LucideIcon> = {
  register: ClipboardList,
  pulse: Activity,
};

/**
 * The product grid: apps a business runs. Each card names both halves of the
 * build and either opens the live app or asks for a walkthrough — never both,
 * and never a route that does not exist yet.
 */
export function ProductsGrid({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section id="products" className="gs-reveal scroll-mt-24">
      {showHeading ? (
        <SectionIntro index="04" label="products" title="Apps you run, not projects you wait for">
          Two products, each with a counter half and a numbers half. Both are built
          to be afforded by one outlet and to still work when you add the second
          branch — tell us the scope and you approve the quote before any work starts.
        </SectionIntro>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((product) => {
          const Icon = ICONS[product.icon];
          return (
            <article
              key={product.slug}
              className="gs-card gs-card-hover flex h-full flex-col p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="gs-icon shrink-0">
                  <Icon aria-hidden className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="gs-display gs-h3">{product.title}</h3>
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
                  <Link
                    href={product.demoPath}
                    className="focus-ring gs-btn gs-btn-solid"
                  >
                    Open it live
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link href="/contact" className="focus-ring gs-btn gs-btn-solid">
                    Ask for a walkthrough
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                )}
                <span className="gs-label">
                  {product.demoPath ? 'running right now' : 'in build — ask to see it'}
                </span>
              </div>
            </article>
          );
        })}
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
