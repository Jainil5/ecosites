'use client';

import { Feed } from './Feed';
import { Hero } from './Hero';
import { MenuExperience } from './MenuExperience';
import { Mosaic } from './Mosaic';
import { Nav } from './Nav';
import { SiteFooter } from './SiteFooter';
import { Story } from './Story';
import { Testimonials } from './Testimonials';
import { Visit } from './Visit';

/**
 * The section flow is borrowed from summermooncoffee.com: the landing, then
 * straight into the goods, the story band, the social proof, and the room.
 * Menu sits directly under the hero because that is what people come for.
 */
export function CoffeeCups() {
  return (
    <div className="coffee-cups min-h-screen">
      <Nav />
      <main>
        <Hero />
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
