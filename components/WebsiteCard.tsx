import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Layers } from 'lucide-react';
import type { SampleWebsite } from '@/content/websites/types';
import { TiltCard } from '@/components/TiltCard';

interface WebsiteCardProps {
  site: SampleWebsite;
}

function CardBody({ site, external = false }: { site: SampleWebsite; external?: boolean }) {
  return (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-elevated">
        <Image
          src={site.screenshot}
          alt={`Preview of ${site.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-85 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg text-foreground transition-colors group-hover:text-accent">
              {site.title}
            </h3>
            <p className="font-mono text-xs text-subtle">{site.business}</p>
          </div>
          {external ? (
            <ArrowUpRight aria-hidden className="mt-1 h-4 w-4 shrink-0 text-accent" />
          ) : (
            <ArrowUpRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          )}
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-sm text-subtle">{site.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] text-foreground/85"
            style={{ borderColor: `${site.accent}55`, color: site.accent }}
          >
            <Layers aria-hidden className="h-3 w-3" />
            {site.theme}
          </span>
          {site.year ? <span className="font-mono text-[11px] text-subtle">{site.year}</span> : null}
        </div>
      </div>
    </>
  );
}

export function WebsiteCard({ site }: WebsiteCardProps) {
  return (
    <TiltCard className="rounded-2xl" max={8}>
      {site.liveUrl ? (
        <a
          href={site.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group focus-ring flex h-full flex-col overflow-hidden rounded-2xl glass shadow-card transition-shadow hover:shadow-card-hover"
        >
          <CardBody site={site} external />
        </a>
      ) : (
        <Link
          href={site.path}
          className="group focus-ring flex h-full flex-col overflow-hidden rounded-2xl glass shadow-card transition-shadow hover:shadow-card-hover"
        >
          <CardBody site={site} />
        </Link>
      )}
    </TiltCard>
  );
}
