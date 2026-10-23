import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ContactCta } from '@/components/brand/ContactCta';
import { PageHeader } from '@/components/brand/PageHeader';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { audiences } from '@/content/brand/audiences';
import { company } from '@/content/brand/company';
import { whatsappHrefMessage } from '@/content/brand/links';
import { engagement, solutions } from '@/content/brand/solutions';

const enterprise = audiences[1];

export const metadata: Metadata = {
  title: 'Enterprise',
  description: `${enterprise.pitch} From a focused internal tool to a larger digital platform, we begin with your business problem and design a solution around it.`,
};

const proofCta: Record<'case' | 'product' | 'site' | 'work', string> = {
  case: 'See the build',
  product: 'Open the live app',
  site: 'See the delivered site',
  work: 'See what is live',
};

export default function EnterprisePage() {
  return (
    <div className="space-y-24 pt-12 sm:pt-16">
      <PageHeader index="03" label="enterprise & growing" title="Build better systems. Make smarter decisions.">
        {enterprise.pitch} From a focused internal tool to a larger digital platform, we
        begin with your business problem and design a solution around it.
      </PageHeader>

      <section id="capabilities">
        <SectionIntro index="01" label="capabilities" title="Enterprise capabilities">
          Every capability below sits beside the artifact that shows it — a build or a
          live app, not an adjective.
        </SectionIntro>
        <div className="grid gap-px border border-hairline bg-hairline lg:grid-cols-2">
          {solutions.map((solution, i) => (
            <article key={solution.slug} className="flex flex-col bg-canvas p-6 sm:p-8">
              <p className="gs-label">
                <span className="gs-label-hot">{String(i + 1).padStart(2, '0')}</span>
              </p>
              <h3 className="gs-display gs-h3 mt-2 text-ink">{solution.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{solution.blurb}</p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {solution.builds.map((build) => (
                  <li key={build} className="flex gap-2 text-sm text-ink-2">
                    <span aria-hidden className="text-plane">+</span>
                    {build}
                  </li>
                ))}
              </ul>
              <Link
                href={solution.proof.path}
                className="focus-ring gs-label mt-6 inline-flex items-center gap-1.5 text-plane hover:underline"
              >
                {proofCta[solution.proof.kind]}
                <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-3xl">
        <SectionIntro index="02" label="engagement" title="How an engagement runs">
          Same shape at every scale — what changes is the depth of each step, not the order.
        </SectionIntro>
        <ol className="space-y-4">
          {engagement.map((step, i) => (
            <li key={step} className="flex items-baseline gap-4 border-b border-hairline pb-4">
              <span className="gs-label-hot gs-label">{String(i + 1).padStart(2, '0')}</span>
              <span className="gs-display text-base text-ink">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionIntro index="03" label="next step" title="Tell us the problem, not the spec.">
          A discovery call is enough to find out whether the project fits.
        </SectionIntro>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <ContactCta />
          <a
            href={whatsappHrefMessage(
              company.contact,
              'Discuss an enterprise project with Website & Intelligence',
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring gs-btn gs-btn-ghost"
          >
            {enterprise.cta}
          </a>
        </div>
      </section>
    </div>
  );
}
