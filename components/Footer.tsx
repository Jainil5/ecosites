import Link from 'next/link';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { company } from '@/content/brand/company';
import { mailtoHref, telHref, whatsappHref } from '@/content/brand/links';
import { footerLinks } from '@/content/brand/nav';

export function Footer() {
  const { contact } = company;
  const channels = [
    { href: whatsappHref(contact), label: 'WhatsApp', Icon: MessageCircle, external: true },
    { href: telHref(contact), label: contact.phoneDisplay, Icon: Phone, external: false },
    { href: mailtoHref(contact), label: contact.email, Icon: Mail, external: false },
  ];

  return (
    <footer className="mt-24 border-t border-hairline bg-plane-deep text-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="gs-display flex items-center gap-2 text-xl">
            <Logo className="h-5 w-5" />
            Website <span>Intelligence</span>
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-ink/75">{company.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <p className="gs-label">pages</p>
          <ul className="mt-4 space-y-2.5">
            {footerLinks.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="focus-ring rounded font-label text-sm text-ink/80 transition-colors hover:text-ink hover:underline"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Contact">
          <p className="gs-label">talk to us</p>
          <ul className="mt-4 space-y-2.5">
            {channels.map(({ href, label, Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="focus-ring inline-flex items-center gap-2 rounded font-label text-sm text-ink/80 transition-colors hover:text-ink hover:underline"
                >
                  <Icon aria-hidden className="h-3.5 w-3.5" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl border-t border-ink/15 px-6 py-5">
        <p className="gs-label text-ink/60">
          © {new Date().getFullYear()} {company.name}
        </p>
      </div>
    </footer>
  );
}
