import type { Metadata } from 'next';
import { ContactCta } from '@/components/brand/ContactCta';
import { Hero } from '@/components/brand/Hero';
import { Logo3D } from '@/components/brand/Logo3D';
import { ProductsGrid } from '@/components/brand/ProductsGrid';
import { ProofBand } from '@/components/brand/ProofBand';
import { ServicesJourney } from '@/components/brand/ServicesJourney';
import { WorkStrip } from '@/components/brand/WorkStrip';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  // No title: the root default from app/layout.tsx is already
  // "Website IN — <tagline>", and setting one here would push it through the
  // "%s | Website IN" template and print the brand name twice.
  description: company.pitch,
};

export default function HomePage() {
  return (
    <div className="space-y-28 sm:space-y-36">
      <div className="space-y-10 sm:space-y-14">
        <Hero />
        <ProofBand />
      </div>

      <ServicesJourney />
      <ProductsGrid />
      <WorkStrip />

      <section className="reveal">
        <div className="go-frame-on edge relative overflow-hidden rounded-3xl bg-deep/70 p-7 backdrop-blur-sm sm:p-12">
          <Logo3D className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 opacity-[0.07] sm:h-72 sm:w-72" />
          <div className="relative max-w-2xl">
            <p className="go-label">
              <b>05</b> <i>/</i> next step
            </p>
            <h2 className="slice mt-3 font-display text-3xl text-foreground sm:text-4xl">
              <span className="slice-scroll">Send one message. We reply the same day.</span>
            </h2>
            <p className="mt-3 leading-relaxed text-subtle">
              One WhatsApp message is enough. Tell us the business, we will tell
              you exactly what step one looks like — and when it can be live.
            </p>
            <div className="mt-8">
              <ContactCta />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
