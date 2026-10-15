export function navigateWithViewTransition(push: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof doc.startViewTransition === 'function' && !reduced) {
    doc.startViewTransition(push);
  } else {
    push();
  }
}
