/**
 * The metaball filter the gooey layers reference by id (`filter: url(#gs-goo)`).
 * Blur then step the alpha: overlapping blobs fuse where they meet. Mounted
 * once in the site layout, because a url() reference cannot cross documents
 * and a second copy in the DOM would just shadow the first.
 */
export function GooDefs() {
  return (
    <svg aria-hidden focusable="false" className="absolute h-0 w-0">
      <defs>
        <filter id="gs-goo" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"
          />
        </filter>
      </defs>
    </svg>
  );
}
