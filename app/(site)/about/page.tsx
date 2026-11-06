import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactCta } from '@/components/brand/ContactCta';
import { PageHeader } from '@/components/brand/PageHeader';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { capabilities } from '@/content/brand/capabilities';
import { processSteps } from '@/content/brand/process';
import { pillars } from '@/content/brand/whyus';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Website & Intelligence is an AI-first tech brand that helps any business, small or large, get an idea online and grow with it — as your tech team, without the cost of building one.',
};

/** What a business already owns, in the three forms the gold line counts. */
const IN_HAND = [
  {
    name: 'The customers you already serve',
    detail:
      'Every enquiry, order, visit and message is a record. Kept properly it tells you what to open next, where to raise the price and who to call back.',
  },
  {
    name: 'The work that repeats',
    detail:
      'The same ten questions on WhatsApp, the same bill every morning, the same report every month. Repeated work is the cheapest thing to hand to a machine.',
  },
  {
    name: 'The idea still in your head',
    detail:
      'A second product, a booking page, an app for the field team, a shop that sells while you sleep. It needs a build, not a department.',
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-24 pt-12 sm:pt-16">
      <PageHeader index="04" label="about" title="An AI-first tech brand that helps businesses grow.">
        Most businesses already hold what they need to grow — the customers they serve, the work
        they repeat, the idea they keep postponing. What they do not hold is the technology to turn
        any of it into growth. So we act as it: websites, mobile applications, AI agents,
        automations, business software and the backend underneath, built and then run for you,
        month to month, whether the business is one person or a thousand.
      </PageHeader>

      {/* The thesis, stated plainly enough to argue with. It is the one line on
          this page set at display size, because it is the claim the rest of the
          page either supports or does not. */}
      <section className="gs-reveal -mx-6 gs-plane-a relative overflow-hidden py-16 sm:py-20">
        <span aria-hidden className="gs-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="gs-label">
            <span className="gs-label-hot">01</span> <span aria-hidden>/</span> what we believe the
            asset is
          </p>
          <h2 className="gs-display gs-h2 mt-4 max-w-4xl">
            Internet and data are the real gold you already have.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
            We manage it and we enhance it. Gold in a drawer is still only metal: the value appears
            when the records are organised, the search is answered, the follow-up happens on time
            and the numbers can be read before the decision has to be made.
          </p>
          <dl className="mt-10 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {IN_HAND.map((item) => (
              <div key={item.name} className="bg-canvas p-5">
                <dt className="gs-display text-base text-ink">{item.name}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-2">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section>
        <SectionIntro index="02" label="what we cover" title="One team, every layer of it.">
          {capabilities.length} capabilities, and the same people build all of them. Nothing below
          is subcontracted, and nothing here is a box we sell — a business takes what it needs and
          adds the rest when there is work for it.
        </SectionIntro>
        <ul className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <li key={capability.slug} className="bg-canvas p-5">
              <p className="gs-display text-base text-ink">{capability.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{capability.blurb}</p>
            </li>
          ))}
          {/* The ninth cell: the list is a menu, not a contract, and the last
              thing a reader needs to know is that an unlisted idea is still a
              brief. It also keeps the grid square. */}
          <li className="bg-plane-deep p-5">
            <p className="gs-display text-base text-ink">Something not on this list</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Most of what shipped here began as a sentence nobody had a box for. Say the sentence.
            </p>
            <Link
              href="/contact"
              className="gs-link mt-4 text-sm"
            >
              Describe the idea
            </Link>
          </li>
        </ul>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-3">
          The cheaper way to read that list: you do not buy a department, an office or a set of
          licences to get this work done. You brief one team, and it already has all of the above.
        </p>
      </section>

      <section>
        <SectionIntro index="03" label="what we believe" title="Five pillars, no decoration.">
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
        <SectionIntro index="04" label="how we work" title="A clear path from idea to impact.">
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
        <SectionIntro index="05" label="next step" title="Tell Us What You Need" />
        <ContactCta />
      </section>
    </div>
  );
}
