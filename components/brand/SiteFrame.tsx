import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { SampleWebsite } from '@/content/websites/types';

interface SiteFrameProps {
  site: SampleWebsite;
  /** Above-the-fold frames set this so the LCP image is not lazy-loaded. */
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Decorative frames hide the accessible name and show no caption. */
  decorative?: boolean;
}

/**
 * A delivered site inside a browser frame — the shell's signature device.
 * The address bar shows the in-app route, since that is where the build runs.
 */
export function SiteFrame({
  site,
  priority = false,
  sizes = '(max-width: 1024px) 92vw, 30rem',
  className = '',
  decorative = false,
}: SiteFrameProps) {
  return (
    <div
      className={`frame edge edge-rim ${className}`}
      style={{ '--rim': `${site.accent}77` } as CSSProperties}
      aria-hidden={decorative || undefined}
    >
      <div className="frame-bar">
        <span className="frame-dot bg-red-400/60" />
        <span className="frame-dot bg-amber-300/60" />
        <span className="frame-dot" style={{ background: `${site.accent}cc` }} />
        <span className="frame-url grid place-items-center font-mono text-[9px] leading-none text-subtle">
          {site.path}
        </span>
      </div>
      <div className="relative aspect-[16/10] bg-elevated">
        <Image
          src={site.screenshot}
          alt={decorative ? '' : `Preview of ${site.title}`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
