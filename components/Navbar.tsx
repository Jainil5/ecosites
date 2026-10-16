'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/Logo';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/demos', label: 'Demos' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  // The bar sits on the page until you scroll, then seals itself so content
  // passing underneath never shows through the middle of the nav.
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    const onScroll = () => setSealed(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <nav
        aria-label="Primary"
        className={`edge mx-auto mt-4 flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl px-4 py-3 backdrop-blur-xl transition-colors duration-300 sm:px-5 ${
          sealed ? 'bg-deep/85 shadow-card' : 'bg-white/[0.04]'
        }`}
      >
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 rounded-lg font-display text-base tracking-tight text-foreground"
        >
          <Logo className="h-5 w-5 text-accent" />
          <span className="text-glow">Website</span>
          <span className="text-accent">IN</span>
        </Link>

        <ul className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1 sm:gap-2">
          {links.map((link) => {
            const active = link.href.split('#')[0] === pathname;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`focus-ring relative rounded-lg px-2 py-1.5 font-mono text-xs transition-colors hover:text-foreground sm:px-3 sm:py-2 sm:text-sm ${
                    active ? 'text-foreground' : 'text-subtle'
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-2 -bottom-0.5 h-px bg-accent transition-opacity duration-200 ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
