import { SectionIntro } from '@/components/brand/SectionIntro';
import { whyPoints } from '@/content/brand/whyus';

/** Five points, no service-level promises — copy the brief allows. */
export function WhyUs() {
  return (
    <section className="gs-reveal">
      <SectionIntro
        index="07"
        label="why website intelligence"
        title="One partner across the whole stack."
      >
        Web, software, data and AI — under one roof, at the size your business actually needs.
      </SectionIntro>
      <dl className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {whyPoints.map((point, i) => (
          <div key={point.title} className={i === 0 ? 'bg-plane-deep p-6' : 'bg-canvas p-6'}>
            <dt className="gs-display text-base text-ink">{point.title}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-2">{point.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
