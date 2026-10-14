'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Scissors,
  Star,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  ArrowLeft,
  Car,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';
import { Reveal } from './Reveal';
import { Stars } from './Stars';
import { FlipReviewCard } from './FlipReviewCard';
import { Counter } from './Counter';
import { ServiceMenu } from './ServiceMenu';
import { OffersStrip } from './OffersStrip';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { InstagramReel } from './InstagramReel';
import { BookingForm } from './BookingForm';
import { Register } from './Register';
import { transformations, reels, stylists, reviews, stats } from './data';

const instagramUrl = 'https://www.instagram.com/hair.adore/';

const navLinks = [
  { href: '#offers', label: 'Offers' },
  { href: '#services', label: 'Services' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#videos', label: 'Videos' },
  { href: '#team', label: 'Team' },
  { href: '#reviews', label: 'Reviews' },
];

const heroImage =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80';
const heroCardImage =
  'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80';

export function HairAdore() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 40);
        if (!reduce && heroRef.current) {
          // Expose scroll offset to CSS parallax layers (only while near the top).
          heroRef.current.style.setProperty('--scroll', `${Math.min(y, 900)}px`);
        }
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (registerOpen) return <Register onBack={() => setRegisterOpen(false)} />;

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-stone-800">
      {/* Back to portfolio */}
      <div className="bg-[#2B2118] text-center">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-xs">
          <Link href="/" className="focus-ring inline-flex items-center gap-1 rounded font-semibold text-[#E7B48F] hover:text-white">
            <ArrowLeft aria-hidden className="h-3 w-3" /> Back to Website IN
          </Link>
        </div>
      </div>

      {/* Navbar */}
      <nav
        aria-label="Main"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 shadow-[0_10px_30px_-18px_rgba(43,33,24,0.4)] backdrop-blur-md'
            : 'bg-gradient-to-b from-[#FAF6F0]/95 via-[#FAF6F0]/75 to-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2 font-serif text-2xl font-bold text-stone-900">
            <Scissors aria-hidden className="h-5 w-5 text-[#C1613C]" />
            Hair <span className="font-light italic text-[#C1613C]">Adore</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="focus-ring rounded text-sm font-medium tracking-widest text-stone-600 uppercase transition-colors hover:text-[#C1613C]"
              >
                {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="focus-ring cursor-pointer rounded text-sm font-medium tracking-widest text-stone-600 uppercase transition-colors hover:text-[#C1613C]"
            >
              Register
            </button>
            <a
              href="#booking"
              className="focus-ring cursor-pointer rounded-full bg-[#C1613C] px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_12px_24px_-12px_rgba(193,97,60,0.9)] transition-transform hover:-translate-y-0.5 hover:bg-[#9E4A2B]"
            >
              Book Now
            </a>
          </div>

          <button
            className="focus-ring rounded-md p-2 text-stone-800 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X aria-hidden className="h-6 w-6" /> : <Menu aria-hidden className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-stone-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col items-center gap-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block font-medium text-stone-700 hover:text-[#C1613C]"
                >
                  {l.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setRegisterOpen(true);
                }}
                className="block font-medium text-stone-700 hover:text-[#C1613C]"
              >
                Register
              </button>
              <a
                href="#booking"
                onClick={() => setMenuOpen(false)}
                className="w-full rounded-full bg-[#C1613C] py-2.5 text-center font-semibold uppercase text-white"
              >
                Book Now
              </a>
            </div>
          </div>
        ) : null}
      </nav>

      {/* Hero — layered 3D scene */}
      <section
        ref={heroRef}
        id="top"
        aria-label="Introduction"
        className="ha-perspective relative overflow-hidden"
        style={{ ['--scroll' as string]: '0px' }}
      >
        {/* Background image layer with parallax */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ transform: 'translate3d(0, calc(var(--scroll) * 0.18), 0)' }}
        >
          <img src={heroImage} alt="" className="h-[115%] w-full scale-105 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF6F0]/95 via-[#FAF6F0]/90 to-[#FAF6F0] lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#FAF6F0] via-[#FAF6F0]/92 to-[#FAF6F0]/55 lg:block" />
          <div className="absolute inset-0 hidden bg-gradient-to-b from-transparent via-transparent to-[#FAF6F0] lg:block" />
        </div>

        {/* Drifting depth orbs */}
        <span
          aria-hidden
          className="ha-blob ha-blob-anim left-[6%] top-24 h-56 w-56 bg-[#C1613C]/25"
          style={{ transform: 'translate3d(0, calc(var(--scroll) * -0.12), 0)' }}
        />
        <span
          aria-hidden
          className="ha-blob ha-float-slow right-[8%] top-40 h-64 w-64 bg-[#E7B48F]/40"
        />
        <span aria-hidden className="ha-blob ha-blob-anim bottom-10 left-[38%] h-40 w-40 bg-[#9E4A2B]/20" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          {/* Left: copy */}
          <div className="preserve-3d">
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-3">
                <span className="h-px w-12 bg-[#C1613C]" />
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#9E4A2B]">
                  <Sparkles aria-hidden className="h-3.5 w-3.5" /> Viman Nagar
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="ha-depth font-serif text-5xl leading-[1.02] text-stone-900 sm:text-6xl lg:text-7xl">
                Where Every
                <br />
                <em className="text-[#C1613C]">Detail</em> Matters
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-stone-600 sm:text-xl">
                The destination for luxury haircare, precision colour, and
                transformative beauty rituals — presented in an immersive, dimensional experience.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 flex flex-col justify-start gap-4 sm:flex-row">
                <a
                  href="#booking"
                  className="focus-ring ha-shadow-lg inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#C1613C] px-10 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:-translate-y-1 hover:bg-[#9E4A2B]"
                >
                  <CalendarCheck aria-hidden className="h-4 w-4" /> Reserve Your Chair
                </a>
                <a
                  href="#services"
                  className="focus-ring inline-flex cursor-pointer items-center justify-center rounded-full border border-[#C1613C]/40 bg-white/50 px-10 py-4 text-sm font-semibold uppercase tracking-wider text-[#9E4A2B] backdrop-blur transition-colors hover:bg-[#C1613C]/10"
                >
                  Explore Services
                </a>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <dl className="mt-14 grid max-w-lg grid-cols-3 gap-3 sm:gap-6">
                {stats.map((s, i) => (
                  <div key={s.label} className={i === 1 ? 'border-x border-[#C1613C]/20 px-2' : 'px-2'}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="font-serif text-3xl font-bold text-[#9E4A2B]">
                        <Counter value={s.value} suffix={s.suffix} decimals={'decimals' in s ? s.decimals : 0} />
                      </span>
                      <span className="mt-1 block text-xs tracking-wide text-stone-500">{s.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Right: floating 3D collage card */}
          <Reveal delay={200} className="hidden lg:block">
            <TiltCard className="ha-preserve mx-auto w-full max-w-md" max={12}>
              <div className="ha-shadow-lg preserve-3d overflow-hidden rounded-[2rem] border border-white/60 bg-white">
                <div className="relative">
                  <img src={heroCardImage} alt="Salon styling in progress" className="h-[420px] w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2B2118]/70 via-transparent to-transparent" />
                  <div
                    className="preserve-3d absolute inset-x-0 bottom-0 p-6"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    <p className="font-serif text-2xl text-white">Signature Balayage</p>
                    <p className="text-sm text-white/80">Hand-painted colour · 3 hr ritual</p>
                  </div>
                </div>
              </div>

              {/* Floating badges at varied depth for parallax pop */}
              <div
                className="ha-float absolute -left-8 top-10 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 backdrop-blur ha-shadow"
                style={{ transform: 'translateZ(70px)' }}
              >
                <div className="flex items-center gap-2">
                  <Stars />
                  <span className="text-sm font-bold text-stone-900">4.8</span>
                </div>
                <span className="text-[11px] text-stone-500">320+ guest reviews</span>
              </div>

              <div
                className="ha-float-slow absolute -right-6 bottom-16 rounded-2xl bg-[#C1613C] px-4 py-3 text-white ha-shadow-lg"
                style={{ transform: 'translateZ(85px)' }}
              >
                <span className="block font-serif text-xl leading-none">10+ yrs</span>
                <span className="text-[11px] uppercase tracking-wide text-white/85">of craft</span>
              </div>

              <div
                className="absolute -top-6 right-12 flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white text-[#C1613C] ha-shadow"
                style={{ transform: 'translateZ(60px)' }}
              >
                <Scissors aria-hidden className="h-6 w-6" />
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      <main>
      {/* Info strip */}
      <div className="border-y border-[#C1613C]/20 bg-white py-3">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 text-sm md:flex-row md:gap-10">
          <span className="flex items-center gap-2 text-[#9E4A2B]"><MapPin aria-hidden className="h-4 w-4" /> Viman Nagar</span>
          <span className="hidden text-[#C1613C]/30 md:inline">|</span>
          <span className="flex items-center gap-2 text-[#9E4A2B]"><Car aria-hidden className="h-4 w-4" /> Dedicated 2 &amp; 4 Wheeler Parking</span>
          <span className="hidden text-[#C1613C]/30 md:inline">|</span>
          <span className="flex items-center gap-2 text-[#9E4A2B]"><Star aria-hidden className="h-4 w-4" /> 100% Sanitized Environment</span>
        </div>
      </div>

      {/* Offers & Packages */}
      <OffersStrip />

      {/* Services */}
      <section id="services" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal className="mb-14 text-center">
            <h2 className="ha-depth font-serif text-4xl text-stone-900 sm:text-5xl">Service Menu</h2>
            <div className="mx-auto my-5 h-0.5 w-16 bg-gradient-to-r from-transparent via-[#C1613C] to-transparent" />
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-500">
              Transparent pricing. Premium craft. No surprises — only transformations.
            </p>
          </Reveal>
          <ServiceMenu />
          <p className="mt-10 text-center text-xs text-stone-500">
            * Starting prices. May vary by hair length/density. GST extra.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="relative scroll-mt-24 overflow-hidden bg-white py-24">
        <span aria-hidden className="ha-blob ha-blob-anim -left-10 top-10 h-52 w-52 bg-[#E7B48F]/30" />
        <div className="relative mx-auto max-w-7xl px-4">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="ha-depth font-serif text-4xl text-stone-900 sm:text-5xl">Real Transformations</h2>
              <div className="my-4 h-0.5 w-16 bg-[#C1613C]" />
              <p className="max-w-md text-sm leading-relaxed text-stone-500">
                Slide to reveal. Every result crafted in our Viman Nagar studio.
              </p>
            </div>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#C1613C]/40 px-4 py-2 text-sm text-[#9E4A2B] transition-colors hover:bg-[#C1613C]/10"
            >
              <Instagram aria-hidden className="h-4 w-4" /> Instagram
            </a>
          </Reveal>

          <div className="ha-perspective grid gap-6 md:grid-cols-3">
            {transformations.map((t, i) => (
              <Reveal key={t.title} delay={i * 100} className="preserve-3d transition-transform duration-300 hover:[transform:perspective(900px)_translateY(-6px)_rotateX(5deg)]">
                <div>
                  <BeforeAfterSlider item={t} />
                  <div className="mt-3 text-center">
                    <h3 className="font-serif text-lg text-[#9E4A2B]">{t.title}</h3>
                    <p className="text-xs text-stone-500">Drag to reveal transformation</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram reels */}
      <section id="videos" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="ha-depth font-serif text-4xl text-stone-900 sm:text-5xl">In The Chair</h2>
              <div className="my-4 h-0.5 w-16 bg-[#C1613C]" />
              <p className="max-w-md text-sm leading-relaxed text-stone-500">
                Fresh from our Instagram — real transformations filmed in the chair.
              </p>
            </div>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#C1613C]/40 px-4 py-2 text-sm text-[#9E4A2B] transition-colors hover:bg-[#C1613C]/10"
            >
              <Instagram aria-hidden className="h-4 w-4" /> Follow @hair.adore
            </a>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reels.map((r, i) => (
              <Reveal key={r.url} delay={i * 100}>
                <InstagramReel reel={r} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="relative scroll-mt-24 overflow-hidden py-24">
        <span aria-hidden className="ha-blob ha-float-slow right-0 top-16 h-56 w-56 bg-[#C1613C]/15" />
        <div className="relative mx-auto max-w-7xl px-4">
          <Reveal className="mb-14 text-center">
            <h2 className="ha-depth font-serif text-4xl text-stone-900 sm:text-5xl">Meet Your Stylists</h2>
            <div className="mx-auto my-5 h-0.5 w-16 bg-gradient-to-r from-transparent via-[#C1613C] to-transparent" />
            <p className="text-sm text-stone-500">Master craftspeople. Every one certified. All obsessively passionate.</p>
          </Reveal>
          <div className="ha-perspective grid gap-10 md:grid-cols-3">
            {stylists.map((s, i) => (
              <Reveal key={s.name} delay={i * 100}>
                <TiltCard className="h-full" max={9}>
                  <div className="ha-shadow preserve-3d flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-8 text-center">
                    <div
                      className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-2 border-[#C1613C]/30"
                      style={{ transform: 'translateZ(50px)' }}
                    >
                      <img src={s.image} alt={s.name} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <h3 className="font-serif text-xl text-stone-900 [transform:translateZ(30px)]">{s.name}</h3>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#C1613C]">{s.role}</p>
                    <p className="text-sm leading-relaxed text-stone-500">{s.bio}</p>
                    <div className="mt-5 flex justify-center gap-2">
                      {s.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-[#C1613C]/20 bg-[#C1613C]/10 px-3 py-1 text-xs text-[#9E4A2B]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="relative scroll-mt-24 overflow-hidden bg-white py-24">
        <span aria-hidden className="ha-blob ha-blob-anim bottom-0 right-[10%] h-52 w-52 bg-[#E7B48F]/30" />
        <div className="relative mx-auto max-w-7xl px-4">
          <Reveal className="mb-14 flex flex-col items-start justify-between gap-8 md:flex-row">
            <div>
              <h2 className="ha-depth font-serif text-4xl text-stone-900 sm:text-5xl">Client Love</h2>
              <div className="my-4 h-0.5 w-16 bg-[#C1613C]" />
              <p className="text-sm text-stone-500">Rated 4.8/5 by 320+ guests.</p>
            </div>
            <div className="ha-shadow flex items-center gap-5 rounded-2xl border border-stone-200 px-8 py-5">
              <div className="font-serif text-5xl font-bold text-stone-900">4.8</div>
              <div>
                <Stars />
                <div className="mt-1 text-xs text-stone-500">320+ verified reviews</div>
              </div>
            </div>
          </Reveal>

          <div className="ha-perspective grid gap-6 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.name} delay={i * 100} className="h-full">
                <FlipReviewCard review={r} />
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-stone-500">
            Tap a card to flip it and see the visit details.
          </p>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="relative scroll-mt-24 overflow-hidden py-24">
        <span aria-hidden className="ha-blob ha-float-slow left-[12%] top-10 h-52 w-52 bg-[#C1613C]/15" />
        <div className="relative mx-auto max-w-3xl px-4">
          <Reveal>
            <div className="ha-perspective-near">
              <div className="ha-shadow-lg preserve-3d rounded-3xl border border-stone-200 bg-white p-8 md:p-12" style={{ transform: 'translateZ(30px)' }}>
                <div className="mb-10 text-center">
                  <h2 className="ha-depth font-serif text-3xl text-stone-900 md:text-4xl">Reserve Your Chair</h2>
                  <div className="mx-auto my-4 h-0.5 w-16 bg-gradient-to-r from-transparent via-[#C1613C] to-transparent" />
                  <p className="text-sm text-stone-500">Walk-ins welcome — booking guarantees your preferred stylist.</p>
                </div>
                <BookingForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#2B2118] pt-16 pb-8 text-stone-300">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-10 md:grid-cols-4">
          <div>
            <a href="#top" className="mb-5 flex items-center gap-2 font-serif text-2xl font-bold text-white">
              <Scissors aria-hidden className="h-5 w-5 text-[#E7B48F]" />
              Hair <span className="font-light italic text-[#E7B48F]">Adore</span>
            </a>
            <p className="mb-6 text-sm leading-relaxed text-stone-400">
              A premier destination for luxury haircare, styling, and makeup.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: instagramUrl, label: 'Instagram' },
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href === '#' ? undefined : '_blank'}
                  rel={href === '#' ? undefined : 'noopener noreferrer'}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-600 text-stone-400 transition-colors hover:border-[#E7B48F] hover:text-[#E7B48F]"
                >
                  <Icon aria-hidden className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 font-serif text-lg text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm text-stone-400">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-[#E7B48F]">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-serif text-lg text-white">Contact</h3>
            <ul className="space-y-4 text-sm text-stone-400">
              <li className="flex gap-3"><MapPin aria-hidden className="mt-0.5 h-4 w-4 text-[#E7B48F]" /> Shop No 5, Phoenix Mall Road, Viman Nagar 411014</li>
              <li className="flex gap-3"><Phone aria-hidden className="mt-0.5 h-4 w-4 text-[#E7B48F]" /> +91 98765 43210</li>
              <li className="flex gap-3"><Mail aria-hidden className="mt-0.5 h-4 w-4 text-[#E7B48F]" /> hello@hairadore.in</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-serif text-lg text-white">Hours</h3>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex justify-between"><span>Mon–Fri</span><span>10 AM – 8 PM</span></li>
              <li className="flex justify-between"><span>Saturday</span><span>9 AM – 9 PM</span></li>
              <li className="flex justify-between"><span>Sunday</span><span>9 AM – 9 PM</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-700 pt-6 pb-16 text-center text-xs text-stone-500 md:pb-0">
          <p>© {new Date().getFullYear()} Hair Adore Salon. All Rights Reserved.</p>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/919876543210?text=Hi%20Hair%20Adore,%20I'd%20like%20to%20know%20more."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="focus-ring fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition-transform hover:scale-110"
      >
        <MessageCircle aria-hidden className="h-6 w-6" />
      </a>
    </div>
  );
}
