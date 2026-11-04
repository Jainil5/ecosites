'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { BreweryMark } from './BreweryMark';

/** One page now, so every link is an anchor into the same scroll. */
const links = [
  { href: '#taps', label: 'Taps' },
  { href: '#menu', label: 'Menu' },
  { href: '#story', label: 'Story' },
  { href: '#voices', label: 'Voices' },
  { href: '#feed', label: 'Instagram' },
  { href: '#room', label: 'The room' },
  { href: '#visit', label: 'Visit' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="bg-[var(--br-bottle)] text-center">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-1">
          <Link
            href="/"
            className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fbf4e9]/80 transition-colors hover:text-[#fbf4e9]"
          >
            <ArrowLeft aria-hidden className="h-3 w-3" />
            Back to Website & Intelligence
          </Link>
        </div>
      </div>

      <header
        aria-label="Main"
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'border-b border-[var(--br-line)] bg-[#fbf4e9]/90 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/brewery" className="focus-ring br-brand group flex min-h-10 items-center gap-2.5">
            <BreweryMark className="h-7 w-7 text-[var(--br-brass)]" />
            <span className="br-display text-xl leading-none">
              <span className="br-serif italic font-normal text-[var(--br-brass)]">Brew</span>
              <span className="ml-1 uppercase tracking-[0.14em]">ery</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="focus-ring br-display rounded text-[13px] uppercase tracking-[0.16em] text-[#2a211b]/70 transition-colors hover:text-[var(--br-brass)]"
              >
                {l.label}
              </a>
            ))}
            <a href="#menu" className="focus-ring br-btn br-btn-solid">
              Order a pint
            </a>
          </nav>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="focus-ring br-display inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--br-ink)] md:hidden"
          >
            {open ? <X aria-hidden className="h-6 w-6" /> : <Menu aria-hidden className="h-6 w-6" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-[var(--br-line)] bg-[var(--br-cream)] px-5 py-3 md:hidden">
            <div className="flex flex-col">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring br-display flex min-h-11 items-center rounded text-sm uppercase tracking-[0.16em] text-[#2a211b]/80"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#menu"
                onClick={() => setOpen(false)}
                className="focus-ring br-btn br-btn-solid mt-2 w-full"
              >
                Order a pint
              </a>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
