'use client';

import { MenuExperience } from './MenuExperience';
import { Nav } from './Nav';
import { SiteFooter } from './SiteFooter';

/**
 * The menu board on its own route. The cart lives in sessionStorage on this
 * origin, so a tray started here survives the trip back to the landing.
 */
export function CafeMenuPage() {
  return (
    <div className="coffee-cups min-h-screen">
      <Nav />
      <main>
        <MenuExperience />
      </main>
      <SiteFooter />
    </div>
  );
}
