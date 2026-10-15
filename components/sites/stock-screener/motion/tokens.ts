// Single source of truth for timing. No component may hardcode a duration.
// CSS mirror of EASE.enter lives in app/globals.css (view-transition rules) — change both together.
export const SPRINGS = {
  /** Price counters — settles ~350ms, no overshoot (prices must never bounce past the true value). */
  number: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 },
  /** Tilt3D while the pointer tracks. */
  tiltFollow: { type: 'spring', stiffness: 120, damping: 14 },
  /** Tilt3D on pointer-leave: snaps back without wobble. */
  tiltReturn: { type: 'spring', stiffness: 300, damping: 25 },
  /** Table row reorder on sort/filter. */
  layout: { type: 'spring', stiffness: 350, damping: 34 },
} as const;

/** framer-motion accepts bezier arrays; the CSS strings live in globals.css (keep them in sync). */
export const EASE = {
  enter: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
} as const;

/** Durations in seconds (framer-motion convention). */
export const DUR = {
  enter: 0.5,
  exit: 0.2,
  fadeLead: 0.18,
  stagger: 0.05,
} as const;

/** Shared-element morph target naming: heatmap cell ⇄ detail hero. */
export const vtName = (symbol: string) => `stock-${symbol.toLowerCase()}`;
