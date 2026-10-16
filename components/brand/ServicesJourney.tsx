import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Icon3D } from '@/components/Icon3D';
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
    <section id="services" className="reveal scroll-mt-24">
      <SectionIntro index="02" label="services" title="Get online. Then get ahead.">
        Four steps, taken in order. Most businesses start at step one — and feel
        the difference the same week.
      </SectionIntro>

      {detailed ? (
        <ol className="space-y-5">
          {serviceSteps.map((step, i) => (
            <li
              key={step.key}
              className="plate-in"
              style={{ '--drift': `${1.6 + i * 0.7}rem` } as CSSProperties}
            >
              <div className="edge grid gap-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] sm:p-8">
                <div>
                  <p className="go-label">
                    <b>{String(i + 1).padStart(2, '0')}</b> <i>/</i> {step.key.replace('-', ' ')}
                  </p>
                  <div className="mt-4 flex items-start gap-4">
                    <Icon3D icon={step.Icon} className="pb-4" />
                    <div>
                      <h3 className="font-display text-2xl text-foreground">{step.title}</h3>
                      <p className="mt-1 font-mono text-xs text-accent">{step.tagline}</p>
                    </div>
                  </div>
                </div>
                <dl className="space-y-4 border-t border-white/[0.08] pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-subtle/70">
                      The pain
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-foreground/85">{step.problem}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-subtle/70">
                      What we build
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-foreground/85">{step.build}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-accent/80">
                      What customers notice
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-subtle">{step.notice}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="go-rail space-y-6 lg:space-y-12">
          {serviceSteps.map((step, i) => (
            <li
              key={step.key}
              className="go-step plate-in"
              style={{ '--drift': `${1.8 + i * 0.9}rem` } as CSSProperties}
            >
              <span aria-hidden className="go-node" />
              <div className="go-frame go-step-card edge flex h-full flex-col rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-6 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <Icon3D icon={step.Icon} className="pb-4" />
                  <span aria-hidden className="font-mono text-xs text-subtle/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-display text-xl text-foreground">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-subtle">{step.tagline}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 flex justify-end">
        <Link
          href={detailed ? '/products' : '/services'}
          className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 font-mono text-sm text-accent transition-colors hover:bg-white/[0.1] hover:text-accent-soft"
        >
          {detailed ? 'See the packages' : 'See how each step works'}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
