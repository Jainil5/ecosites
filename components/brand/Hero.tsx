import type { CSSProperties } from 'react';
import Link from 'next/link';
import { CountUp } from '@/components/brand/CountUp';
import { GlyphScramble } from '@/components/brand/GlyphScramble';
import { HeroStage } from '@/components/brand/HeroStage';
import { OfferNote } from '@/components/brand/OfferBand';
import { SiteCompiler } from '@/components/brand/SiteCompiler';
import { products } from '@/content/brand/products';
import { serviceSteps } from '@/content/brand/services';
import { websites } from '@/content/websites/sites';

const FACTS = [
  { value: websites.length, label: 'sites we built and still run' },
  { value: serviceSteps.length, label: 'steps, taken in order' },
  { value: products.length, label: 'systems in the catalogue' },
];

interface PlaneProps {
  /** Depth on the stage's Z axis. Negative sits behind the type. */
  pz: number;
  /** Pointer drift in px, per unit of pointer offset. */
  dx: number;
  dy: number;
  rot: number;
  delay?: number;
  from?: { x?: string; y?: string; r?: string };
  className?: string;
  style?: CSSProperties;
}

/**
 * One flat cut plane. It carries no content: the type is always the top
 * layer, which is the whole trick in the reference.
 */
function Plane({ pz, dx, dy, rot, delay = 0, from, className = '', style }: PlaneProps) {
  return (
    <span
      aria-hidden
      className={`gs-plane ${className}`}
      style={
        {
          '--pz': `${pz}px`,
          '--dx': dx,
          '--dy': dy,
          '--rot': `${rot}deg`,
          '--d': `${delay}ms`,
          '--from-x': from?.x,
          '--from-y': from?.y,
          '--from-r': from?.r,
          ...style,
        } as CSSProperties
      }
    />
  );
}

/**
 * The manifesto: poster caps laid over two green planes that separate in
 * depth as the pointer moves, on a visible construction grid. The
 * interactive business-name compiler carries its own frame now — the gooey
 * metaball cluster behind it fused a shape nobody needed to explain.
 */
export function Hero() {
  return (
    <section className="gs-hero relative -mx-6 overflow-hidden border-b border-hairline">
      <span aria-hidden className="gs-grid" />

      <HeroStage className="relative mx-auto max-w-7xl px-6 pb-16 pt-8 lg:pb-20 lg:pt-10">
        {/* Behind the type: the deep forest plane, then the bright one. The
            drift and the tilt are roughly half what they were — a plane that
            swings 7deg under the cursor is an effect, and one that leans a
            degree or two is a material. They are laid out for the manifesto
            band they now sit behind, and they stay on the desktop: a tinted
            rectangle crossing body copy on a phone is noise, not depth, and
            the pointer parallax they exist for does not happen there. */}
        <Plane
          pz={-190}
          dx={8}
          dy={6}
          rot={-1.5}
          delay={140}
          from={{ x: '20vw', r: '5deg' }}
          className="gs-plane-b hidden lg:block"
          style={{ top: '0%', left: '30%', width: 'min(32vw, 27rem)', height: 'min(17vw, 14rem)' }}
        />
        <Plane
          pz={-70}
          dx={-16}
          dy={-10}
          rot={1.8}
          from={{ x: '-10vw', y: '-7vh', r: '-6deg' }}
          className="gs-plane-a hidden lg:block"
          style={{ top: '15%', left: '47%', width: 'min(15vw, 12rem)', height: 'min(10vw, 8rem)' }}
        />
        {/* The closest plane still sits *behind* the type (negative Z): all the
            motion stays in the background, and the caps always read first. */}
        <Plane
          pz={-30}
          dx={-22}
          dy={-15}
          rot={3.5}
          delay={260}
          from={{ y: '-11vh', r: '-7deg' }}
          className="gs-plane-a hidden lg:block"
          style={{ top: '22%', left: '2%', width: '6.5rem', height: '4.5rem' }}
        />

        <div className="relative grid gap-x-16 gap-y-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* The manifesto takes the whole stage: the tagline in two phrases,
              each on its own line, at a size derived from the measure. Set
              inside the left column it had no chance — 5.03em of poster caps
              do not fit in 613px, and the lines broke into stacked single
              words. */}
          <div className="lg:col-span-2">
            <p className="gs-label gs-caps-rise">
              <span className="gs-label-hot">ai-first</span> · web · mobile · agents
            </p>

            <h1 className="gs-display gs-hero-title mt-4">
              <span
                className="gs-hero-line block gs-caps-rise"
                style={{ '--d': '120ms' } as CSSProperties}
              >
                <GlyphScramble text="Any Idea," />
              </span>
              <span
                className="gs-hero-line block gs-caps-rise"
                style={{ '--d': '220ms' } as CSSProperties}
              >
                <GlyphScramble text="Online" duration={760} />
                <span className="text-forest">.</span>
              </span>
            </h1>
          </div>

          <div className="space-y-9">
            <p
              className="gs-caps-rise max-w-xl text-lg leading-relaxed text-balance text-ink-2"
              style={{ '--d': '380ms' } as CSSProperties}
            >
              Tell us the idea and it goes online — a website, an app, an agent that answers your
              customers, an automation that runs a process. We work as your tech team, so nobody
              here has to be hired and nothing here has to be bought.
            </p>

            <div className="gs-caps-rise" style={{ '--d': '480ms' } as CSSProperties}>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/contact" className="focus-ring gs-btn gs-btn-solid">
                  Get Started
                </Link>
                <Link href="/demos" className="focus-ring gs-btn gs-btn-ghost">
                  See Our Work
                </Link>
              </div>
              {/* The offer, stated once, in the same weight as the sentence
                  beside it. A discount badge in the hero is retail signage on
                  a page that is trying to be read as a studio. */}
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-pretty text-ink-3">
                Start with what you need today. The plan runs monthly, so the system keeps growing
                with the business.
              </p>
              <OfferNote />
            </div>
          </div>

          <div className="relative">
            <div
              className="gs-caps-rise relative z-10"
              style={{ '--d': '560ms' } as CSSProperties}
            >
              <SiteCompiler />
            </div>
          </div>
        </div>

        {/* What is actually delivered, counted from the same registries the
            bands below are built from — no invented proof numbers. */}
        <dl className="relative mt-14 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
          {FACTS.map((fact) => (
            <div key={fact.label} className="bg-canvas p-4">
              <dt className="gs-display text-3xl text-forest">
                <CountUp value={fact.value} />
              </dt>
              <dd className="gs-label mt-1 text-ink-3">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </HeroStage>
    </section>
  );
}
