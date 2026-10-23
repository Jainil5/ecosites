/**
 * Scroll momentum, shared by the two layers that react to it.
 *
 * `ScrollMotion` writes it from Lenis, `MotionField` reads it inside its own
 * animation loop. A module singleton rather than a CSS variable read-back,
 * because `getComputedStyle` on every canvas frame would force a style recalc
 * of the whole document for one number.
 */
export const scrollState = {
  /** Signed momentum, normalised to -1..1. Always 0 when idle. */
  velocity: 0,
  /** 0..1 down the page. */
  progress: 0,
};
