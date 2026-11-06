/**
 * The field behind every brand page: one fixed, still layer.
 *
 * This used to pick an animated effect per route — ripple, wave, orbit — and
 * paint a moving 3D mesh under a film loop. The motion was the loudest thing
 * on the page and it never carried information, so the field is calm now: a
 * graphite wash, one soft light, a static horizon grid and grain. What moves
 * on these pages is the content arriving, once.
 */
export function BrandBackground() {
  return (
    <div aria-hidden className="brand-bg">
      <span className="brand-bg-wash" />
      <span className="brand-bg-horizon" />
      <span className="brand-bg-grain" />
    </div>
  );
}
