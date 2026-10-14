import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FolderGit2 } from 'lucide-react';
import { Icon3D } from '@/components/Icon3D';
import { SectionHeading } from '@/components/SectionHeading';
import { TiltCard } from '@/components/TiltCard';
import { authors } from '@/content/portfolio/authors';
import { getSitesByAuthor } from '@/content/demos/sites';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: `Case studies from the ${company.name} builders — data platforms, SaaS and AI-agent systems, each one documented end to end.`,
};

export default function PortfolioIndexPage() {
  return (
    <div className="space-y-10">
      <SectionHeading eyebrow="Portfolio" title="Who builds here">
        Each builder keeps their own page of case studies: what the system had to do, how it was
        built, and the source. Pick a name to see the work.
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2">
        {authors.map((author) => {
          const caseStudies = getSitesByAuthor(author.slug);
          return (
            <TiltCard key={author.slug} max={6} className="rounded-2xl">
              <Link
                href={`/portfolio/${author.slug}`}
                className="focus-ring group flex h-full flex-col rounded-2xl glass p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl text-foreground transition-colors group-hover:text-accent">
                      {author.name}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-accent">
                      {author.title} · {author.location}
                    </p>
                  </div>
                  <Icon3D icon={FolderGit2} size="sm" />
                </div>

                <p className="mt-4 line-clamp-3 flex-1 text-sm text-subtle">{author.bio}</p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-mono text-xs text-subtle">
                    {caseStudies.length} case {caseStudies.length === 1 ? 'study' : 'studies'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-sm text-accent">
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
