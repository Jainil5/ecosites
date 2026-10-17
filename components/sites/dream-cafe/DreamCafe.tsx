'use client';

import { useEffect, useState } from 'react';
import { Hero } from './Hero';
import { MenuBoard } from './MenuBoard';
import { Mosaic } from './Mosaic';
import { Nav } from './Nav';
import { PickYourCup } from './PickYourCup';
import { SiteFooter } from './SiteFooter';
import { Story } from './Story';
import { Ticker } from './Ticker';
import { Visit } from './Visit';

export function DreamCafe() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="dream-cafe min-h-screen">
      <Nav scrolled={scrolled} />
      <main>
        <PickYourCup />
        <Hero />
        <Ticker />
        <MenuBoard />
        <Story />
        <Mosaic />
        <Visit />
      </main>
      <SiteFooter />
    </div>
  );
}
