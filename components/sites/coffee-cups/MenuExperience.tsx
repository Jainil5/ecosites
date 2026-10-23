'use client';

import { useEffect, useReducer, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import Image from 'next/image';
import { isRecommended, menuGroups } from './menu';
import { BeansField } from './BeansField';
import { cartReducer, loadCart, saveCart } from './cart';
import { OrderTray } from './OrderTray';
import { ItemDialog } from './ItemDialog';
import { BarrelGallery } from './BarrelGallery';
import { Reveal } from './Reveal';

type Mode = 'genz' | 'trad';

const allItems = menuGroups.flatMap((group) =>
  group.items.map((item) => ({ item, groupTitle: group.title, groupId: group.id })),
);

function MenuStar({ label }: { label: string }) {
  return (
    <span className="cc-card-star" aria-hidden>
      <svg viewBox="0 0 24 24" className="cc-star-icon" aria-hidden>
        <path
          d="M12 2.6l2.6 6 6.4.6-4.8 4.3 1.4 6.3L12 16.6 6.4 19.8l1.4-6.3L3 9.2l6.4-.6z"
          fill="currentColor"
        />
      </svg>
      <span className="cc-card-star-label">{label}</span>
    </span>
  );
}

const TILT_DEG = 7;
const DRIFT_PX = 10;

// 3D lean toward the cursor; CSS only applies it under (hover: hover),
// and phones never fire pointermove over a still card.
function tiltTo(e: PointerEvent<HTMLButtonElement>) {
  if (!window.matchMedia('(hover: hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const t = e.currentTarget;
  const r = t.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  t.style.setProperty('--ry', `${(x * 2 * TILT_DEG).toFixed(2)}deg`);
  t.style.setProperty('--rx', `${(-y * 2 * TILT_DEG).toFixed(2)}deg`);
  t.style.setProperty('--px', `${(-x * DRIFT_PX).toFixed(1)}px`);
  t.style.setProperty('--py', `${(-y * DRIFT_PX).toFixed(1)}px`);
}

function untilt(e: PointerEvent<HTMLButtonElement>) {
  const style = e.currentTarget.style;
  for (const v of ['--rx', '--ry', '--px', '--py']) style.removeProperty(v);
}

export function MenuExperience() {
  const [mode, setMode] = useState<Mode>('genz');
  const [cat, setCat] = useState<'all' | string>('coffee');
  const [openedId, setOpenedId] = useState<string | null>(null);

  const [cart, dispatch] = useReducer(cartReducer, {});
  const [cartReady, setCartReady] = useState(false);

  // Session cart: hydrate from this tab's sessionStorage, then mirror every change.
  useEffect(() => {
    dispatch({ type: 'replace', state: loadCart(window.sessionStorage) });
    setCartReady(true);
  }, []);
  useEffect(() => {
    if (cartReady) saveCart(window.sessionStorage, cart);
  }, [cart, cartReady]);

  const opened = openedId ? allItems.find((x) => x.item.id === openedId) : null;
  const visible = allItems.filter((x) => cat === 'all' || x.groupId === cat);
  const activeGroup = menuGroups.find((g) => g.id === cat);
  const tabGroups = [
    ...menuGroups.filter((g) => g.id === 'coffee'),
    ...menuGroups.filter((g) => g.id !== 'coffee'),
  ];

  return (
    <section id="top" aria-label="The menu" className="cc-menu relative">
      <div aria-hidden className="cc-pick-wash" />
      <div aria-hidden className="cc-stains" />
      <div aria-hidden className="cc-beans" />
      <BeansField />
      <div aria-hidden className="cc-hero-grain absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-14">
        <h1 className="sr-only">Coffee Cups — the whole menu, straight up</h1>
        <Reveal>
          <p className="cc-display text-[11px] uppercase tracking-[0.26em] text-[rgba(251,244,233,0.78)]">
            The whole menu, straight up
          </p>
        </Reveal>

        <div id="menu" className="scroll-mt-24">
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            <div className="min-w-0">
              <Reveal>
                <div className="cc-cat-tabs" role="tablist" aria-label="Menu section">
                  {tabGroups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      role="tab"
                      aria-selected={cat === g.id}
                      className="cc-display cc-cat-tab"
                      onClick={() => setCat(g.id)}
                    >
                      {g.title}
                    </button>
                  ))}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={cat === 'all'}
                    className="cc-display cc-cat-tab"
                    onClick={() => setCat('all')}
                  >
                    All
                  </button>
                </div>
              </Reveal>

              <Reveal>
                {mode === 'trad' ? (
                  <div className="cc-menu-list">
                    {tabGroups
                      .filter((g) => cat === 'all' || g.id === cat)
                      .map((group) => (
                        <section key={group.id} aria-label={group.title}>
                          <h2 className="cc-serif cc-list-heading">{group.title}</h2>
                          {group.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="cc-list-row"
                              onClick={() => setOpenedId(item.id)}
                              aria-label={`${item.name}, ${item.price}, ${group.title}. Open for details`}
                            >
                              <span className="cc-list-thumb">
                                <Image
                                  src={item.src}
                                  alt=""
                                  width={96}
                                  height={96}
                                  className="!h-full !w-full object-cover"
                                />
                              </span>
                              <span className="cc-list-name">{item.name}</span>
                              {isRecommended(item) ? (
                                <span className="cc-list-star" aria-hidden>
                                  ★
                                </span>
                              ) : null}
                              <span className="cc-list-leader" aria-hidden />
                              {cart[item.id] ? (
                                <span className="cc-list-qty" aria-label={`${cart[item.id]} on your tray`}>
                                  {cart[item.id]}
                                </span>
                              ) : null}
                              <span className="cc-list-price">{item.price}</span>
                            </button>
                          ))}
                        </section>
                      ))}
                  </div>
                ) : cat === 'all' ? (
                  <div className="cc-square-grid">
                  {visible.map(({ item, groupTitle }, i) => (
                    <button
                      key={item.id}
                      type="button"
                      className="cc-tile"
                      style={{ '--i': i } as CSSProperties}
                      onClick={() => setOpenedId(item.id)}
                      onPointerMove={tiltTo}
                      onPointerLeave={untilt}
                      aria-label={`${item.name}, ${item.price}, ${groupTitle}. Open for details`}
                    >
                      <span className="cc-tile-img">
                        <Image
                          src={item.src}
                          alt=""
                          width={480}
                          height={480}
                          priority={i < 4}
                          loading={i < 4 ? undefined : 'lazy'}
                          className="!h-full !w-full object-cover"
                        />
                      </span>
                      {isRecommended(item) ? <MenuStar label={item.badge ?? 'House pick'} /> : null}
                      <span className="cc-tile-cat">{groupTitle}</span>
                      <span className="cc-tile-cap">
                        <span className="cc-tile-name">{item.name}</span>
                        <span className="cc-tile-price">{item.price}</span>
                        <span className="cc-tile-note">{item.note}</span>
                      </span>
                      {cart[item.id] ? (
                        <span className="cc-tile-qty" aria-label={`${cart[item.id]} on your tray`}>
                          {cart[item.id]}
                        </span>
                      ) : null}
                    </button>
                  ))}
                  </div>
                ) : (
                  /* One section at a time goes on the barrel: the cards stand
                     around a cylinder and the customer spins the board. */
                  <BarrelGallery
                    key={cat}
                    label={activeGroup?.title ?? 'Menu'}
                    entries={visible}
                    cart={cart}
                    onOpen={setOpenedId}
                  />
                )}
              </Reveal>

              <Reveal delay={80}>
                <div className="cc-menu-foot">
                  <div className="cc-mode" role="group" aria-label="Menu style">
                    <span
                      aria-hidden
                      className="cc-mode-pill"
                      style={{ '--pos': mode === 'genz' ? 0 : 1 } as CSSProperties}
                    />
                    {(['genz', 'trad'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={m === mode}
                        className="cc-display cc-mode-btn"
                        onClick={() => setMode(m)}
                      >
                        {m === 'genz' ? 'Gen Z' : 'Traditional'}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a href="/coffee-cups#visit" className="focus-ring cc-btn cc-btn-cream">
                      Find the door
                    </a>
                    <a href="/coffee-cups#room" className="focus-ring cc-btn cc-btn-ghost">
                      See the room
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>

            <OrderTray cart={cart} dispatch={dispatch} />
          </div>
        </div>
      </div>

      {opened ? (
        <ItemDialog
          item={opened.item}
          groupTitle={opened.groupTitle}
          qty={cart[opened.item.id] ?? 0}
          dispatch={dispatch}
          onClose={() => setOpenedId(null)}
        />
      ) : null}
    </section>
  );
}
