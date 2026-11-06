import type { Metadata } from 'next';
import Link from 'next/link';
import { ClientGrid } from '@/components/brand/ClientGrid';
import { Hero } from '@/components/brand/Hero';
import { LaunchReel } from '@/components/brand/LaunchReel';
import { OperationsBand } from '@/components/brand/OperationsBand';
import { ProcessBand } from '@/components/brand/ProcessBand';
import { ProductFeature } from '@/components/brand/ProductFeature';
import { ProofBand } from '@/components/brand/ProofBand';
import { ServicesGrid } from '@/components/brand/ServicesGrid';
import { WhyUs } from '@/components/brand/WhyUs';
import { WorkStrip } from '@/components/brand/WorkStrip';
import { company } from '@/content/brand/company';
import { whatsappHrefMessage } from '@/content/brand/links';

export const metadata: Metadata = {
  // No title: the root default from app/layout.tsx is already
  // "Website & Intelligence — <tagline>", and setting one here would push it through the
  // "%s | Website & Intelligence" template and print the brand name twice.
  description: company.pitch,
};

export default function HomePage() {
  return (
    <div className="space-y-28 sm:space-y-36">
      <Hero />

      <ServicesGrid
        heading={{
          index: '02',
          label: 'services',
          title: 'What we build, and what we run.',
          intro:
            'Websites, mobile applications, AI agents and automations, the software and the backend behind them. Choose one service, or let the same team run the whole stack.',
        }}
      />

      <OperationsBand />

      <ProductFeature />

      <ProcessBand />

      <div className="space-y-16">
        <ProofBand />
        <ClientGrid />
        <WorkStrip />
      </div>

      <LaunchReel />

      <WhyUs />

      <section className="gs-reveal -mx-6 gs-plane-b relative overflow-hidden py-16 sm:py-20">
        <span aria-hidden className="gs-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="gs-label">
            <span className="gs-label-hot">07</span> <span aria-hidden>/</span> next step
          </p>
          <h2 className="gs-display gs-h2 mt-3">
            Let&apos;s build what your business needs next.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-ink-2">
            A website, a mobile app, a business system, a dashboard, an agent that answers and
            sells for you — start with a conversation about the problem, and we will tell you what
            it takes. No hiring, no hardware: the team is already here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="focus-ring gs-btn gs-btn-solid">
              Get Started
            </Link>
            <a
              href={whatsappHrefMessage(
                company.contact,
                'Discuss an enterprise project with Website & Intelligence',
              )}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="home-enterprise"
              className="focus-ring gs-btn gs-btn-ghost"
            >
              Discuss an Enterprise Project
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
