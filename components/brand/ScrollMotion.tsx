'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { scrollState } from './scroll-state';

const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Pixels-per-frame that counts as a full fling (about 24k px/s, so a hard
 * trackpad throw reaches 1 and an ordinary wheel sits around 0.25). Lenis
 * reports raw velocity, so dividing by this maps it to -1..1 — every CSS
 * effect then scales against a named ceiling instead of an arbitrary
 * multiplier, and no amount of scrolling can push a transform past its
 * designed amplitude.
 */
const FLING = 400;

/**
 * Lenis smooth scroll for the brand pages, plus the one number set every
 * scroll effect reads.
 *
 * The library is only the floor; what it buys us is a per-frame velocity and
 * progress we can publish as custom properties:
 *
 *   --scroll-v   signed momentum (-1..1), decays to 0 when the page settles
 *   --scroll-p   0..1 page progress, drawn as the hairline rail
 *   --hero-rec   how far the hero has travelled out of its own height
 *
 * `respectReducedMotion` keeps Lenis itself inert for those users, and the two
 * momentum values are pinned at zero so nothing downstream moves either.
 * Scroll-to-anchor links are handled by Lenis (`anchors: true`), which
 * is why globals.css turns native `scroll-behavior: smooth` off while `html`
 * carries the `lenis` class — the two would compound into a double-eased jump.
 */
export function ScrollMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.085,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.4,
      stopInertiaOnNavigate: true,
      allowNestedScroll: true,
      respectReducedMotion: true,
    });

    // The hero only exists on the landing page, and brand pages mount and
    // unmount without remounting this layout — so re-lookup once it is gone.
    let hero: HTMLElement | null = null;
    const heroHeight = () => {
      if (!hero || !hero.isConnected) hero = document.querySelector<HTMLElement>('.gs-hero');
      return hero ? hero.offsetHeight * 0.8 : 0;
    };

    let idle: ReturnType<typeof setTimeout> | null = null;

    const publish = () => {
      const inert = lenis.prefersReducedMotion;
      const velocity = inert ? 0 : clamp(-1, lenis.velocity / FLING, 1);
      // Progress is a readout rather than motion, so it stays live either way.
      const progress = clamp(0, lenis.progress, 1);
      const seat = heroHeight();
      const recede = inert || seat === 0 ? 0 : clamp(0, lenis.scroll / seat, 1);

      scrollState.velocity = velocity;
      scrollState.progress = progress;
      root.style.setProperty('--scroll-v', velocity.toFixed(3));
      root.style.setProperty('--scroll-p', progress.toFixed(4));
      root.style.setProperty('--hero-rec', recede.toFixed(3));

      // A stopped page has no momentum. Lenis can settle without a final
      // zero-velocity event, so clear the warp ourselves once it goes quiet.
      if (idle) clearTimeout(idle);
      if (velocity !== 0) {
        idle = setTimeout(() => {
          scrollState.velocity = 0;
          root.style.setProperty('--scroll-v', '0.000');
        }, 180);
      }
    };

    lenis.on('scroll', publish);
    publish();

    return () => {
      if (idle) clearTimeout(idle);
      lenis.destroy();
      root.style.removeProperty('--scroll-v');
      root.style.removeProperty('--scroll-p');
      root.style.removeProperty('--hero-rec');
      scrollState.velocity = 0;
      scrollState.progress = 0;
    };
  }, []);

  return <div aria-hidden className="scroll-rail" />;
}
