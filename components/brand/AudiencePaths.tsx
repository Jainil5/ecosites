import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { audiences } from '@/content/brand/audiences';

/**
 * The split that organises everything else: one card per audience, each
 * carrying its own campaign line and CTA. The persistent audience code —
 * local on plane green, enterprise on forest — makes the split legible
 * before any reading.
 */
export function AudiencePaths() {
  return (
    <section className="gs-reveal">
      <SectionIntro index="02" label="choose your path" title="Two ways in. Pick the one that is you.">
        The right first step for a shop is not the right first step for a company buying
        a platform. Start where you are.
      </SectionIntro>
      <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
        {audiences.map((audience) => (
          <article
            key={audience.key}
            className={`flex flex-col p-8 sm:p-10 ${
              audience.key === 'local' ? 'bg-plane text-ink' : 'bg-forest text-canvas'
            }`}
          >
            <p className={`gs-label ${audience.key === 'local' ? 'text-forest' : 'text-lime'}`}>
              for {audience.name.toLowerCase()}
            </p>
            <h3 className={`gs-display gs-h3 mt-3 ${audience.key === 'local' ? '' : 'text-canvas'}`}>
              {audience.campaign}
            </h3>
            <p className="mt-4 flex-1 leading-relaxed opacity-90">{audience.pitch}</p>
            <Link
              href={audience.path}
              className={`focus-ring gs-btn mt-8 self-start ${
                audience.key === 'local' ? 'gs-btn-solid' : 'gs-btn-ghost !border-canvas !text-canvas'
              }`}
            >
              {audience.cta}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
