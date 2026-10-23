import type { CSSProperties } from 'react';
import { CursorLit } from '@/components/brand/CursorLit';
import { LineReveal } from '@/components/brand/LineReveal';
import { capabilities } from '@/content/brand/capabilities';

/** The four surfaces one launch actually touches, in the order they appear. */
const BEAT_SLUGS = ['websites', 'digital-commerce', 'ai-automation', 'data-analytics'] as const;

/** One skeleton line inside a mock: a flat bar, no invented copy. */
function Line({ w = 'w-full', h = 'h-2' }: { w?: string; h?: string }) {
  return <span aria-hidden className={`gs-reel-bar block ${h} ${w}`} />;
}

/**
 * A launch, cut to ten seconds: the site goes up, orders start landing,
 * the assistant answers, and the numbers read back. Every mock is flat planes
 * and hairlines — the same material the rest of the skin is made of.
 */
function Beat({ slug, i }: { slug: (typeof BEAT_SLUGS)[number]; i: number }) {
  const capability = capabilities.find((item) => item.slug === slug);
  if (!capability) return null;
  const seconds = `${i * 2.5}s`;

  return (
    <div
      className="gs-reel-beat border border-hairline bg-canvas p-5 sm:p-7"
      style={{ '--d': seconds } as CSSProperties}
    >
      <p className="gs-label">
        <span className="gs-label-hot">{String(i + 1).padStart(2, '0')}</span>{' '}
        <span aria-hidden>/</span> {capability.slug.replaceAll('-', ' ')}
      </p>
      <h3 className="gs-display mt-2 text-xl text-ink">{capability.name}</h3>

      {slug === 'websites' ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <div className="border border-hairline p-4">
            <span className="gs-reel-fill block h-1.5 w-14" />
            <div className="mt-4 space-y-2.5">
              <Line h="h-5" w="w-3/4" />
              <Line w="w-2/3" />
              <Line w="w-1/2" />
            </div>
            <span className="gs-reel-fill mt-5 block h-7 w-28" />
          </div>
          <div className="grid gap-3">
            <div className="border border-hairline p-4">
              <Line w="w-1/3" />
              <span className="gs-reel-bar mt-3 block h-16 w-full" />
            </div>
            <div className="border border-hairline p-4">
              <Line w="w-1/4" />
              <span className="gs-reel-bar mt-3 block h-10 w-full" />
            </div>
          </div>
        </div>
      ) : null}

      {slug === 'digital-commerce' ? (
        <ul className="mt-5 grid gap-px border border-hairline bg-hairline">
          {[0, 1, 2, 3].map((row) => (
            <li key={row} className="flex items-center gap-4 bg-canvas p-4">
              <span className="gs-reel-bar block h-8 w-8 shrink-0" />
              <span className="min-w-0 flex-1 space-y-2">
                <Line w={row % 2 ? 'w-2/5' : 'w-1/2'} />
                <Line h="h-1.5" w="w-1/5" />
              </span>
              <span
                aria-hidden
                className={
                  row === 0
                    ? 'gs-reel-fill block h-6 w-16 shrink-0'
                    : 'gs-reel-bar block h-6 w-10 shrink-0'
                }
              />
            </li>
          ))}
        </ul>
      ) : null}

      {slug === 'ai-automation' ? (
        <div className="mt-5 space-y-3">
          <div className="ml-auto w-fit max-w-[85%] border border-hairline bg-canvas px-4 py-2.5">
            <Line w="w-40" />
          </div>
          <div className="w-fit max-w-[85%] border border-hairline p-4">
            <div className="space-y-2.5">
              <Line w="w-56" />
              <Line w="w-40" />
            </div>
            <span className="gs-reel-fill mt-4 block h-1.5 w-8" />
          </div>
          <div className="ml-auto w-fit max-w-[85%] border border-hairline bg-canvas px-4 py-2.5">
            <Line w="w-24" />
          </div>
        </div>
      ) : null}

      {slug === 'data-analytics' ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="flex h-32 items-end gap-2">
            {[38, 54, 46, 70, 62, 88, 96].map((height, bar) => (
              <span
                key={bar}
                aria-hidden
                className={bar > 4 ? 'gs-reel-fill block flex-1' : 'gs-reel-bar block flex-1'}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <dl className="grid gap-px border border-hairline bg-hairline sm:w-44">
            {capability.examples.slice(0, 2).map((example) => (
              <div key={example} className="bg-canvas px-4 py-3">
                <dt className="gs-label">{example}</dt>
                <dd className="gs-reel-fill mt-2 block h-2 w-16" />
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

export function LaunchReel() {
  return (
    <section className="gs-reveal">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="gs-label">
            <span className="gs-label-hot">→</span> <span aria-hidden>/</span> what one launch looks like
          </p>
          <h2 className="gs-display gs-h2 mt-3">
            <LineReveal text="Ten seconds, four surfaces." />
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-2">
          The site, the orders, the answers and the numbers — cut from the same build, so
          nothing has to be rekeyed when you add the next outlet.
        </p>
      </div>

      <CursorLit className="mt-8">
        <figure className="gs-card gs-lit p-4 sm:p-6">
        <div className="gs-reel-stack">
          {BEAT_SLUGS.map((slug, i) => (
            <Beat key={slug} slug={slug} i={i} />
          ))}
        </div>
        <span aria-hidden className="gs-reel-track mt-4 block h-px w-full">
          <span aria-hidden className="gs-reel-rail gs-reel-fill block h-px w-full" />
        </span>
          <figcaption className="gs-label mt-3">
            Ten second loop — site, orders, answers, numbers
          </figcaption>
        </figure>
      </CursorLit>
    </section>
  );
}
