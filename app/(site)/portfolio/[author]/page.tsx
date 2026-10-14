import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Github, Linkedin, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DemoCard } from '@/components/DemoCard';
import { Icon3D } from '@/components/Icon3D';
import { SectionHeading } from '@/components/SectionHeading';
import { getAllAuthorSlugs, getAuthorBySlug } from '@/content/portfolio/authors';
import { getSitesByAuthor } from '@/content/demos/sites';

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

  return (
    <div className="space-y-16">
      <Link
        href="/portfolio"
        className="focus-ring inline-flex w-fit cursor-pointer items-center gap-1.5 rounded font-mono text-sm text-subtle transition-colors hover:text-accent"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        All builders
      </Link>

      <section className="animate-fade-up space-y-5">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          {author.title} · {author.location}
        </p>
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight">
          <span className="text-gradient text-glow">{author.name}</span>
        </h1>
        <p className="max-w-2xl text-lg text-subtle">{author.bio}</p>

        <ul className="flex flex-wrap gap-3">
          {author.links.map((link) => {
            const Icon = LINK_ICONS[link.label] ?? ExternalLink;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring group flex cursor-pointer items-center gap-3 rounded-xl glass py-2 pr-4 pl-2 font-mono text-sm text-foreground transition-colors hover:text-accent"
                >
                  <Icon3D icon={Icon} size="sm" />
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
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-foreground/85"
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
          <p className="font-mono text-sm text-subtle">No case studies published yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((site) => (
              <DemoCard key={site.slug} site={site} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
