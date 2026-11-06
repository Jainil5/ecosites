'use client';

import { useEffect, useRef, useState } from 'react';

/** Counts 0 → target once `run` turns true. Reduced motion lands on target. */
export function useCountUp(target: number, run: boolean) {
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

/**
 * A registry number that counts up as it scrolls into view. The count is read
 * from the same lists the bands are built from, so the only motion is in
 * getting there — no invented totals.
 */
export function CountUp({
  value,
  suffix,
  pad = false,
}: {
  value: number;
  suffix?: string;
  pad?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRun(true);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shown = useCountUp(value, run);
  const display = pad ? String(run ? shown : value).padStart(2, '0') : String(run ? shown : value);

  return (
    <span ref={ref} data-counted={run ? 'true' : undefined} className="gs-count">
      {display}
      {suffix ? (
        // The unit is not part of the number. At full poster size a green "D"
        // after "07" read as a hex digit, so it takes half the em and sits on
        // the cap line.
        <em className="ml-0.5 text-[0.5em] not-italic text-forest">
          {suffix}
        </em>
      ) : null}
    </span>
  );
}
