import Link from 'next/link';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { company } from '@/content/brand/company';
import { mailtoHref, telHref, whatsappHref } from '@/content/brand/links';

const portfolioLinks = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/portfolio/resume', label: 'Resume' },
];

export function Footer() {
  const { contact } = company;
  const channels = [
    { href: whatsappHref(contact), label: 'WhatsApp', Icon: MessageCircle, external: true },
    { href: telHref(contact), label: contact.phoneDisplay, Icon: Phone, external: false },
    { href: mailtoHref(contact), label: 'Email', Icon: Mail, external: false },
  ];

  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="font-display text-base text-foreground">
            {company.name} <span className="text-subtle">· {company.city}</span>
          </p>
          <p className="font-mono text-xs text-subtle">
            © {new Date().getFullYear()} {company.name} — {company.tagline.toLowerCase()}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {channels.map(({ href, label, Icon, external }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="focus-ring inline-flex items-center gap-1.5 rounded font-mono text-sm text-subtle transition-colors hover:text-accent"
            >
              <Icon aria-hidden className="h-3.5 w-3.5" />
              {label}
            </a>
          ))}
          {portfolioLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded font-mono text-sm text-subtle transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
