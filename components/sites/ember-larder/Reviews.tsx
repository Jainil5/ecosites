'use client';

import type { CSSProperties } from 'react';
import { reviews } from './data';
import { Reveal } from './Reveal';

/**
 * The wall by the door. Quotes drift past on a belt and stop when the pointer
 * is on them, so nobody has to chase a moving card to finish reading one.
 */
export function Reviews() {
  const belt = [...reviews, ...reviews];

  return (
    <section id="voices" className="el-band el-voices" aria-label="What people say">
      <div className="el-shell">
        <Reveal>
          <p className="el-kicker">Left on the wall by the door</p>
          <h2 className="el-display el-h2">
            <span className="el-serif el-h2-em">{reviews.length} notes</span>, and the belt keeps bringing them
          </h2>
        </Reveal>
      </div>

      <div className="el-belt" role="group" aria-label="Guest notes, scrolling">
        <div className="el-belt-track">
          {belt.map((r, i) => (
            <figure
              key={`${r.by}-${i}`}
              className="el-quote"
              style={{ '--el-tilt': `${(i % 3) - 1}deg` } as CSSProperties}
            >
              <span aria-hidden className="el-quote-mark">
                ”
              </span>
              <blockquote className="el-serif el-quote-text">{r.quote}</blockquote>
              <figcaption className="el-quote-by">
                <strong>{r.by}</strong>
                <span>{r.from}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="el-shell el-voices-foot">
        <p className="el-voices-count">
          {reviews.length} notes on the wall · the same {reviews.length} come back round on the belt
        </p>
      </div>
    </section>
  );
}
