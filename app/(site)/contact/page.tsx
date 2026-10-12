import type { Metadata } from 'next';
import { ContactCta } from '@/components/brand/ContactCta';
import { SectionHeading } from '@/components/SectionHeading';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Talk to ${company.name} about a website, AI or automation job for your business in ${company.city}.`,
};

export default function ContactPage() {
  return (
    <div className="space-y-10">
      <SectionHeading eyebrow="Contact" title="Tell us what you need">
        WhatsApp is fastest. A call works too, and email is best when you want to send photos or a
        list of what you already have.
      </SectionHeading>

      <ContactCta />

      <p className="max-w-2xl font-mono text-sm text-subtle">
        Serving {company.city} and anywhere a link can reach.
      </p>
    </div>
  );
}
