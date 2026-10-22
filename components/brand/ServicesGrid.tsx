import { SectionIntro } from '@/components/brand/SectionIntro';
import { capabilities } from '@/content/brand/capabilities';

/**
 * The six capabilities as a flat register — no per-card link, because
 * `/services/*` detail pages do not exist yet. A card that linked to a
 * missing page is the failure mode the registries exist to prevent.
 */
export function ServicesGrid({
  heading,
}: {
  /** Section header, e.g. '03 / services'. Omit when the page already has one. */
  heading?: { index: string; label: string; title: string; intro?: string };
}) {
  return (
    <section className="gs-reveal">
      {heading ? (
        <SectionIntro index={heading.index} label={heading.label} title={heading.title}>
          {heading.intro}
        </SectionIntro>
      ) : null}
      <div className="gs-fan grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((capability, i) => (
          <article key={capability.slug} className="bg-canvas p-6">
            <p className="gs-label text-ink-3">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="gs-display mt-2 text-base text-ink">{capability.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{capability.blurb}</p>
            <ul className="mt-4 space-y-1.5">
              {capability.examples.map((example) => (
                <li key={example} className="flex gap-2 text-sm text-ink-2">
                  <span aria-hidden className="text-plane">+</span>
                  {example}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
