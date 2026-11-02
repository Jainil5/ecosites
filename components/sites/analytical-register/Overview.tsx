// components/sites/analytical-register/Overview.tsx
'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { useOrderBook } from './store';
import { computeKpis } from './analytics';
import { counterPath, editions } from './editions';
import { formatMoney } from './pricing';
import { AUDIENCES, CAPABILITIES, COUNTERS, DAY, HERO, SCOPE, TABS, type Capability } from './overview-data';
import type { Edition } from './editions';
import type { ObView } from './types';

const LABEL = Object.fromEntries(TABS.map((t) => [t.id, t.label])) as Record<ObView, string>;

function CounterCard({
  edition,
  active,
  index,
}: {
  edition: Edition;
  active: boolean;
  index: number;
}) {
  // The facts a visitor can check by opening it: what is on the menu, what tax
  // the bills carry, and when that trade actually happens.
  const facts = [
    `${edition.menu.length} items on the menu`,
    `${Math.round(edition.brand.gstRate * 100)}% GST split on every bill`,
    `opens ${String(edition.profile.openHour).padStart(2, '0')}:00`,
    `up to ${edition.profile.weekend} bills on a busy day`,
  ];
  return (
    <article className={`ob-card ob-counter${active ? ' ob-counter-on' : ''} flex flex-col p-5`}>
      <div className="flex items-start gap-3">
        <span className="ob-index" aria-hidden>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="ob-eyebrow">{edition.kicker}</p>
          <h3 className="mt-1 text-[18px] font-extrabold leading-snug">{edition.label}</h3>
        </div>
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-snug ob-accent-text">{edition.line}</p>
      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed">
        {edition.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="ob-bullet" aria-hidden />
            <span className="min-w-0 text-[var(--ob-muted)]">{b}</span>
          </li>
        ))}
      </ul>
      <ul className="ob-facts mt-4">
        {facts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Each counter is a place you go, not a setting you flip: the till and
            its report have their own address, so either can be sent to someone. */}
        <Link href={counterPath(edition)} className={active ? 'ob-btn-ghost' : 'ob-btn'}>
          {active ? `This counter is open` : `Open the ${edition.brand.name} till`}
        </Link>
        <Link href={`${counterPath(edition)}#analytics`} className="ob-live">
          See its numbers
        </Link>
      </div>
    </article>
  );
}

function SectionHead({ id, kicker, title, lead }: { id: string; kicker: string; title: string; lead: string }) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="ob-eyebrow">{kicker}</p>
      <h2 id={id} className="mt-2 text-2xl font-extrabold sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--ob-muted)]">{lead}</p>
    </div>
  );
}

function CapabilityCard({
  cap,
  index,
  onOpen,
}: {
  cap: Capability;
  index: number;
  onOpen: (view: ObView) => void;
}) {
  // A local const, so the click handler knows the tab it is jumping to exists.
  const live = cap.live;
  return (
    <article className="ob-card flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span className="ob-index" aria-hidden>
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="text-[17px] font-bold leading-snug">{cap.name}</h3>
      </div>
      <p className="mt-2 text-[15px] font-semibold leading-snug ob-accent-text">{cap.line}</p>
      <ul className="mt-3 flex-1 space-y-1.5 text-sm leading-relaxed">
        {cap.items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="ob-bullet" aria-hidden />
            <span className="min-w-0 text-[var(--ob-muted)]">{it}</span>
          </li>
        ))}
      </ul>
      {live && (
        <button className="ob-live mt-4 self-start" onClick={() => onOpen(live)}>
          Runs here — open {LABEL[live]}
        </button>
      )}
    </article>
  );
}

export function Overview({ onOpen }: { onOpen: (view: ObView) => void }) {
  const { state } = useOrderBook();
  const cur = state.brand.currency;

  // The introduction quotes the build's own figures rather than invented
  // marketing numbers: what the order book on this counter actually holds.
  const shown = useMemo(() => {
    const kpis = computeKpis(state.orders);
    const days = new Set(state.orders.map((o) => o.createdAt.slice(0, 10))).size;
    return {
      bills: kpis.orders,
      revenue: formatMoney(kpis.revenue, cur),
      aov: formatMoney(kpis.aov, cur),
      days,
      items: state.menu.filter((m) => m.active).length,
    };
  }, [state.orders, state.menu, cur]);

  const stats = [
    { label: 'Bills written', value: shown.bills.toLocaleString('en-IN') },
    { label: 'Billed in total', value: shown.revenue },
    { label: 'Average bill', value: shown.aov },
    { label: 'Trading days covered', value: String(shown.days) },
    { label: 'Items on the counter', value: String(shown.items) },
  ];

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* ----------------------------------------------------------- the pitch */}
      <section className="ob-hero ob-card ob-rise p-6 sm:p-9" aria-labelledby="ob-intro-title">
        <p className="ob-eyebrow">{HERO.eyebrow}</p>
        <h1 id="ob-intro-title" className="mt-3 max-w-4xl text-3xl font-extrabold leading-[1.15] sm:text-4xl">
          {HERO.headline}
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[var(--ob-muted)] sm:text-base">
          {HERO.body}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button className="ob-btn" onClick={() => onOpen('register')}>
            Open the register
          </button>
          <button className="ob-btn-ghost" onClick={() => onOpen('analytics')}>
            Read the numbers
          </button>
          <Link href="/contact" className="focus-ring ob-btn-ghost inline-flex items-center">
            Ask for a build like this
          </Link>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[var(--ob-muted)]">{HERO.honesty}</p>

        <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--ob-line)] bg-[var(--ob-line)] sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="bg-[var(--ob-card)] px-4 py-3">
              <dt className="text-xs font-semibold text-[var(--ob-muted)]">{s.label}</dt>
              <dd className="mt-1 text-xl font-extrabold tabular-nums ob-accent-text">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* --------------------------------------------------- the three counters */}
      <section aria-labelledby="ob-counters-title">
        <SectionHead
          id="ob-counters-title"
          kicker={COUNTERS.kicker}
          title={COUNTERS.title}
          lead={COUNTERS.lead}
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {editions.map((e, i) => (
            <CounterCard key={e.id} edition={e} index={i} active={e.id === state.edition} />
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--ob-muted)]">
          This page is running on <b className="ob-accent-text">{state.brand.name}</b> —{' '}
          {state.menu.filter((m) => m.active).length} items, {Math.round(state.brand.gstRate * 100)}% GST.
          Every counter above opens at its own address with that business’s catalogue, tax split and book.
        </p>
      </section>

      {/* -------------------------------------------------------- trading day */}
      <section aria-labelledby="ob-day-title">
        <SectionHead
          id="ob-day-title"
          kicker="A day on OrderBook"
          title="What the day looks like once it is running"
          lead="Seven moments, in the order an owner meets them. Every line is a job the system takes off someone in the room."
        />
        <ol>
          {DAY.map((s) => (
            <li key={s.clock} className="ob-day-step">
              <span className="ob-day-clock">{s.clock}</span>
              <div className="min-w-0">
                <h3 className="font-bold">{s.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-[var(--ob-muted)]">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ----------------------------------------------------- what is inside */}
      <section aria-labelledby="ob-cap-title">
        <SectionHead
          id="ob-cap-title"
          kicker="Everything inside it"
          title={`${CAPABILITIES.length} groups, one bill running through all of them`}
          lead="Ordering, kitchen, stock, staff, money and the numbers — the parts a food business normally pays for as six separate subscriptions and reconciles by hand. The ones marked here are running on this page."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CAPABILITIES.map((c, i) => (
            <CapabilityCard key={c.name} cap={c} index={i} onOpen={onOpen} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ who for */}
      <section aria-labelledby="ob-aud-title">
        <SectionHead
          id="ob-aud-title"
          kicker="Where it fits"
          title="Same engine, bent to your counter"
          lead="We build it around the trade you are in: what a table means, what a pour costs, whether the guest pays before or after."
        />
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {AUDIENCES.map((a) => (
            <li key={a.name} className="ob-card p-4">
              <h3 className="font-bold">{a.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ob-muted)]">{a.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------- the honest half */}
      <section aria-labelledby="ob-scope-title">
        <SectionHead
          id="ob-scope-title"
          kicker="No claim you cannot check"
          title="What runs here, and what is the build"
          lead="Every line below is either running on this page or named as the work we do around your business."
        />
        <div className="grid gap-3 lg:grid-cols-2">
          {SCOPE.map((col, i) => (
            <article key={col.heading} className={`ob-card p-5${i === 0 ? ' ob-scope-live' : ''}`}>
              <h3 className="text-lg font-bold">{col.heading}</h3>
              <p className="mt-1 text-sm text-[var(--ob-muted)]">{col.note}</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed">
                {col.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className={`ob-mark ${i === 0 ? 'ob-mark-on' : 'ob-mark-off'}`} aria-hidden />
                    <span className="min-w-0">{it}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- the ask */}
      <section className="ob-hero ob-card p-6 text-center sm:p-9" aria-labelledby="ob-ask-title">
        <h2 id="ob-ask-title" className="mx-auto max-w-2xl text-2xl font-extrabold sm:text-3xl">
          Run your menu on it
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ob-muted)]">
          Drive the counter you ran above, or send us your menu and we will show you the same screens carrying your
          items, your rates and your taxes.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button className="ob-btn" onClick={() => onOpen('menu')}>
            Change the menu
          </button>
          <button className="ob-btn-ghost" onClick={() => onOpen('settings')}>
            Put your brand on it
          </button>
          <Link href="/contact" className="focus-ring ob-btn-ghost inline-flex items-center">
            Talk to us
          </Link>
        </div>
      </section>
    </div>
  );
}
