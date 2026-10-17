import { websites } from '@/content/websites/sites';

/**
 * The client wall under the fold: every delivered site as a wordmark, looping
 * sideways. The track is the list twice because the loop translate is -50%,
 * so the seam never shows. Pure CSS — reduced motion gets a scrollable strip.
 */
export function ClientMarquee() {
  if (websites.length < 2) return null;

  return (
    <section
      aria-label="Businesses we have shipped"
      className="gs-marquee gs-reveal -mx-6 border-y border-hairline bg-paper py-5"
    >
      <div className="gs-marquee-track">
        {websites.map((site) => (
          <span key={site.slug} className="gs-marquee-item">
            {site.title}
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-plane" />
          </span>
        ))}
        {websites.map((site) => (
          <span key={`${site.slug}-loop`} aria-hidden className="gs-marquee-item">
            {site.title}
            <span className="h-1.5 w-1.5 shrink-0 bg-plane" />
          </span>
        ))}
      </div>
    </section>
  );
}
