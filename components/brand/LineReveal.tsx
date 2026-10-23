'use client';

import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * Word-by-word heading rise. The trigger is an IntersectionObserver and the
 * stagger is a transition delay, not a scroll-timeline range: a range that
 * starts after a short heading has finished entering would leave the later
 * words stuck at opacity 0.
 */
export function LineReveal({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} data-shown={shown ? 'true' : undefined} className={`gs-line ${className}`}>
      {text.split(' ').map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span style={{ '--i': i } as CSSProperties}>{word}</span>{' '}
        </Fragment>
      ))}
    </span>
  );
}
