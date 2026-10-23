'use client';

import { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>#*+=-';

/**
 * The poster title decodes on arrival: unlocked characters cycle through a
 * glyph pool while the lock runs left to right. The finished string is what
 * renders first, so server HTML, unhydrated JS and reduced motion all read the
 * heading normally — the scramble is a decoration on top of real text.
 */
export function GlyphScramble({ text, duration = 620 }: { text: string; duration?: number }) {
  const [shown, setShown] = useState(text);
  const frame = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const locked = t * text.length * 1.3;
      setShown(
        text
          .split('')
          .map((ch, i) =>
            i < locked || ch === ' '
              ? ch
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          )
          .join(''),
      );
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [text, duration]);

  return <span className="gs-scramble">{shown}</span>;
}
