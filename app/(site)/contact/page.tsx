import type { Metadata } from 'next';
import { ContactCta } from '@/components/brand/ContactCta';
import { SectionHeading } from '@/components/SectionHeading';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Talk to ${company.name} about a website, AI or automation job for your business.`,
};

export default function ContactPage() {
  return (
    <div className="space-y-10 pt-12 sm:pt-16">
      <SectionHeading eyebrow="Contact" title="Tell us what you need">
        WhatsApp is fastest. A call works too, and email is best when you want to send photos or a
        list of what you already have.
      </SectionHeading>

      <ContactCta />

      <p className="max-w-2xl text-sm leading-relaxed text-ink-2">
        Work with us from anywhere — everything is delivered over a link.
      </p>
    </div>
  );
}
