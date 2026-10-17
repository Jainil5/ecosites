import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Layers } from 'lucide-react';
import type { SampleWebsite } from '@/content/websites/types';
import { TiltCard } from '@/components/TiltCard';

interface WebsiteCardProps {
  site: SampleWebsite;
  /** Set for the above-the-fold card so Lighthouse stops flagging the LCP image. */
  priority?: boolean;
}

function CardBody({
  site,
  external = false,
  priority = false,
}: {
  site: SampleWebsite;
  external?: boolean;
  priority?: boolean;
}) {
  return (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-hairline bg-canvas">
        <Image
          src={site.screenshot}
          alt={`Preview of ${site.title}`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="gs-display text-lg">{site.title}</h3>
            <p className="gs-label mt-1">{site.business}</p>
          </div>
          {external ? (
            <ArrowUpRight aria-hidden className="mt-1 h-4 w-4 shrink-0 text-forest" />
          ) : (
            <ArrowUpRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest"
            />
          )}
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-2">
          {site.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 border px-2.5 py-1 font-label text-[11px] uppercase tracking-widest"
            style={{ borderColor: `${site.accent}66`, color: site.accent }}
          >
            <Layers aria-hidden className="h-3 w-3" />
            {site.theme}
          </span>
          {site.year ? (
            <span className="font-label text-[11px] tracking-widest text-ink-3">{site.year}</span>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function WebsiteCard({ site, priority = false }: WebsiteCardProps) {
  const className = 'gs-card gs-card-hover group focus-ring flex h-full flex-col overflow-hidden';
  return (
    <TiltCard max={5} className="h-full">
      {site.liveUrl ? (
        <a
          href={site.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          <CardBody site={site} external priority={priority} />
        </a>
      ) : (
        <Link href={site.path} className={className}>
          <CardBody site={site} priority={priority} />
        </Link>
      )}
    </TiltCard>
  );
}
