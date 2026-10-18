import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactCta } from '@/components/brand/ContactCta';
import { PageHeader } from '@/components/brand/PageHeader';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { processSteps } from '@/content/brand/process';
import { pillars } from '@/content/brand/whyus';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Website Intelligence helps businesses grow and operate better through accessible web experiences, useful software, actionable data, and practical AI — at every stage of growth.',
};

export default function AboutPage() {
  return (
    <div className="space-y-24 pt-12 sm:pt-16">
      <PageHeader index="04" label="about" title="Practical digital solutions for businesses at every stage.">
        Our mission is simple: help businesses grow and operate better through accessible
        web experiences, useful software, actionable data, and practical AI. The vision is
        the long version of the same sentence — to be the technology partner a business
        keeps, from getting online for the first time to running intelligent, connected
        operations.
      </PageHeader>

      <section>
        <SectionIntro index="01" label="what we believe" title="Five pillars, no decoration.">
          We are a young company, so we will not pad this page with claims. What we show
          is real: every site, app and build linked from this page was designed and
          shipped here — explore the work rather than take our word for it.
        </SectionIntro>
        <dl className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <div key={pillar.title} className={i === 0 ? 'bg-plane-deep p-6 sm:col-span-2 lg:col-span-1' : 'bg-canvas p-6'}>
              <dt className="gs-display text-base text-ink">{pillar.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-2">{pillar.detail}</dd>
            </div>
          ))}
          <div className="flex items-center bg-canvas p-6">
            <Link href="/demos" className="focus-ring gs-btn gs-btn-solid">
              See the work
            </Link>
          </div>
        </dl>
      </section>

      <section className="max-w-3xl">
        <SectionIntro index="02" label="how we work" title="A clear path from idea to impact.">
          The same four steps run behind every engagement, whether the build is a one-page
          site or a data platform.
        </SectionIntro>
        <ol className="space-y-4">
          {processSteps.map((step, i) => (
            <li key={step.key} className="flex items-baseline gap-4 border-b border-hairline pb-4">
              <span className="gs-label gs-label-hot">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="gs-display text-base text-ink">{step.name}</p>
                <p className="mt-1 text-sm text-ink-2">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionIntro index="03" label="next step" title="Tell Us What You Need" />
        <ContactCta />
      </section>
    </div>
  );
}
