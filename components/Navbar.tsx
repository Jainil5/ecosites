import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

const links = [
  { href: '/#services', label: 'Services' },
  { href: '/store', label: 'Demos' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50">
      <nav
        aria-label="Primary"
        className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl glass px-5 py-3 shadow-card"
      >
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 rounded-lg font-display text-base tracking-tight text-foreground"
        >
          <Logo className="h-5 w-5 text-accent" />
          <span className="text-glow">Website</span>
          <span className="text-accent">IN</span>
        </Link>

        <ul className="flex items-center gap-0.5 sm:gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="focus-ring rounded-lg px-2 py-2 font-mono text-xs text-subtle transition-colors hover:text-foreground sm:px-3 sm:text-sm"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
