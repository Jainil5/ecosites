import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FolderGit2 } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { TiltCard } from '@/components/TiltCard';
import { authors } from '@/content/portfolio/authors';
import { getSitesByAuthor } from '@/content/demos/sites';
import { getWebsitesByAuthor } from '@/content/websites/sites';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: `Work from the ${company.name} builders — data platforms, SaaS and AI-agent systems documented end to end, plus the client sites we shipped.`,
};

export default function PortfolioIndexPage() {
  return (
    <div className="space-y-10 pt-12 sm:pt-16">
      <SectionHeading eyebrow="Portfolio" title="Who builds here">
        Each builder keeps their own page of work: the systems they documented and the client
        sites they shipped, with the stack and the source. Pick a name to see it.
      </SectionHeading>

      <div className="grid gap-4 sm:grid-cols-2">
        {authors.map((author) => {
          const caseStudies = getSitesByAuthor(author.slug);
          const delivered = getWebsitesByAuthor(author.slug);
          const builds = caseStudies.length + delivered.length;
          return (
            <TiltCard key={author.slug} max={4} className="h-full">
              <Link
                href={`/portfolio/${author.slug}`}
                className="focus-ring gs-card gs-card-hover group flex h-full flex-col p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="gs-display text-2xl">{author.name}</h2>
                    <p className="gs-label mt-2">
                      {author.title} · {author.location}
                    </p>
                  </div>
                  <span className="gs-icon gs-icon-sm shrink-0">
                    <FolderGit2 aria-hidden className="h-4 w-4" />
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-2">
                  {author.bio}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
                  <span className="font-label text-xs tracking-widest text-ink-3">
                    {builds} {builds === 1 ? 'build' : 'builds'} shipped
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-label text-sm font-medium text-plane">
                    View work
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
