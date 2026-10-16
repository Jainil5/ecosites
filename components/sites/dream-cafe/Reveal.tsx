'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** `lift` fades and raises; `unfold` hinges the block down like a written board. */
  variant?: 'lift' | 'unfold';
}

/** Fades and lifts children in once they intersect; reveals at once under reduced motion. */
export function Reveal({ children, className = '', delay = 0, variant = 'lift' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-open={String(visible)}
      style={{ transitionDelay: `${delay}ms` }}
      className={
        variant === 'unfold'
          ? `dc-unfold ${className}`
          : `transition-all duration-700 ease-out ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            } ${className}`
      }
    >
      {children}
    </div>
  );
}
