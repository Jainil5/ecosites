import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Icon3D } from '@/components/Icon3D';
import { TiltCard } from '@/components/TiltCard';
import { company } from '@/content/brand/company';
import { mailtoHref, telHref, whatsappHref } from '@/content/brand/links';

function channels() {
  const { contact } = company;
  return [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: whatsappHref(contact),
      Icon: MessageCircle,
      external: true,
    },
    {
      key: 'call',
      label: company.contact.phoneDisplay,
      href: telHref(contact),
      Icon: Phone,
      external: false,
    },
    {
      key: 'email',
      label: company.contact.email,
      href: mailtoHref(contact),
      Icon: Mail,
      external: false,
    },
  ] as const;
}

/** Compact pill row for the hero. */
export function ContactRow() {
  const [whatsapp, call] = channels();
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <a
        href={whatsapp.href}
        target={whatsapp.external ? '_blank' : undefined}
        rel={whatsapp.external ? 'noopener noreferrer' : undefined}
        className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-background shadow-glow transition-transform hover:-translate-y-0.5"
      >
        <whatsapp.Icon aria-hidden className="h-4 w-4" />
        {whatsapp.label}
      </a>
      <a
        href={call.href}
        className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-foreground transition-transform hover:-translate-y-0.5"
      >
        <call.Icon aria-hidden className="h-4 w-4 text-accent" />
        Call {call.label}
      </a>
    </div>
  );
}

/** Full three-channel block for the closing section and the contact page. */
export function ContactCta() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {channels().map(({ key, label, href, Icon, external }) => (
        <TiltCard key={key} max={9} className="rounded-2xl">
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="focus-ring group scene flex cursor-pointer flex-col gap-4 rounded-2xl glass p-5 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <Icon3D icon={Icon} />
            <span className="min-w-0 break-all font-mono text-sm text-foreground group-hover:text-accent">
              {label}
            </span>
          </a>
        </TiltCard>
      ))}
    </div>
  );
}
