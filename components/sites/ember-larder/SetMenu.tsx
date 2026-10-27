'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { setMenu } from './data';
import { Reveal } from './Reveal';

/**
 * The set dinner reads as one burn: five courses on a line, and the line
 * itself is drawn as the band scrolls past, so the sequence has a direction.
 */
export function SetMenu() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const draw = useSpring(scrollYProgress, { stiffness: 60, damping: 22, mass: 0.6 });

  return (
    <section id="set-dinner" className="el-band el-set" aria-label="The set dinner">
      <div className="el-shell">
        <div className="el-set-head">
          <Reveal>
            <p className="el-kicker">One price, the whole fire</p>
            <h2 className="el-display el-h2">{setMenu.name}</h2>
            <p className="el-serif el-set-blurb">{setMenu.blurb}</p>
          </Reveal>
          <Reveal delay={0.12} className="el-set-price-card">
            <p className="el-set-price">{setMenu.price}</p>
            <p className="el-set-per">{setMenu.per}</p>
            <a href="#reserve" className="el-btn el-btn-ember">
              Book the long table
            </a>
          </Reveal>
        </div>

        <div ref={ref} className="el-courses">
          <motion.span aria-hidden className="el-courses-line" style={{ scaleY: draw }} />
          <ol className="el-course-list">
            {setMenu.courses.map((c, i) => (
              <li key={c.label} className="el-course">
                <Reveal delay={i * 0.07}>
                  <span className="el-course-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="el-course-when">{c.label}</span>
                  <p className="el-serif el-course-text">{c.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
