import type { CSSProperties } from 'react';
import { ContactRow } from '@/components/brand/ContactCta';
import { HeroStage } from '@/components/brand/HeroStage';
import { SiteCompiler } from '@/components/brand/SiteCompiler';
import { products } from '@/content/brand/products';
import { serviceSteps } from '@/content/brand/services';
import { websites } from '@/content/websites/sites';

const FACTS = [
  { value: String(websites.length), label: 'client sites live' },
  { value: String(serviceSteps.length), label: 'steps, taken in order' },
  { value: String(products.length), label: 'apps you can run' },
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
 * Metaballs behind the compiler. The filter fuses the blobs where they
 * overlap, so the group reads as one liquid shape that slowly re-divides.
 * Decorative only, and always a sibling of text — never its parent, since
 * the alpha step would eat the glyph edges.
 */
function GooCluster({ className = '' }: { className?: string }) {
  const blobs = [
    {
      left: '1%',
      top: '6%',
      width: '11rem',
      height: '11rem',
      '--bx': '1.6rem',
      '--by': '1.1rem',
      '--dur': '12s',
    } as CSSProperties,
    {
      left: '24%',
      top: '24%',
      width: '9rem',
      height: '9rem',
      background: 'var(--gs-forest)',
      '--bx': '-1.3rem',
      '--by': '1rem',
      '--dur': '14s',
      '--delay': '-4s',
    } as CSSProperties,
    {
      left: '46%',
      top: '2%',
      width: '7.5rem',
      height: '7.5rem',
      '--bx': '1rem',
      '--by': '1.6rem',
      '--dur': '10s',
      '--delay': '-7s',
    } as CSSProperties,
  ];
  return (
    <span aria-hidden className={`gs-goo absolute -inset-10 block ${className}`}>
      {blobs.map((blob, i) => (
        <span key={i} className="gs-blob" style={blob} />
      ))}
    </span>
  );
}

/**
 * The manifesto: poster caps laid over two green planes that separate in
 * depth as the pointer moves, on a visible construction grid. The
 * interactive business-name compiler sits in its own gooey-backed band,
 * because it is the most convincing thing on the site.
 */
export function Hero() {
  return (
    <section className="gs-hero relative -mx-6 overflow-hidden border-b border-hairline bg-canvas">
      <span aria-hidden className="gs-grid" />

      <HeroStage className="relative mx-auto max-w-7xl px-6 pb-16 pt-8 lg:pb-20 lg:pt-10">
        {/* Behind the type: the deep forest plane, then the bright one. */}
        <Plane
          pz={-190}
          dx={16}
          dy={11}
          rot={-2.5}
          delay={140}
          from={{ x: '34vw', r: '9deg' }}
          className="gs-plane-b"
          style={{ top: '6%', right: '2%', width: 'min(38vw, 32rem)', height: 'min(32vw, 27rem)' }}
        />
        <Plane
          pz={-70}
          dx={-32}
          dy={-19}
          rot={3.2}
          from={{ x: '-20vw', y: '-14vh', r: '-11deg' }}
          className="gs-plane-a"
          style={{ top: '30%', right: '22%', width: 'min(25vw, 21rem)', height: 'min(23vw, 19rem)' }}
        />
        {/* The closest plane still sits *behind* the type (negative Z): all the
            motion stays in the background, and the caps always read first. */}
        <Plane
          pz={-30}
          dx={-44}
          dy={-30}
          rot={7}
          delay={260}
          from={{ y: '-22vh', r: '-14deg' }}
          className="gs-plane-a"
          style={{ top: '2%', left: '0%', width: '6.5rem', height: '4.5rem' }}
        />

        <div className="relative grid gap-x-16 gap-y-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-9">
            <p className="gs-label gs-caps-rise">
              <span className="gs-label-hot">01</span> <span aria-hidden>/</span> manifesto
            </p>

            <h1 className="gs-display gs-h2">
              <span className="block gs-caps-rise" style={{ '--d': '120ms' } as CSSProperties}>
                Get online<span className="text-plane">.</span>
              </span>
              <span className="block gs-caps-rise" style={{ '--d': '220ms' } as CSSProperties}>
                Then get ahead<span className="text-plane">.</span>
              </span>
            </h1>

            <p
              className="gs-caps-rise max-w-xl text-lg leading-relaxed text-ink-2"
              style={{ '--d': '380ms' } as CSSProperties}
            >
              You exist offline. Your customers search, compare and book with whoever
              answers first. We get you online — then keep stacking the advantages:
              motion that makes you look established, automation that never forgets,
              AI that answers at 11pm.
            </p>

            <div className="gs-caps-rise" style={{ '--d': '480ms' } as CSSProperties}>
              <ContactRow />
            </div>
          </div>

          <div className="relative">
            <GooCluster className="opacity-80" />
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
              <dt className="gs-display text-3xl text-forest">{fact.value}</dt>
              <dd className="gs-label mt-1 text-ink-3">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </HeroStage>
    </section>
  );
}
