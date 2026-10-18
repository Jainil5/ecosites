'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { ctaLink, navLinks } from '@/content/brand/nav';

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
        className={`border-b backdrop-blur-xl transition-colors duration-300 ${
          sealed ? 'border-hairline bg-canvas/90' : 'border-transparent bg-canvas/40'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-2 font-display text-base font-extrabold uppercase tracking-tight text-ink"
          >
            <Logo className="h-5 w-5 text-accent" />
            Website <span className="text-accent">Intelligence</span>
          </Link>

          <ul className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1 sm:gap-4">
            {navLinks.map((link) => {
              const active = link.href.split('#')[0] === pathname;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`gs-label focus-ring group relative block px-2 py-2 transition-colors hover:text-ink sm:px-1 ${
                      active ? 'text-ink' : ''
                    }`}
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-1 -bottom-0.5 h-0.5 origin-left bg-accent transition-transform duration-300 ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href={ctaLink.href}
                className="focus-ring gs-label ml-2 inline-block bg-plane px-4 py-2.5 text-plane-ink transition-colors hover:bg-lime hover:text-plane-ink"
              >
                {ctaLink.label}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
