import { Logo } from '@/components/brand/Logo';
import type { DemoSite } from '@/content/demos/types';

interface ProjectCoverProps {
  site: DemoSite;
}

/**
 * Stands in for a screenshot on case studies that have no capture yet.
 * Deliberately a cover, not a fake UI: a real preview replaces it by setting
 * `screenshot` in content/demos/sites.ts.
 */
export function ProjectCover({ site }: ProjectCoverProps) {
  return (
    <div
      className="flex h-full w-full flex-col justify-between bg-[radial-gradient(120%_120%_at_85%_10%,rgba(34,197,94,0.18),transparent_60%)] p-5"
      role="img"
      aria-label={`${site.title} cover`}
    >
      <Logo className="ml-auto h-16 w-16 text-accent/25" />
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent/70">
        {site.category ?? 'Case study'}
      </p>
    </div>
  );
}
