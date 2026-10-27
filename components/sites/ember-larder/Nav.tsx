'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { cartCount, inr, totals, type CartState } from './cart';
import { FlameMark } from './FlameMark';

const links = [
  { href: '#products', label: 'Shop' },
  { href: '#hearth', label: 'The hearth' },
  { href: '#set-dinner', label: 'Set dinner' },
  { href: '#voices', label: 'Voices' },
  { href: '#visit', label: 'Visit' },
];

interface NavProps {
  cart: CartState;
  onOpenBasket: () => void;
}

export function Nav({ cart, onOpenBasket }: NavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = cartCount(cart);
  const { total } = totals(cart);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 28);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="el-topbar">
        <div className="el-shell flex items-center justify-center gap-2 px-5 py-2">
          <ArrowLeft aria-hidden className="h-3 w-3" />
          <Link href="/">Back to Website &amp; Intelligence</Link>
        </div>
      </div>

      <header className="el-header" data-scrolled={scrolled ? 'true' : 'false'}>
        <div className="el-shell flex items-center justify-between gap-4">
          <Link href="/ember-larder" className="el-brand">
            <FlameMark className="el-brand-mark" />
            <span className="el-brand-name">
              <span className="el-brand-serif">Ember</span>
              <span className="el-brand-caps">Larder</span>
            </span>
          </Link>

          <nav aria-label="Sections" className="el-nav-links">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="el-nav-actions">
            <button type="button" className="el-basket-btn" onClick={onOpenBasket}>
              <span className="el-basket-label">{count > 0 ? `${count} in basket` : 'Basket'}</span>
              <span className="el-basket-total">{inr(total)}</span>
              {count > 0 ? (
                <span className="el-basket-dot" key={count} aria-hidden>
                  {count}
                </span>
              ) : null}
            </button>
            <a href="#reserve" className="el-cta">
              Book a table
            </a>
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="el-burger"
            >
              {open ? <X aria-hidden className="h-6 w-6" /> : <Menu aria-hidden className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="el-mobile-sheet">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <a href="#reserve" onClick={() => setOpen(false)} className="el-cta el-cta-wide">
              Book a table
            </a>
          </div>
        ) : null}
      </header>
    </>
  );
}
