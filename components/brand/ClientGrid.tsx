import Link from 'next/link';
import { websites } from '@/content/websites/sites';

/**
 * The client wall under the fold: every delivered site as a nameplate, in the
 * client's own colour. It used to loop sideways, which is the one trick that
 * makes an agency page read as a shopfront — a wall you can actually read is
 * the same proof without the motion. Reduced motion needs no special case
 * because nothing moves.
 */
export function ClientGrid() {
  if (websites.length < 2) return null;

  return (
    <section
      aria-label="Businesses we have shipped"
      className="gs-reveal -mx-6 border-y border-hairline bg-paper py-10"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="gs-label">
          <span className="gs-label-hot">→</span> <span aria-hidden>/</span> shipped and still
          running
        </p>
        <ul className="mt-6 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
          {websites.map((site) => (
            <li key={site.slug} className="border-b border-hairline">
              <Link href={site.path} className="focus-ring group flex items-center gap-3 py-3.5">
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 transition-transform duration-300 group-hover:scale-125"
                  style={{ background: site.accent }}
                />
                <span className="min-w-0 truncate font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink-2 transition-colors duration-300 group-hover:text-ink">
                  {site.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
