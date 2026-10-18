import type { Metadata } from 'next';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { ContactCta } from '@/components/brand/ContactCta';
import { SectionHeading } from '@/components/SectionHeading';
import { company } from '@/content/brand/company';
import { whatsappHref, whatsappHrefMessage } from '@/content/brand/links';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Talk to ${company.name} about a website, AI or automation job for your business.`,
};

// Same enterprise message the enterprise page sends.
const ENTERPRISE_MESSAGE = 'Discuss an enterprise project with Website Intelligence';

const enquiries = [
  {
    key: 'local',
    question: 'Local business?',
    detail: 'Tell us the business name, where you are, and what you want customers to be able to do.',
    label: 'Message us about a website',
  },
  {
    key: 'enterprise',
    question: 'Enterprise project?',
    detail: 'Send the problem you want solved and who it affects. We start from the need, not a package.',
    label: 'Message us about a system',
  },
] as const;

export default function ContactPage() {
  const { contact } = company;

  return (
    <div className="space-y-10 pt-12 sm:pt-16">
      <SectionHeading eyebrow="Contact" title="Tell us what you need">
        WhatsApp is fastest. A call works too, and email is best when you want to send photos or a
        list of what you already have.
      </SectionHeading>

      <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
        {enquiries.map((row) => (
          <a
            key={row.key}
            href={
              row.key === 'local'
                ? whatsappHref(contact)
                : whatsappHrefMessage(contact, ENTERPRISE_MESSAGE)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring group flex flex-col bg-canvas p-6 transition-colors hover:bg-plane/20 sm:p-8"
          >
            <p className="gs-display gs-h3">{row.question}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">{row.detail}</p>
            <p className="mt-5 inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-forest">
              <MessageCircle aria-hidden className="h-4 w-4" />
              {row.label}
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </p>
          </a>
        ))}
      </div>

      <ContactCta />

      <p className="max-w-2xl text-sm leading-relaxed text-ink-2">
        Work with us from anywhere — everything is delivered over a link.
      </p>
    </div>
  );
}
