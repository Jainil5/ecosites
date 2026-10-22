import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { WebsiteCard } from '@/components/WebsiteCard';
import { company } from '@/content/brand/company';
import { whatsappHrefMessage } from '@/content/brand/links';
import { products } from '@/content/brand/products';
import { websites } from '@/content/websites/sites';

const orderBook = products[0];
const demo = websites.find((site) => site.path === orderBook.demoPath);

/**
 * The brief's featured-product band. Only shipped features are listed, and
 * the screenshot is the real app, labelled as the live demo it is.
 */
export function ProductFeature() {
  return (
    <section className="gs-reveal -mx-6 gs-plane-a relative overflow-hidden py-16 sm:py-20">
      <span aria-hidden className="gs-grid opacity-20" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="gs-label">
            <span className="gs-label-hot">03</span> <span aria-hidden>/</span> a product by
            website & intelligence
          </p>
          <h2 className="gs-display gs-h2 mt-3">
            Know your orders.
            <br />
            Understand your sales.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-ink-2">
            {orderBook.summary}
          </p>
          <ul className="mt-6 space-y-2">
            {orderBook.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-ink-2">
                <span aria-hidden className="text-lime">+</span>
                {bullet}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="focus-ring gs-btn gs-btn-solid">
              Explore OrderBook
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <a
              href={whatsappHrefMessage(company.contact, 'Request an OrderBook demo')}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring gs-btn gs-btn-ghost"
            >
              <Play aria-hidden className="h-4 w-4" />
              Request a Demo
            </a>
          </div>
        </div>
        {demo ? (
          <div>
            <WebsiteCard site={demo} />
            <p className="gs-label mt-3 text-ink-3">
              live demo — the real app, running in your browser
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
