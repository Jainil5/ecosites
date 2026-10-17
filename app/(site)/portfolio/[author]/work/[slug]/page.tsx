import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Github, CheckCircle2 } from 'lucide-react';
import { getAuthorBySlug } from '@/content/portfolio/authors';
import { getSiteBySlug, sites } from '@/content/demos/sites';

interface CaseStudyPageProps {
  params: Promise<{ author: string; slug: string }>;
}

export function generateStaticParams() {
  return sites.map((site) => ({ author: site.author, slug: site.slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { author, slug } = await params;
  const site = getSiteBySlug(slug);

  if (!site || site.author !== author) {
    return { title: 'Project not found' };
  }

  return {
    title: site.title,
    description: site.description,
    ...(site.screenshot
      ? { openGraph: { title: site.title, description: site.description, images: [site.screenshot] } }
      : {}),
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { author: authorSlug, slug } = await params;
  const site = getSiteBySlug(slug);
  const author = getAuthorBySlug(authorSlug);

  if (!site || !author || site.author !== author.slug) {
    notFound();
  }

  return (
    <article className="space-y-8 pt-12 sm:pt-16">
      <Link
        href={`/portfolio/${author.slug}`}
        className="focus-ring inline-flex w-fit cursor-pointer items-center gap-1.5 rounded font-label text-sm text-ink-2 transition-colors hover:text-forest"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        {author.name}
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {site.category ? (
            <span className="bg-plane px-3 py-1 font-label text-xs uppercase tracking-widest text-ink">
              {site.category}
            </span>
          ) : null}
          {site.period ? <span className="font-label text-xs tracking-widest text-ink-3">{site.period}</span> : null}
          <span className="font-label text-xs tracking-widest text-ink-3">by {author.name}</span>
        </div>
        <h1 className="gs-display gs-h2">{site.title}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{site.description}</p>
      </header>

      {site.screenshot ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-hairline bg-paper">
          <Image
            src={site.screenshot}
            alt={`Screenshot of ${site.title}`}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {site.highlights?.length ? (
        <section>
          <h2 className="gs-display gs-h3">What I built</h2>
          <ul className="mt-4 space-y-3">
            {site.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 leading-relaxed text-ink-2">
                <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="gs-display text-xl">Tech stack</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {site.techStack.map((tech) => (
            <li
              key={tech}
              className="border border-hairline bg-paper px-3 py-1.5 font-label text-sm tracking-wide text-ink-2"
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
            className="focus-ring gs-btn gs-btn-solid"
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
            className="focus-ring gs-btn gs-btn-ghost"
          >
            <Github aria-hidden className="h-4 w-4" />
            Source
          </a>
        ) : null}
      </div>
    </article>
  );
}
