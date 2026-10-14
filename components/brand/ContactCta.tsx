import { ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react';
import { Icon3D } from '@/components/Icon3D';
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
        className="focus-ring edge inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-background shadow-glow transition-transform hover:-translate-y-0.5"
      >
        <whatsapp.Icon aria-hidden className="h-4 w-4" />
        {whatsapp.label}
      </a>
      <a
        href={call.href}
        className="focus-ring edge inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/[0.06] px-5 py-3 font-semibold text-foreground transition-colors hover:bg-white/[0.1]"
      >
        <call.Icon aria-hidden className="h-4 w-4 text-accent" />
        Call {call.label}
      </a>
    </div>
  );
}

/**
 * Full three-channel block for the closing section and the contact page.
 * One panel rather than three matching cards: WhatsApp is the action, the
 * other two are the details a caller might want instead.
 */
export function ContactCta() {
  const [whatsapp, ...others] = channels();

  return (
    <div className="edge rounded-3xl bg-gradient-to-br from-accent/[0.13] via-white/[0.03] to-cyan-400/[0.07] p-6 sm:p-8">
      <div className="grid items-center gap-7 sm:grid-cols-2">
        <a
          href={whatsapp.href}
          target={whatsapp.external ? '_blank' : undefined}
          rel={whatsapp.external ? 'noopener noreferrer' : undefined}
          className="focus-ring group inline-flex cursor-pointer items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-5 text-lg font-semibold text-background shadow-glow-lg transition-transform hover:-translate-y-0.5"
        >
          <whatsapp.Icon aria-hidden className="h-5 w-5" />
          Message us on {whatsapp.label}
        </a>

        <ul className="grid gap-3">
          {others.map(({ key, label, href, Icon }) => (
            <li key={key}>
              <a
                href={href}
                className="focus-ring edge group flex cursor-pointer items-center gap-4 rounded-2xl bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.08]"
              >
                <Icon3D icon={Icon} size="sm" />
                <span className="min-w-0 flex-1 break-all font-mono text-sm text-foreground group-hover:text-accent">
                  {label}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
