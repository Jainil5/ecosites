'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { animate } from 'framer-motion';
import { menuGroups, type MenuItem } from './menu';
import { inr, variantKey, type CartAction } from './cart';

const coffeeItems = menuGroups.find((g) => g.id === 'coffee')!.items;
const foodItems = menuGroups.find((g) => g.id === 'food')!.items;

const still = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface MiniBarrelProps {
  label: string;
  items: MenuItem[];
  selected: number;
  onSelect: (i: number) => void;
}

function MiniBarrel({ label, items, selected, onSelect }: MiniBarrelProps) {
  const n = items.length;
  const step = 360 / n;
  const ringRef = useRef<HTMLUListElement>(null);
  const posRef = useRef(selected);
  const animRef = useRef<{ stop: () => void } | null>(null);

  const setRot = useCallback(
    (pos: number) => ringRef.current?.style.setProperty('--rot', `${(-pos * step).toFixed(3)}deg`),
    [step],
  );

  const spinTo = useCallback(
    (i: number) => {
      const base = Math.round(posRef.current);
      let delta = i - (((base % n) + n) % n);
      if (delta > n / 2) delta -= n;
      if (delta < -n / 2) delta += n;
      const target = base + delta;
      animRef.current?.stop();
      if (still()) {
        posRef.current = target;
        setRot(target);
        onSelect(i);
        return;
      }
      animRef.current = animate(posRef.current, target, {
        type: 'spring',
        stiffness: 180,
        damping: 24,
        onUpdate: (v) => { posRef.current = v; setRot(v); },
        onComplete: () => onSelect(i),
      });
    },
    [n, setRot, onSelect],
  );

  useEffect(() => { setRot(posRef.current); }, [setRot]);

  useEffect(() => {
    if (n < 2 || still()) return;
    let next = Date.now() + 1200;
    const beat = setInterval(() => {
      if (animRef.current || document.visibilityState !== 'visible') { next = Math.max(next, Date.now() + 4000); return; }
      if (Date.now() < next) return;
      next += 4000;
      const cur = ((Math.round(posRef.current) % n) + n) % n;
      spinTo((cur + 1) % n);
    }, 250);
    return () => clearInterval(beat);
  }, [n, spinTo]);

  return (
    <div className="cc-combo-wheel" role="listbox" aria-label={label}>
      <p className="cc-display cc-combo-wheel-label">{label}</p>
      <div className="cc-combo-stage" style={{ '--n': n } as CSSProperties}>
        <ul ref={ringRef} className="cc-barrel-ring cc-combo-ring">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="cc-barrel-slot cc-combo-slot"
              style={{ '--a': `${(i * step).toFixed(3)}deg` } as CSSProperties}
            >
              <button
                type="button"
                role="option"
                aria-selected={i === selected}
                className="cc-barrel-card cc-combo-card"
                data-active={i === selected ? 'true' : 'false'}
                onClick={() => spinTo(i)}
              >
                <span className="cc-barrel-img">
                  <Image src={item.src} alt="" width={280} height={280} sizes="140px" className="!h-full !w-full object-cover" />
                </span>
                <span className="cc-barrel-cap">
                  <span className="cc-barrel-name">{item.name}</span>
                  <span className="cc-barrel-price">{item.price}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface ComboBuilderProps {
  dispatch: (action: CartAction) => void;
}

export function ComboBuilder({ dispatch }: ComboBuilderProps) {
  const [coffeeIdx, setCoffeeIdx] = useState(0);
  const [foodIdx, setFoodIdx] = useState(0);

  const coffee = coffeeItems[coffeeIdx];
  const food = foodItems[foodIdx];
  const comboPrice = coffee.amount + food.amount;

  const addCombo = () => {
    dispatch({ type: 'add', id: variantKey(coffee.id) });
    dispatch({ type: 'add', id: variantKey(food.id) });
  };

  return (
    <div className="cc-combo" aria-label="Build your combo">
      <div className="cc-combo-header">
        <h3 className="cc-display text-2xl text-[var(--cc-paper)]">Pick your perfect pair</h3>
        <p className="text-sm text-[rgba(251,244,233,0.72)]">
          Spin each wheel to settle on a coffee and a plate, then put the pair on your tray in one go.
        </p>
      </div>

      <div className="cc-combo-wheels">
        <MiniBarrel label="Coffee" items={coffeeItems} selected={coffeeIdx} onSelect={setCoffeeIdx} />
        <span className="cc-combo-plus" aria-hidden>+</span>
        <MiniBarrel label="Food" items={foodItems} selected={foodIdx} onSelect={setFoodIdx} />
      </div>

      <div className="cc-combo-summary">
        <div className="cc-combo-pair">
          <span>{coffee.name}</span>
          <span className="cc-combo-sep" aria-hidden>+</span>
          <span>{food.name}</span>
        </div>
        <div className="cc-combo-price">
          <span className="cc-display cc-combo-now">{inr(comboPrice)}</span>
        </div>
        <button type="button" className="cc-btn cc-btn-solid cc-combo-add" onClick={addCombo}>
          Add combo to order
        </button>
      </div>
    </div>
  );
}
