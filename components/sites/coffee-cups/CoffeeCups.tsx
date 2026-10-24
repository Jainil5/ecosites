'use client';

import { Feed } from './Feed';
import { Hero } from './Hero';
import { MenuExperience } from './MenuExperience';
import { Mosaic } from './Mosaic';
import { Nav } from './Nav';
import { SiteFooter } from './SiteFooter';
import { Story } from './Story';
import { Testimonials } from './Testimonials';
import { Ticker } from './Ticker';
import { Visit } from './Visit';

/**
 * One scroll, in the order a customer actually decides: the coffee, then what
 * is on it, then what the room's people say, then the pictures, then where.
 */
export function CoffeeCups() {
  return (
    <div className="coffee-cups min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Story />
        <MenuExperience />
        <Testimonials />
        <Feed />
        <Mosaic />
        <Visit />
      </main>
      <SiteFooter />
    </div>
  );
}
