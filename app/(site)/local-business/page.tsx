import type { Metadata } from 'next';
import { ContactCta } from '@/components/brand/ContactCta';
import { GrowBand } from '@/components/brand/GrowBand';
import { IndustryGrid } from '@/components/brand/IndustryGrid';
import { PageHeader } from '@/components/brand/PageHeader';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { ServicesJourney } from '@/components/brand/ServicesJourney';
import { audiences } from '@/content/brand/audiences';

const local = audiences[0];

export const metadata: Metadata = {
  title: 'Local Business',
  description: `${local.pitch} Whether you run a café, salon, boutique, clinic, or local service, we can help you choose a digital solution that fits your business.`,
};

// Only questions the studio can answer truthfully today — no SLA promises.
const faqs: { q: string; a: string }[] = [
  {
    q: 'Will my website work on mobile phones?',
    a: 'Every site we build is mobile-first — phones are where your customers actually search, compare and book.',
  },
  {
    q: 'Can customers contact me through WhatsApp?',
    a: 'Yes. Enquiry and order buttons land straight on your phone, with the first message already written for them.',
  },
  {
    q: 'Can I update content or products myself?',
    a: 'Where you need it. Menus, offers and pages you edit yourself — without a developer in the loop — are part of the automation step.',
  },
  {
    q: 'Can I add online bookings or orders later?',
    a: 'Yes — that is the growth path. Start with a site that gets you found, add enquiries, then orders and the numbers behind them.',
  },
  {
    q: 'Who owns the website and its content?',
    a: 'You do. The domain, the content and the code are yours from day one.',
  },
];

export default function LocalBusinessPage() {
  return (
    <div className="space-y-24 pt-12 sm:pt-16">
      <PageHeader index="02" label="local business" title={local.campaign}>
        {local.pitch} Whether you run a café, salon, boutique, clinic, or local service, we
        can help you choose a digital solution that fits your business — not one size larger
        than you need.
      </PageHeader>

      <section>
        <SectionIntro index="01" label="start here" title="What you can start with">
          Choose the step that matches where the business is today. Each step makes the
          next one worth more — and you can stop at any of them.
        </SectionIntro>
        <ServicesJourney detailed />
        <GrowBand />
      </section>

      <section>
        <SectionIntro index="02" label="industries" title="Built around the way your industry works.">
          Every business has different customers, workflows and priorities. Start with the
          vertical closest to yours and tailor from there.
        </SectionIntro>
        <IndustryGrid />
      </section>

      <section className="max-w-3xl">
        <SectionIntro index="03" label="questions" title="Common questions" />
        <div className="gs-card divide-y divide-hairline">
          {faqs.map((faq) => (
            <details key={faq.q} className="group px-6 py-4">
              <summary className="focus-ring gs-display cursor-pointer list-none text-base text-ink marker:hidden">
                {faq.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <ContactCta />
    </div>
  );
}
