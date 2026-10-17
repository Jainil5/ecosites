import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { DemoSite } from '@/content/demos/types';
import { ProjectCover } from '@/components/ProjectCover';
import { TiltCard } from '@/components/TiltCard';

interface DemoCardProps {
  site: DemoSite;
}

export function DemoCard({ site }: DemoCardProps) {
  return (
    <TiltCard max={5} className="h-full">
      <Link
        href={`/portfolio/${site.author}/work/${site.slug}`}
        className="gs-card gs-card-hover group focus-ring flex h-full flex-col overflow-hidden"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-hairline bg-canvas">
          {site.screenshot ? (
            <>
              <Image
                src={site.screenshot}
                alt={`Screenshot of ${site.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
              />
              {site.category ? (
                <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 font-label text-[11px] uppercase tracking-widest text-canvas">
                  {site.category}
                </span>
              ) : null}
            </>
          ) : (
            <ProjectCover site={site} />
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="gs-display text-lg">{site.title}</h3>
            <ArrowUpRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest"
            />
          </div>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-2">
            {site.description}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {site.techStack.slice(0, 4).map((tech) => (
              <li
                key={tech}
                className="border border-hairline bg-canvas px-2.5 py-0.5 font-label text-[11px] uppercase tracking-widest text-ink-3"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </TiltCard>
  );
}
