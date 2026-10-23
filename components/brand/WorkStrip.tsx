import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { WebsiteCard } from '@/components/WebsiteCard';
import { websites } from '@/content/websites/sites';

/**
 * The proof band on the landing page: the sites that are live right now, as
 * the same cards the work page uses, so nothing is shown twice in two shapes.
 */
export function WorkStrip() {
  if (websites.length === 0) return null;

  return (
    <section className="gs-reveal">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionIntro index="05" label="work" title={`${websites.length} businesses live`} />
        <Link href="/demos" className="focus-ring gs-btn gs-btn-solid mb-10">
          Browse the work
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>

      <div className="gs-fan grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {websites.map((site, i) => (
          <WebsiteCard key={site.slug} site={site} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}
