'use client';

import { Feed } from './Feed';
import { Hero } from './Hero';
import { Mosaic } from './Mosaic';
import { Nav } from './Nav';
import { SiteFooter } from './SiteFooter';
import { Story } from './Story';
import { Ticker } from './Ticker';
import { Visit } from './Visit';

export function DreamCafe() {
  return (
    <div className="dream-cafe min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Story />
        <Mosaic />
        <Feed />
        <Visit />
      </main>
      <SiteFooter />
    </div>
  );
}
