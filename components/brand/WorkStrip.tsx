import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { websites } from '@/content/websites/sites';

export function WorkStrip() {
  if (websites.length === 0) return null;

  return (
    <section className="rounded-2xl glass p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-display text-4xl text-accent">{websites.length}</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-subtle">
            businesses live
          </p>
        </div>
        <Link
          href="/store"
          className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-background transition-transform hover:-translate-y-0.5"
        >
          Browse the work
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5">
        {websites.map((site) => (
          <li key={site.slug} className="font-mono text-sm text-subtle">
            <span className="text-foreground">{site.title}</span> — {site.business}
          </li>
        ))}
      </ul>
    </section>
  );
}
