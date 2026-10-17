import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Github, Linkedin, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DemoCard } from '@/components/DemoCard';
import { WebsiteCard } from '@/components/WebsiteCard';
import { SectionHeading } from '@/components/SectionHeading';
import { getAllAuthorSlugs, getAuthorBySlug } from '@/content/portfolio/authors';
import { getSitesByAuthor } from '@/content/demos/sites';
import { getWebsitesByAuthor } from '@/content/websites/sites';

interface AuthorPageProps {
  params: Promise<{ author: string }>;
}

const LINK_ICONS: Record<string, LucideIcon> = {
  GitHub: Github,
  LinkedIn: Linkedin,
};

export function generateStaticParams() {
  return getAllAuthorSlugs().map((author) => ({ author }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { author: slug } = await params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    return { title: 'Builder not found' };
  }

  return {
    title: `${author.name} — ${author.title}`,
    description: author.bio,
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { author: slug } = await params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const caseStudies = getSitesByAuthor(author.slug);
  const delivered = getWebsitesByAuthor(author.slug);

  return (
    <div className="space-y-16 pt-12 sm:pt-16">
      <Link
        href="/portfolio"
        className="focus-ring inline-flex w-fit cursor-pointer items-center gap-1.5 rounded font-label text-sm text-ink-2 transition-colors hover:text-forest"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        All builders
      </Link>

      <section className="gs-band-rise space-y-5">
        <p className="gs-label gs-label-hot">
          {author.title} · {author.location}
        </p>
        <h1 className="gs-display gs-h2">{author.name}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{author.bio}</p>

        <ul className="flex flex-wrap gap-3">
          {author.links.map((link) => {
            const Icon = LINK_ICONS[link.label] ?? ExternalLink;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring gs-btn gs-btn-ghost group"
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <ul className="flex max-w-3xl flex-wrap gap-2 pt-2">
          {author.stack.map((tech) => (
            <li
              key={tech}
              className="border border-hairline bg-paper px-3 py-1.5 font-label text-xs tracking-wide text-ink-2"
            >
              {tech}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading eyebrow="Case studies" title="Things I have built">
          {caseStudies.length} documented{' '}
          {caseStudies.length === 1 ? 'build' : 'builds'} — data platforms, SaaS and AI-agent
          systems, each with the stack and the source.
        </SectionHeading>

        {caseStudies.length === 0 ? (
          <p className="text-sm text-ink-2">No case studies published yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((site) => (
              <DemoCard key={site.slug} site={site} />
            ))}
          </div>
        )}
      </section>

      {delivered.length > 0 && (
        <section>
          <SectionHeading eyebrow="Client work" title="Sites running right now">
            {delivered.length} {delivered.length === 1 ? 'business' : 'businesses'} shipped as
            delivered work — each one opens live, with its own theme and its own data behind it.
          </SectionHeading>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {delivered.map((site, i) => (
              <WebsiteCard key={site.slug} site={site} priority={i === 0} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
