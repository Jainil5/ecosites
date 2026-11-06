import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { WhatsAppGlyph } from '@/components/brand/WhatsAppGlyph';
import { company } from '@/content/brand/company';
import { intents } from '@/content/brand/intents';
import { mailtoHref, mailtoHrefMessage, telHref, whatsappHref, whatsappHrefMessage } from '@/content/brand/links';

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
        data-cta="hero"
        className="focus-ring gs-btn gs-btn-solid"
      >
        <whatsapp.Icon aria-hidden className="h-4 w-4" />
        {whatsapp.label}
      </a>
      <a href={call.href} data-cta="hero-call" className="focus-ring gs-btn gs-btn-ghost">
        <call.Icon aria-hidden className="h-4 w-4" />
        Call {call.label}
      </a>
    </div>
  );
}

/**
 * The reasons for reaching out, each with both channels attached.
 *
 * One "Message us" button makes a visitor write the opening line from scratch,
 * which is the part people stall on. Here the ask is already chosen and
 * already worded: the chat opens with the sentence the button promised, the
 * mail opens with the same sentence in the subject, and the number the chat
 * goes to is printed under the row so nobody has to trust that a button
 * leads somewhere real.
 */
export function IntentGrid() {
  const { contact } = company;

  return (
    <div className="mt-8 border-t border-hairline pt-8">
      <p className="gs-label">
        <span className="gs-label-hot">→</span> <span aria-hidden>/</span> or say what you came for
      </p>
      <ul className="mt-5 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
        {intents.map((intent) => (
          <li key={intent.key} className="bg-canvas p-5">
            <p className="gs-display text-sm text-ink">{intent.label}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{intent.detail}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={whatsappHrefMessage(contact, intent.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                data-cta={`intent-${intent.key}`}
                className="focus-ring gs-btn gs-btn-sm gs-btn-solid"
              >
                <WhatsAppGlyph aria-hidden className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <a
                href={mailtoHrefMessage(contact, { subject: intent.subject, body: intent.body })}
                data-cta={`intent-${intent.key}-mail`}
                className="focus-ring gs-btn gs-btn-sm gs-btn-ghost"
              >
                <Mail aria-hidden className="h-3.5 w-3.5" />
                Email
              </a>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-ink-3">
        Both buttons reach the same people. WhatsApp and the call go to{' '}
        <span className="font-label text-ink">{contact.phoneDisplay}</span>, the mail to{' '}
        <span className="font-label text-ink">{contact.email}</span>.
      </p>
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
          data-cta="panel"
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
                data-cta={`panel-${key}`}
                className="focus-ring group flex items-center gap-4 border border-hairline bg-canvas px-4 py-3 transition-colors hover:border-forest"
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0 text-forest" />
                <span className="min-w-0 flex-1 break-all font-label text-xs uppercase tracking-widest text-ink group-hover:text-forest">
                  {label}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <IntentGrid />
    </div>
  );
}
