import Link from 'next/link';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { company } from '@/content/brand/company';
import { mailtoHref, telHref, whatsappHref } from '@/content/brand/links';

const pages = [
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/demos', label: 'Demos' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {
  const { contact } = company;
  const channels = [
    { href: whatsappHref(contact), label: 'WhatsApp', Icon: MessageCircle, external: true },
    { href: telHref(contact), label: contact.phoneDisplay, Icon: Phone, external: false },
    { href: mailtoHref(contact), label: contact.email, Icon: Mail, external: false },
  ];

  return (
    <footer className="mt-24 border-t border-white/[0.07] bg-deep/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="flex items-center gap-2 font-display text-lg text-foreground">
            <Logo className="h-5 w-5 text-accent" />
            Website <span className="text-accent">IN</span>
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-subtle">{company.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Pages</p>
          <ul className="mt-4 space-y-2.5">
            {pages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="focus-ring rounded font-mono text-sm text-subtle transition-colors hover:text-foreground"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Contact">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Talk to us</p>
          <ul className="mt-4 space-y-2.5">
            {channels.map(({ href, label, Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="focus-ring inline-flex items-center gap-2 rounded font-mono text-sm text-subtle transition-colors hover:text-accent"
                >
                  <Icon aria-hidden className="h-3.5 w-3.5" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl border-t border-white/[0.07] px-6 py-5">
        <p className="font-mono text-xs text-subtle/80">
          © {new Date().getFullYear()} {company.name}
        </p>
      </div>
    </footer>
  );
}
