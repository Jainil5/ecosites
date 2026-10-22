import { SectionIntro } from '@/components/brand/SectionIntro';
import { processSteps } from '@/content/brand/process';

/** Four flat planes, mono indices — the same arc behind every engagement. */
export function ProcessBand() {
  return (
    <section className="gs-reveal">
      <SectionIntro index="04" label="how we work" title="A clear path from idea to impact." />
      <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((step, i) => (
          <div key={step.key} className="relative overflow-hidden bg-canvas p-6">
            <span
              aria-hidden
              className={`absolute -right-5 -top-5 h-14 w-14 rotate-12 ${i % 2 ? 'bg-plane/15' : 'bg-plane/25'}`}
            />
            <p className="gs-label">
              <span className="gs-label-hot">{String(i + 1).padStart(2, '0')}</span>
            </p>
            <h3 className="gs-display mt-2 text-base text-ink">{step.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
