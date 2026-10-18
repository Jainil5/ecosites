import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ContactCta } from '@/components/brand/ContactCta';
import { PageHeader } from '@/components/brand/PageHeader';
import { ServicesGrid } from '@/components/brand/ServicesGrid';
import { audiences } from '@/content/brand/audiences';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Six capabilities — websites, digital commerce, business software, data and analytics, AI and automation, cloud and integrations — combined into a solution designed around your business.',
};

export default function ServicesPage() {
  return (
    <div className="space-y-20 pt-12 sm:pt-16">
      <PageHeader index="03" label="services" title="The right technology for your next stage.">
        Choose a focused service or combine capabilities into a solution designed around
        your business. Every capability below is something we actually build — the work
        page shows what that looks like.
      </PageHeader>

      <ServicesGrid />

      <section>
        <p className="gs-label mb-6">
          <span className="gs-label-hot">→</span> <span aria-hidden>/</span> which path are you on
        </p>
        <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
          {audiences.map((audience) => (
            <div key={audience.key} className="flex flex-col gap-4 bg-canvas p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="gs-display text-base text-ink">{audience.campaign}</h3>
                <p className="mt-1 text-sm text-ink-2">{audience.name}</p>
              </div>
              <Link
                href={audience.path}
                className="focus-ring gs-btn gs-btn-ghost shrink-0"
              >
                {audience.cta}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="gs-reveal -mx-6 gs-plane-b relative overflow-hidden py-16 sm:py-20">
        <span aria-hidden className="gs-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <PageHeader index="06" label="next step" title="Send one message. We reply the same day.">
            Tell us the business and the problem — we will tell you which of the six
            capabilities you actually need, and what step one looks like.
          </PageHeader>
          <ContactCta />
        </div>
      </section>
    </div>
  );
}
