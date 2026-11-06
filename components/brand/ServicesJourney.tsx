import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { serviceSteps } from '@/content/brand/services';

interface ServicesJourneyProps {
  /** Home shows the four-step teaser; /services shows problem → build → notice. */
  detailed?: boolean;
}

/**
 * The "get online" journey as one visible path — all four steps always on
 * screen, because the order itself is the pitch: website first, everything
 * else builds on it.
 */
export function ServicesJourney({ detailed = false }: ServicesJourneyProps) {
  return (
    <section id="services" className="gs-reveal scroll-mt-24">
      {!detailed && (
        <SectionIntro index="03" label="services" title="Get online. Then get ahead.">
          Four steps, taken in order. Most businesses start at step one — and feel
          the difference the same week.
        </SectionIntro>
      )}

      {detailed ? (
        <ol className="space-y-4">
          {serviceSteps.map((step, i) => (
            <li key={step.key} className="gs-card gs-card-hover grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] sm:p-8">
              <div>
                <p className="gs-label">
                  <span className="gs-label-hot">{String(i + 1).padStart(2, '0')}</span>{' '}
                  <span aria-hidden>/</span> {step.title.toLowerCase()}
                </p>
                <div className="mt-4 flex items-start gap-4">
                  <span className="gs-icon">
                    <step.Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="gs-display gs-h3">{step.service}</h3>
                    <p className="mt-1 font-label text-xs tracking-widest text-forest">
                      {step.tagline}
                    </p>
                  </div>
                </div>
              </div>
              <dl className="space-y-4 border-t border-hairline pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                <div>
                  <dt className="gs-label">the pain</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink">{step.problem}</dd>
                </div>
                <div>
                  <dt className="gs-label">what we build</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink">{step.build}</dd>
                </div>
                <div>
                  <dt className="gs-label gs-label-hot">what customers notice</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-2">{step.notice}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serviceSteps.map((step, i) => (
            <li
              key={step.key}
              className="gs-card gs-card-hover flex h-full flex-col border-t-4 border-t-plane p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="gs-icon gs-icon-sm">
                  <step.Icon aria-hidden className="h-4 w-4" />
                </span>
                <span aria-hidden className="gs-display text-3xl text-ink/25">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="gs-display mt-5 text-xl">{step.service}</h3>
              <p className="gs-label mt-2 text-forest">{step.title}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">{step.tagline}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 flex justify-end">
        <Link
          href={detailed ? '/products' : '/services'}
          className="focus-ring gs-btn gs-btn-ghost"
        >
          {detailed ? 'See the apps we run' : 'See how each step works'}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
