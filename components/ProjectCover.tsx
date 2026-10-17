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
      className="gs-plane-a flex h-full w-full flex-col justify-between p-5"
      role="img"
      aria-label={`${site.title} cover`}
    >
      <Logo className="ml-auto h-16 w-16 text-ink/25" />
      <p className="gs-label text-ink/70">{site.category ?? 'Case study'}</p>
    </div>
  );
}
