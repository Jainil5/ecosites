'use client';

import { useEffect, useRef } from 'react';

/**
 * The footage layer, under the canvas field: a ten-second loop of the same
 * scene MotionField draws in wireframe, so the landing page sits on moving
 * film rather than a flat colour. Built by scripts/brand-reel.sh from three
 * AI-generated keyframes; the clip and its poster are committed, not fetched.
 *
 * Deliberately not self-starting. A muted loop is *allowed* to begin on its
 * own, but starting it in an effect is what lets the motion preference decide
 * first: a visitor who asked for reduced motion never downloads the clip at
 * all and keeps the poster frame, which is the same picture at the loop's
 * zero phase.
 * `preload="metadata"` is the other half of that — first paint is the WebP
 * still, and the ~500 KB of video is only pulled once the element plays.
 *
 * The 480p source exists because this is a background behind frosted glass on
 * phones that share a network with a cash counter: at 854x480 the clip is
 * 210 KB instead of 504 KB and the blur of the glass hides the difference.
 */
export function MotionReel() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    video.play().catch(() => {
      // Blocked by policy or an unsupported codec: the poster is already the
      // right picture, and the canvas field above it animates regardless.
    });
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden
      tabIndex={-1}
      className="brand-bg-reel"
      muted
      loop
      playsInline
      preload="metadata"
      poster="/brand/reel-poster.webp"
    >
      <source media="(max-width: 768px)" srcSet="/brand/reel-480.mp4" type="video/mp4" />
      <source srcSet="/brand/reel.mp4" type="video/mp4" />
    </video>
  );
}
