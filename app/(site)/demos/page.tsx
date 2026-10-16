import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/brand/PageHeader';
import { SiteFrame } from '@/components/brand/SiteFrame';
import { websites } from '@/content/websites/sites';

export const metadata: Metadata = {
  title: 'Demos',
  description:
    'Live sites we have delivered: a salon marketing site with booking, an NSE stock screener with live market data, a restaurant dish guide, and a bagel bakery with a full menu board.',
};

export default function DemosPage() {
  return (
    <div>
      <PageHeader index="04" label="demos" title="Every business below is live.">
        These are not mockups — each one runs right here, with real data behind
        it. Open any of them, click around, and judge the craft yourself.
      </PageHeader>

      <div className="space-y-16">
        {websites.map((site, i) => (
          <article key={site.slug} className="plate-in" style={{ '--drift': `${1.6 + i * 0.8}rem` } as CSSProperties}>
            <div className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
              <Link href={site.path} className="focus-ring group block rounded-2xl">
                <span className="relative block">
                  <span
                    aria-hidden
                    className="absolute -inset-4 -z-10 rounded-3xl opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `${site.accent}33` }}
                  />
                  <SiteFrame
                    site={site}
                    priority={i === 0}
                    sizes="(max-width: 1024px) 92vw, 56rem"
                    className="transition-transform duration-300 ease-out group-hover:-translate-y-1.5"
                  />
                </span>
              </Link>
              <div>
                <p className="go-label">
                  <b>{String(i + 1).padStart(2, '0')}</b> <i>/</i> {site.theme}
                </p>
                <h2 className="mt-3 font-display text-3xl text-foreground">{site.title}</h2>
                <p className="mt-1 font-mono text-xs text-accent">{site.business}</p>
                <p className="mt-4 text-sm leading-relaxed text-subtle">{site.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {site.techStack.map((tech) => (
                    <li key={tech} className="rounded-full border border-white/[0.08] px-2.5 py-0.5 font-mono text-[10px] text-subtle">
                      {tech}
                    </li>
                  ))}
                </ul>
                <Link
                  href={site.path}
                  className="go-cta focus-ring mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-sm font-semibold"
                >
                  Open {site.title}
                  <ArrowUpRight aria-hidden className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
