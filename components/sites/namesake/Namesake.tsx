'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ChevronRight, Globe } from 'lucide-react';
import { CursorLit } from '@/components/brand/CursorLit';
import { GlyphScramble } from '@/components/brand/GlyphScramble';
import { DevPortfolio } from '@/components/sites/namesake/DevPortfolio';
import { ModelBook } from '@/components/sites/namesake/ModelBook';
import { dev, model, modes, product } from '@/components/sites/namesake/data';
import type { ModeKey } from '@/components/sites/namesake/data';

const BOOKS = { model, dev };

/** Pointer depth for the hero planes, written as unitless -1..1 offsets. */
function useStage() {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
    el.style.setProperty('--my', (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
  };

  return { ref, onMove };
}

function Nav({ mode, setMode }: { mode: ModeKey; setMode: (next: ModeKey) => void }) {
  const active = BOOKS[mode];

  return (
    <header className="nk-nav">
      <a href="#top" className="nk-word">
        <span aria-hidden className="nk-word-mark" />
        {product.name}
        <span className="nk-word-domain">{active.person.domain}</span>
      </a>

      <div className="nk-switch" role="group" aria-label="Which portfolio to view">
        {modes.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={mode === item.key}
            className="nk-switch-btn"
            onClick={() => {
              setMode(item.key);
              document.getElementById(item.section)?.scrollIntoView({ block: 'start' });
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <a href="#contact" className="nk-btn nk-btn-solid">
        {mode === 'model' ? 'Book' : 'Hire'}
        <ArrowUpRight aria-hidden className="nk-ico" />
      </a>
    </header>
  );
}

function Hero({ mode }: { mode: ModeKey }) {
  const { ref, onMove } = useStage();
  const active = BOOKS[mode];
  const current = modes.find((item) => item.key === mode);

  return (
    <section id="top" ref={ref} onPointerMove={onMove} className="nk-hero">
      <span aria-hidden className="nk-horizon">
        <span className="nk-horizon-grid" />
      </span>
      <span aria-hidden className="nk-scan" />
      <span aria-hidden className="nk-plane nk-plane-a" />
      <span aria-hidden className="nk-plane nk-plane-b" />

      <div className="nk-hero-inner">
        <div className="nk-hero-cols">
          <div>
            <p className="nk-meta">
              <span className="nk-dot" aria-hidden />
              {active.person.cities}
              <span aria-hidden>/</span>
              {active.person.since}
              <span aria-hidden>/</span>
              sample person
            </p>

            {/* The key remounts the scrambler, so flipping the book re-decodes the name. */}
            <h1 className="nk-name" key={active.person.name}>
              <GlyphScramble text={active.person.name} duration={720} />
            </h1>

            <p className="nk-role">{active.role}</p>
            <p className="nk-lead">{product.pitch}</p>

            <div className="nk-hero-actions">
              <a href={`#${current?.section}`} className="nk-btn nk-btn-solid">
                {current?.cta}
                <ChevronRight aria-hidden className="nk-ico" />
              </a>
              <a href="#domain" className="nk-btn nk-btn-ghost">
                <Globe aria-hidden className="nk-ico" />
                Check your name
              </a>
            </div>

            <div className="nk-ticket">
              <span className="nk-ticket-label">on the record</span>
              <span className="nk-ticket-domain">{active.person.domain}</span>
              <span aria-hidden className="nk-ticket-bars" />
              <span className="nk-ticket-note">
                registered in your name, pointed at this page, edits yours to make
              </span>
            </div>
          </div>

          {/* The cover plate: what the first screen of the book looks like. */}
          <span aria-hidden className="nk-plate-preview">
            <span className="nk-plate-mono">
              {active.person.name
                .split(' ')
                .map((word) => word[0])
                .join('')}
            </span>
            <span className="nk-plate-scan" />
            <span className="nk-plate-tag">{active.person.domain}</span>
          </span>
        </div>
      </div>

      <div className="nk-ticker" aria-hidden>
        <div className="nk-ticker-track">
          {[0, 1].map((pass) => (
            <span key={pass} className="nk-ticker-run">
              {(mode === 'model' ? model.credits : dev.stack).map((item) => (
                <span key={item} className="nk-ticker-item">
                  {item}
                  <span className="nk-ticker-sep">◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The name checker. Deliberately local and clearly illustrative: it shows what
 * the domain step looks like and never claims real registry availability.
 */
function DomainBand() {
  const [name, setName] = useState('');
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const base = slug || 'yourname';

  return (
    <section id="domain" className="nk-section">
      <p className="nk-kicker">
        <span className="nk-kicker-hot">03</span> <span aria-hidden>/</span> the name
      </p>
      <div className="nk-domain-grid">
        <div>
          <h2 className="nk-h2">Type the name. See the address.</h2>
          <p className="nk-p">
            The portfolio is only half of it — the point is that people find you by
            name. We register the domain, put SSL on it, and hand you the login.
          </p>
          <label className="nk-field">
            <span className="nk-field-label">your name</span>
            <input
              className="nk-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Rhea Verma"
              autoComplete="off"
            />
          </label>
          <p className="nk-fine">
            Illustrative only — the real registry is checked when we build yours.
          </p>
        </div>

        <CursorLit selector=".nk-lit" className="nk-rows">
          {['.com', '.in', '.dev', '.studio'].map((tld) => (
            <div key={tld} className="nk-row nk-lit">
              <span className="nk-row-name">
                {base}
                {tld}
              </span>
              <span className="nk-row-state">
                <Check aria-hidden className="nk-ico" />
                {tld === '.com' ? 'the one we register by default' : 'also worth taking'}
              </span>
            </div>
          ))}
          <p className="nk-row-note">
            One address, both books: the work on <strong>{base}.com</strong>, the comp
            card one scroll below it. One link to put in a bio, one link to send an
            agency, one link for a recruiter.
          </p>
        </CursorLit>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="nk-section">
      <p className="nk-kicker">
        <span className="nk-kicker-hot">04</span> <span aria-hidden>/</span> the ask
      </p>
      <h2 className="nk-h2">One page, two inboxes.</h2>
      <CursorLit selector=".nk-lit" className="nk-contact">
        <div className="nk-contact-card nk-lit">
          <p className="nk-meta">modelling</p>
          <h3 className="nk-h3">{model.person.name}</h3>
          <p className="nk-p">{model.status}</p>
          <a href={`mailto:bookings@${model.person.domain}`} className="nk-btn nk-btn-solid">
            bookings@{model.person.domain}
            <ArrowUpRight aria-hidden className="nk-ico" />
          </a>
        </div>
        <div className="nk-contact-card nk-lit">
          <p className="nk-meta">engineering</p>
          <h3 className="nk-h3">{dev.person.name}</h3>
          <p className="nk-p">{dev.status}</p>
          <a href={`mailto:hello@${dev.person.domain}`} className="nk-btn nk-btn-solid">
            hello@{dev.person.domain}
            <ArrowUpRight aria-hidden className="nk-ico" />
          </a>
        </div>
      </CursorLit>
      <p className="nk-fine">
        Neither address is real — the two people on this page are sample data.
      </p>
    </section>
  );
}

export function Namesake() {
  const [mode, setMode] = useState<ModeKey>('model');

  return (
    <div className="nk" data-mode={mode}>
      <span aria-hidden className="nk-field-bg" />
      <Nav mode={mode} setMode={setMode} />
      <main>
        <Hero mode={mode} />
        <ModelBook />
        <DevPortfolio />
        <DomainBand />
        <Contact />
      </main>
      <footer className="nk-foot">
        <p className="nk-foot-note">{product.note}</p>
        <p className="nk-foot-links">
          <Link href="/products#digital-portfolio" className="nk-foot-link">
            What we build with this
            <ArrowUpRight aria-hidden className="nk-ico" />
          </Link>
          <Link href="/demos" className="nk-foot-link">
            More demonstration builds
          </Link>
        </p>
      </footer>
    </div>
  );
}
