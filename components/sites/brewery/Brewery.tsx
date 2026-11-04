'use client';

import { Feed } from './Feed';
import { Hero } from './Hero';
import { MenuExperience } from './MenuExperience';
import { Mosaic } from './Mosaic';
import { Nav } from './Nav';
import { SiteFooter } from './SiteFooter';
import { Story } from './Story';
import { Taps } from './Taps';
import { Testimonials } from './Testimonials';
import { Visit } from './Visit';

/**
 * The section flow is borrowed from a taproom site we like: the landing, then
 * straight into the goods, the story band, the social proof, and the room.
 * The tap wall sits right under the hero because the wall is what people
 * came for; the menu follows, then the story, the feed, the regulars and
 * the room.
 */
export function Brewery() {
  return (
    <div className="brewery min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Taps />
        <MenuExperience />
        <Story />
        <Feed />
        <Testimonials />
        <Mosaic />
        <Visit />
      </main>
      <SiteFooter />
    </div>
  );
}
