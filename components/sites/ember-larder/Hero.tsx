'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { larder, ticker } from './data';

/** Printed as three masked lines so the headline lifts into place, one row at a time. */
const headline = ['Everything on', 'this menu has', 'met a fire.'];

/**
 * The landing read is the burn itself: a still room that breathes, coals
 * lifting off the bottom of the frame, and the sentence arriving line by line.
 * Scroll pulls the photograph down slower than the page so the words leave it.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '42%']);
  const copyFade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={sectionRef} id="top" aria-label="The hearth" className="el-hero relative overflow-hidden">
      <motion.div
        style={{ y: imageY }}
        aria-hidden
        className="absolute inset-[-10%]"
      >
        <Image
          src="/ember-larder/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="el-hero-img object-cover object-center"
        />
      </motion.div>
      <div aria-hidden className="el-hero-wash absolute inset-0" />
      <div aria-hidden className="el-hero-grain absolute inset-0" />

      <motion.div
        style={{ y: copyY, opacity: copyFade }}
        className="el-hero-copy relative mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-end px-5 pb-28 pt-36 sm:pb-32"
      >
        <p className="el-kicker">{larder.kicker}</p>

        <h1 className="el-display el-hero-title" aria-label={larder.tagline}>
          {headline.map((line, i) => (
            <span key={line} className="el-mask" aria-hidden>
              <motion.span
                className="el-mask-inner"
                initial={{ y: '108%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.95, delay: 0.12 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.62 }}
          className="el-serif el-hero-intro"
        >
          {larder.intro}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.74 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <a href="#products" className="el-btn el-btn-ember">
            Order the menu
          </a>
          <a href="#set-dinner" className="el-btn el-btn-ghost">
            The set dinner
          </a>
          <a href="#reserve" className="el-hero-link">
            Book a table →
          </a>
        </motion.div>

        <div className="el-stats">
          {larder.stats.map((s, i) => (
            <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} delayMs={i * 90} />
          ))}
        </div>
      </motion.div>

      <div className="el-ticker" aria-hidden>
        <div className="el-ticker-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="el-ticker-run">
              {ticker.map((t) => (
                <span key={t} className="el-ticker-item">
                  {t}
                  <em aria-hidden>✦</em>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface StatProps {
  value: number;
  suffix: string;
  label: string;
  /** Milliseconds before the count starts — the row staggers itself. */
  delayMs: number;
}

/** Count-up that only starts once the row is on screen, and never under reduced motion. */
function Stat({ value, suffix, label, delayMs }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  // No inset margin: the row sits on the fold at load, and a number that waits
  // there for a scroll reads as a zero.
  const inView = useInView(ref, { once: true });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || value === 0) {
      setShown(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const span = 900 + delayMs;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / span);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [inView, value, delayMs]);

  return (
    <div ref={ref} className="el-stat">
      <span className="el-stat-value">
        {shown}
        {suffix ? <span className="el-stat-suffix">{suffix}</span> : null}
      </span>
      <span className="el-stat-label">{label}</span>
    </div>
  );
}
