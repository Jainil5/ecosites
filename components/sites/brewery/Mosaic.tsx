'use client';

import Image from 'next/image';
import { galleryShots } from './brewery';
import { Reveal } from './Reveal';

/**
 * The room, pinned to a board: shots overlap and sit off-square so the grid
 * never reads as a template gallery. Hover straightens and lifts one.
 */
export function Mosaic() {
  return (
    <section id="room" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="br-display text-[11px] uppercase tracking-[0.26em] text-[var(--br-brass)]">
              The room
            </p>
            <h2 className="br-display mt-3 text-4xl text-[var(--br-ink)] sm:text-5xl">
              Malt on the air and a table by the rail
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--br-muted)]">
            Shot across one ordinary Tuesday, from the first mash to the last round of the night.
          </p>
        </Reveal>

        <div className="br-mosaic mt-12">
          {galleryShots.map((shot, i) => (
            <Reveal
              key={shot.src}
              delay={i * 70}
              className={shot.tall ? 'br-mosaic-tall' : undefined}
            >
              <figure className="br-shot" style={{ ['--tilt' as string]: `${shot.rotate}deg` }}>
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.w}
                  height={shot.h}
                  sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 33vw"
                  className="h-full w-full object-cover"
                />
                <figcaption className="br-shot-caption br-display">
                  <span aria-hidden className="br-shot-dot" />
                  {shot.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
