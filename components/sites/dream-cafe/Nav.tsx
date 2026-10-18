'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { SunriseMark } from './SunriseMark';

const links = [
  { href: '/dream-cafe/menu', label: 'Menu' },
  { href: '/dream-cafe#room', label: 'The room' },
  { href: '/dream-cafe#feed', label: 'Feed' },
  { href: '/dream-cafe/testimonials', label: 'Voices' },
  { href: '/dream-cafe#visit', label: 'Visit' },
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
      <div className="bg-[var(--dc-green)] text-center">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-1.5">
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-1.5 rounded text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--dc-cream)]/80 transition-colors hover:text-[var(--dc-cream)]"
          >
            <ArrowLeft aria-hidden className="h-3 w-3" />
            Back to Website Intelligence
          </Link>
        </div>
      </div>

      <header
        aria-label="Main"
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'border-b border-[var(--dc-line)] bg-[var(--dc-cream)]/90 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/dream-cafe" className="focus-ring dc-brand group flex items-center gap-2.5">
            <SunriseMark className="h-7 w-7 text-[var(--dc-ember)]" />
            <span className="dc-display text-xl leading-none">
              <span className="dc-serif italic font-normal text-[var(--dc-ember)]">Dream</span>
              <span className="ml-1 uppercase tracking-[0.14em]">Cafe</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="focus-ring dc-display rounded text-[13px] uppercase tracking-[0.16em] text-[var(--dc-ink)]/70 transition-colors hover:text-[var(--dc-ember)]"
              >
                {l.label}
              </a>
            ))}
            <a href="/dream-cafe/menu" className="focus-ring dc-btn dc-btn-solid">
              Order ahead
            </a>
          </nav>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="focus-ring dc-display rounded-md p-2 text-[var(--dc-ink)] md:hidden"
          >
            {open ? <X aria-hidden className="h-6 w-6" /> : <Menu aria-hidden className="h-6 w-6" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-[var(--dc-line)] bg-[var(--dc-cream)] px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring dc-display rounded text-sm uppercase tracking-[0.16em] text-[var(--dc-ink)]/80"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/dream-cafe/menu"
                onClick={() => setOpen(false)}
                className="focus-ring dc-btn dc-btn-solid mt-1 w-full"
              >
                Order ahead
              </a>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
