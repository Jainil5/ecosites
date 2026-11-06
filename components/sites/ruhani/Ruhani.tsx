'use client';

import Link from 'next/link';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { CartDrawer, PieceSheet } from './Drawers';
import { Collection } from './Collection';
import { Gifting } from './Gifting';
import { Piece } from './Piece';
import { Story } from './Story';
import { Voices } from './Voices';
import {
  cartCount,
  cartReducer,
  inr,
  loadCart,
  saveCart,
  totals,
  whatsappOrder,
  type CartState,
} from './cart';
import { FREE_SHIPPING_OVER, GST_RATE, maker, pieces, type Piece as PieceType } from './data';

const NAV = [
  { href: '#shop', label: 'The pieces' },
  { href: '#maker', label: 'The bench' },
  { href: '#how', label: 'How it works' },
  { href: '#gifting', label: 'Gifting' },
  { href: '#voices', label: 'Reviews' },
];

/** Four drawings, laid out the way they come off the paper. */
const HERO_FORMS = ['jhumka', 'ring', 'pendant', 'hoop'] as const;

/**
 * Ruhani, end to end: the shelf, the ticket, the box.
 *
 * The basket is a real reducer over real prices — GST inside, courier above or
 * below the free line, a WhatsApp ticket at the end — and it lives in local
 * storage, because a made-to-order buyer usually closes the page to ask someone
 * what size they are and comes back a day later.
 */
export function Ruhani() {
  const [cart, dispatch] = useReducer(cartReducer, {} as CartState);
  const [ready, setReady] = useState(false);
  const [boxOpen, setBoxOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState<PieceType | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    dispatch({ type: 'replace', state: loadCart(window.localStorage) });
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveCart(window.localStorage, cart);
  }, [cart, ready]);

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

  const count = cartCount(cart);

  const sheetCount = useMemo(() => {
    if (!sheet) return 0;
    return Object.values(cart)
      .filter((l) => l.slug === sheet.slug)
      .reduce((sum, l) => sum + l.qty, 0);
  }, [cart, sheet]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="ruhani" data-bar-up={count > 0 ? 'true' : 'false'}>
        <div className="rj-topbar">
          <div className="rj-shell rj-topbar-inner">
            <Link href="/">Back to Website &amp; Intelligence</Link>
            <span>{maker.kicker}</span>
          </div>
        </div>

        <header className="rj-header" data-scrolled={scrolled ? 'true' : 'false'}>
          <div className="rj-shell rj-header-inner">
            <Link href="/ruhani" className="rj-brand">
              {maker.name}
            </Link>

            <nav aria-label="Sections" className="rj-nav-links">
              {NAV.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="rj-header-actions">
              <button type="button" className="rj-box-btn" onClick={() => setBoxOpen(true)}>
                Box
                <span className="rj-box-count" data-empty={count === 0 ? 'true' : 'false'}>
                  {count}
                </span>
              </button>
              <button
                type="button"
                className="rj-burger"
                aria-expanded={open}
                aria-label={open ? 'Close the menu' : 'Open the menu'}
                onClick={() => setOpen((v) => !v)}
              >
                <span />
                <span />
              </button>
            </div>
          </div>

          {open ? (
            <nav className="rj-mobile" aria-label="Sections, mobile">
              {NAV.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
            </nav>
          ) : null}
        </header>

        <main>
          <section className="rj-hero" aria-label={maker.line}>
            <div className="rj-shell rj-hero-inner">
              <p className="rj-eyebrow">{maker.kicker}</p>
              <h1 className="rj-display rj-hero-title">{maker.line}</h1>
              <p className="rj-lede rj-hero-lede">{maker.intro}</p>
              <div className="rj-hero-actions">
                <a href="#shop" className="rj-btn rj-btn-solid">
                  See the {pieces.length} pieces
                </a>
                <a
                  href={whatsappOrder(maker.whatsapp, `Hi ${maker.name}! I am after a piece and I am not sure which: `)}
                  className="rj-btn rj-btn-line"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ask about a piece
                </a>
              </div>
              <ul className="rj-hero-forms" aria-hidden>
                {HERO_FORMS.map((f) => (
                  <li key={f}>
                    <Piece form={f} />
                  </li>
                ))}
              </ul>
              <p className="rj-hero-fine">
                {GST_RATE}% GST inside every price · free courier above ₹{FREE_SHIPPING_OVER.toLocaleString('en-IN')} ·
                solid gold hallmarked 585
              </p>
            </div>
          </section>

          <Collection cart={cart} dispatch={dispatch} onOpen={setSheet} />
          <Story />
          <Gifting />
          <Voices />

          <section id="contact" className="rj-band rj-contact" aria-label="Ask the bench">
            <div className="rj-shell rj-contact-inner">
              <p className="rj-eyebrow">One person reads these</p>
              <h2 className="rj-display rj-h2">Nothing on this page is a form.</h2>
              <p className="rj-lede">
                She answers on WhatsApp between the bench and the post office, usually the same day,
                always before anything is charged.
              </p>
              <div className="rj-contact-actions">
                <a
                  className="rj-btn rj-btn-solid"
                  href={whatsappOrder(maker.whatsapp, `Hi ${maker.name}! I have a question about a piece: `)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message the bench
                </a>
                <a className="rj-btn rj-btn-line" href={`mailto:${maker.email}`}>
                  {maker.email}
                </a>
                <a className="rj-btn rj-btn-line" href={`tel:+${maker.whatsapp}`}>
                  {maker.whatsappDisplay}
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="rj-footer">
          <div className="rj-shell rj-footer-inner">
            <div>
              <p className="rj-footer-brand">{maker.name}</p>
              <p className="rj-serif">{maker.line}</p>
            </div>
            <nav aria-label="Footer" className="rj-footer-nav">
              {NAV.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
              <a href={maker.instagram}>Instagram</a>
            </nav>
            <div className="rj-footer-meta">
              <a href={`mailto:${maker.email}`}>{maker.email}</a>
              <a href={`tel:+${maker.whatsapp}`}>{maker.whatsappDisplay}</a>
              <p>{maker.studio}</p>
            </div>
          </div>
          <div className="rj-shell rj-footer-base">
            <p>
              © {new Date().getFullYear()} {maker.name}. Hallmark 585 on solid gold, 925 on silver.
            </p>
            <p className="rj-footer-note">
              Our own house, built for this product — the bench, the box and the drawings here were
              all made for the build, and the number above is a reserved one.
            </p>
          </div>
        </footer>

        {count > 0 ? (
          <button type="button" className="rj-bar" onClick={() => setBoxOpen(true)}>
            <span>{count} in the box</span>
            <span className="rj-bar-total">{summarise(cart)}</span>
            <span className="rj-bar-go">Open →</span>
          </button>
        ) : null}

        <AnimatePresence>
          {sheet ? (
            <PieceSheet
              key={sheet.slug}
              piece={sheet}
              inCart={sheetCount}
              dispatch={dispatch}
              onClose={() => setSheet(null)}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {boxOpen ? (
            <CartDrawer key="cart" cart={cart} dispatch={dispatch} onClose={() => setBoxOpen(false)} />
          ) : null}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

/** What the bar can honestly promise before the box is opened. */
function summarise(cart: CartState): string {
  const { shipping, total } = totals(cart);
  return shipping === 0
    ? `${inr(total)} · courier free`
    : `${inr(total)} · ${inr(shipping)} courier`;
}
