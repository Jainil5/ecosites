'use client';

import { useEffect, useRef, useState } from 'react';
import { websites } from '@/content/websites/sites';

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

const stats: Stat[] = [
  { value: websites.length, label: 'businesses live right now' },
  { value: websites.length, label: 'industries served' },
  { value: 7, suffix: 'd', label: 'typical time to first draft' },
  { value: 24, suffix: 'h', label: 'maximum time to a reply' },
];

/** Counts 0 → target once the band scrolls into view. Reduced motion: instant. */
function useCountUp(target: number, run: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run]);

  return value;
}

function StatCell({ stat, run }: { stat: Stat; run: boolean }) {
  const value = useCountUp(stat.value, run);
  return (
    <div className="px-6 py-8 text-center sm:py-10">
      <p className="go-stat-value">
        {String(value).padStart(2, '0')}
        {stat.suffix ? <em>{stat.suffix}</em> : null}
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-subtle">
        {stat.label}
      </p>
    </div>
  );
}

/** The thin proof strip under the hero: numbers, not adjectives. */
export function ProofBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 divide-x divide-y divide-white/[0.07] border-y border-white/[0.07] bg-deep/40 sm:grid-cols-4 sm:divide-y-0"
    >
      {stats.map((stat) => (
        <StatCell key={stat.label} stat={stat} run={run} />
      ))}
    </div>
  );
}
