'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { larder } from './data';
import { Reveal } from './Reveal';

/**
 * The room and the hearth. Text sticks on the left while the photograph on the
 * right travels through a small scroll range, so the two halves move at
 * different speeds without a second animation layer.
 */
export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);

  return (
    <section id="hearth" className="el-band el-story" aria-label="The hearth">
      <div ref={ref} className="el-shell el-story-grid">
        <div className="el-story-copy">
          <Reveal>
            <p className="el-kicker">Why the room smells like this</p>
            <h2 className="el-display el-h2">
              <span className="el-serif el-h2-em">Three metres</span> of firebrick, built by the
              people who cook on it
            </h2>
            <p className="el-serif el-story-lede">{larder.story}</p>
          </Reveal>

          <Reveal delay={0.09}>
            <ul className="el-notes">
              {larder.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.14}>
            <figure className="el-pull">
              <blockquote className="el-serif">
                “You can’t hide anything from a fire. That is the whole argument for a short menu.”
              </blockquote>
              <figcaption>The kitchen, on why the card stays at eight lines</figcaption>
            </figure>
          </Reveal>
        </div>

        <div className="el-story-media">
          <motion.figure style={{ y: imgY, scale: imgScale }} className="el-story-frame">
            <Image
              src="/ember-larder/story.jpg"
              alt="The hearth at full burn, pans hung above the coals"
              width={1200}
              height={800}
              sizes="(max-width: 900px) 92vw, 46vw"
              className="el-story-img"
            />
            <figcaption className="el-story-cap">
              <span>20:40</span> the second burn, and the lamb goes on
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
