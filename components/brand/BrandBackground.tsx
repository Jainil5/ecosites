'use client';

import { usePathname } from 'next/navigation';

export type BrandEffect = 'ripple' | 'wave' | 'orbit';

/**
 * Route → effect. The glass theme is constant; only the moving field
 * changes per page. Unknown routes (including nested portfolio pages)
 * fall back to the home effect.
 */
const ROUTE_EFFECTS: Record<string, BrandEffect> = {
  '/': 'ripple',
  '/about': 'orbit',
  '/services': 'wave',
  '/products': 'orbit',
  '/enterprise': 'wave',
  '/local-business': 'ripple',
  '/demos': 'wave',
  '/store': 'orbit',
  '/portfolio': 'ripple',
  '/contact': 'wave',
};

export function BrandBackground() {
  const pathname = usePathname();
  const effect = ROUTE_EFFECTS[pathname] ?? 'ripple';

  return (
    <div aria-hidden className="brand-bg" data-effect={effect}>
      <span className="brand-bg-layer brand-bg-ripple" />
      <span className="brand-bg-layer brand-bg-wave" />
      <span className="brand-bg-layer brand-bg-orbit">
        <span className="brand-bg-orbit-ring">
          <span className="brand-bg-orbit-glow brand-bg-orbit-glow-a" />
          <span className="brand-bg-orbit-glow brand-bg-orbit-glow-b" />
        </span>
      </span>
    </div>
  );
}
