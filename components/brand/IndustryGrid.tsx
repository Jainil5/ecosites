import { industries } from '@/content/brand/industries';
import { sites as caseSites } from '@/content/demos/sites';
import { websites } from '@/content/websites/sites';
import type { Proof } from '@/content/brand/proof';

/** The artifact name behind a proof, straight from the delivery registries. */
function proofLabel(proof: Proof): string {
  const site = websites.find((w) => w.path === proof.path);
  if (site) return site.title;
  const demo = caseSites.find((s) => proof.path.endsWith(`/work/${s.slug}`));
  return demo ? demo.title : '';
}

/**
 * The eight verticals the brand sells to. Cards are never links in Phase 1:
 * industry detail pages do not exist yet, and a card that promises a page
 * it cannot open is exactly the dishonesty the registries are built to stop.
 */
export function IndustryGrid() {
  return (
    <ul className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
      {industries.map((industry, i) => {
        const label = industry.proof ? proofLabel(industry.proof) : '';
        return (
          <li key={industry.slug} className="relative overflow-hidden bg-canvas p-6">
            {industry.proof ? (
              <span aria-hidden className="absolute -right-4 -top-4 h-12 w-12 rotate-12 bg-plane/25" />
            ) : (
              <span aria-hidden className="absolute -right-4 -top-4 h-12 w-12 rotate-12 bg-plane/15" />
            )}
            <p className="gs-label text-ink-3">
              {String(i + 1).padStart(2, '0')}
            </p>
            <h3 className="gs-display mt-2 text-base text-ink">{industry.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{industry.blurb}</p>
            <ul className="mt-4 space-y-1.5">
              {industry.deliverables.slice(0, 3).map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink-2">
                  <span aria-hidden className="text-plane">+</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="gs-label mt-5 text-plane">
              {industry.proof ? `proof — ${label}` : 'we build for this vertical'}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
