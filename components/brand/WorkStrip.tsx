import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { SiteFrame } from '@/components/brand/SiteFrame';
import { websites } from '@/content/websites/sites';

/**
 * The proof band: the sites that are live right now, shown as themselves.
 * Each frame carries the client's own accent, so the row reads as three
 * different businesses rather than one template three times.
 */
export function WorkStrip() {
  if (websites.length === 0) return null;

  return (
    <section className="reveal">
      <div className="edge beacon rounded-3xl bg-deep/70 p-6 backdrop-blur-sm sm:p-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Client work</p>
            <h2 className="slice mt-2 font-display text-3xl text-foreground sm:text-4xl">
              <span className="slice-scroll">{websites.length} businesses live</span>
            </h2>
          </div>
          <Link
            href="/store"
            className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-background shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Browse the work
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <div className="scene-wide mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {websites.map((site, index) => (
            <div
              key={site.slug}
              className="plate-in"
              style={{ '--drift': `${2.2 + index * 1.1}rem` } as CSSProperties}
            >
              <Link href={site.path} className="focus-ring group block rounded-2xl">
                <span className="relative block">
                  <span
                    aria-hidden
                    className="absolute -inset-3 -z-10 rounded-3xl opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `${site.accent}33` }}
                  />
                  <SiteFrame
                    site={site}
                    sizes="(max-width: 640px) 92vw, 30rem"
                    className="transition-transform duration-300 ease-out group-hover:-translate-y-1.5"
                  />
                </span>
                <span className="mt-4 flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg text-foreground transition-colors group-hover:text-accent">
                    {site.title}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </span>
                <span className="mt-1 block font-mono text-xs text-subtle">{site.business}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
