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
    <TiltCard className="rounded-2xl" max={8}>
      <Link
        href={`/portfolio/${site.author}/work/${site.slug}`}
        className="group focus-ring flex h-full flex-col overflow-hidden rounded-2xl glass shadow-card transition-shadow hover:shadow-card-hover"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-elevated">
          {site.screenshot ? (
            <>
              <Image
                src={site.screenshot}
                alt={`Screenshot of ${site.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-80 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              {site.category ? (
                <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[11px] text-accent backdrop-blur">
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
            <h3 className="font-display text-lg text-foreground transition-colors group-hover:text-accent">
              {site.title}
            </h3>
            <ArrowUpRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </div>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-subtle">{site.description}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {site.techStack.slice(0, 4).map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-foreground/80"
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
