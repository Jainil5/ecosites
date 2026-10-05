import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Github, CheckCircle2 } from 'lucide-react';
import { getAllSlugs, getSiteBySlug } from '@/content/demos/sites';

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = getSiteBySlug(slug);

  if (!site) {
    return { title: 'Project not found' };
  }

  return {
    title: site.title,
    description: site.description,
    openGraph: {
      title: site.title,
      description: site.description,
      images: [site.screenshot],
    },
  };
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const site = getSiteBySlug(slug);

  if (!site) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <Link
        href="/portfolio/demos"
        className="focus-ring inline-flex w-fit cursor-pointer items-center gap-1.5 rounded font-mono text-sm text-subtle transition-colors hover:text-accent"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        All projects
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {site.category ? (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
              {site.category}
            </span>
          ) : null}
          {site.period ? <span className="font-mono text-xs text-subtle">{site.period}</span> : null}
        </div>
        <h1 className="font-display text-4xl text-foreground">{site.title}</h1>
        <p className="max-w-2xl text-lg text-subtle">{site.description}</p>
      </header>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl glass shadow-card">
        <Image
          src={site.screenshot}
          alt={`Screenshot of ${site.title}`}
          fill
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
          priority
        />
      </div>

      {site.highlights?.length ? (
        <section>
          <h2 className="font-display text-2xl text-foreground">What I built</h2>
          <ul className="mt-4 space-y-3">
            {site.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-subtle">
                <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-xl text-foreground">Tech stack</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {site.techStack.map((tech) => (
            <li
              key={tech}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-foreground/85"
            >
              {tech}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-4">
        {site.liveUrl ? (
          <a
            href={site.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-background shadow-glow transition-transform hover:-translate-y-0.5 hover:bg-accent-soft"
          >
            <ExternalLink aria-hidden className="h-4 w-4" />
            View project
          </a>
        ) : null}
        {site.repo ? (
          <a
            href={site.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            <Github aria-hidden className="h-4 w-4 text-accent" />
            Source
          </a>
        ) : null}
      </div>
    </article>
  );
}
