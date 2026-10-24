import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { WhatsAppGlyph } from '@/components/brand/WhatsAppGlyph';
import { company } from '@/content/brand/company';
import { mailtoHref, telHref, whatsappHref } from '@/content/brand/links';

function channels() {
  const { contact } = company;
  return [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: whatsappHref(contact),
      Icon: WhatsAppGlyph,
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
        className="focus-ring gs-btn gs-btn-solid"
      >
        <whatsapp.Icon aria-hidden className="h-4 w-4" />
        {whatsapp.label}
      </a>
      <a href={call.href} className="focus-ring gs-btn gs-btn-ghost">
        <call.Icon aria-hidden className="h-4 w-4" />
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
    <div className="gs-card p-6 sm:p-9">
      <div className="grid items-center gap-8 sm:grid-cols-2">
        <a
          href={whatsapp.href}
          target={whatsapp.external ? '_blank' : undefined}
          rel={whatsapp.external ? 'noopener noreferrer' : undefined}
          className="focus-ring gs-btn gs-btn-solid w-full text-base"
        >
          <whatsapp.Icon aria-hidden className="h-5 w-5" />
          Message us on {whatsapp.label}
        </a>

        <ul className="grid gap-2">
          {others.map(({ key, label, href, Icon }) => (
            <li key={key}>
              <a
                href={href}
                className="focus-ring group flex items-center gap-4 border border-hairline bg-canvas px-4 py-3 transition-colors hover:border-plane"
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0 text-plane" />
                <span className="min-w-0 flex-1 break-all font-label text-xs uppercase tracking-widest text-ink group-hover:text-plane">
                  {label}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-plane"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
