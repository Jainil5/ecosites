import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CursorLit } from '@/components/brand/CursorLit';
import { capabilities } from '@/content/brand/capabilities';
import { industries } from '@/content/brand/industries';

const operation = capabilities.find((item) => item.slug === 'business-operations');

/**
 * The operations service, rendered from the capability registry so the band
 * and the /services card can never claim different things. Verticals come
 * from the industry registry: the same system, renamed for the trade.
 */
export function OperationsBand() {
  if (!operation) return null;

  return (
    <section id="operations" className="gs-reveal scroll-mt-32">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div>
          <p className="gs-label">
            <span className="gs-label-hot">→</span> <span aria-hidden>/</span> business operations
          </p>
          <h2 className="gs-display gs-h2 mt-3">
            You run the business.
            <br />
            We run the systems.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-ink-2">{operation.blurb}</p>

          <p className="gs-label mt-8">works for</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {industries.map((industry) => (
              <li
                key={industry.slug}
                className="gs-label border border-hairline px-2.5 py-1.5 text-ink-2"
              >
                {industry.name}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="focus-ring gs-btn gs-btn-solid">
              Tell us what you run daily
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link href="/services#business-operations" className="focus-ring gs-btn gs-btn-ghost">
              What is included
            </Link>
          </div>
        </div>

        <CursorLit>
          <ul className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {operation.examples.map((example, i) => (
              <li key={example} className="gs-lit flex gap-4 bg-canvas p-6">
                <span className="gs-label gs-label-hot shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-ink">{example}</p>
              </li>
            ))}
          </ul>
        </CursorLit>
      </div>
    </section>
  );
}
