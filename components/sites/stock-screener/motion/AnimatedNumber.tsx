'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useSpring } from 'framer-motion';
import { SPRINGS } from './tokens';
import { compact, inr, inrPlain, pct } from '../format';

export type NumberKind = 'inrPlain' | 'inr' | 'compact' | 'pct' | 'plain';

export interface AnimatedNumberProps {
  value: number | null | undefined;
  kind?: NumberKind;
  decimals?: number;
  className?: string;
  /** Pulse mp-flash-up/down on direction change. Off for derived stats like counts. */
  flash?: boolean;
}

function fmt(v: number, kind: NumberKind, decimals: number): string {
  switch (kind) {
    case 'inrPlain':
      return inrPlain(v, decimals);
    case 'inr':
      return inr(v);
    case 'compact':
      return compact(v);
    case 'pct':
      return pct(v);
    default:
      return v.toFixed(decimals);
  }
}

export function AnimatedNumber({ value, kind = 'plain', decimals = 2, className, flash }: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const spring = useSpring(value ?? 0, SPRINGS.number);
  const [shown, setShown] = useState(value ?? 0);
  const prevTarget = useRef<number | null>(value ?? null);
  const [dir, setDir] = useState<'up' | 'down' | 'flat'>('flat');

  useEffect(() => {
    if (value == null) return;
    if (prevTarget.current != null && value !== prevTarget.current) {
      setDir(value > prevTarget.current ? 'up' : 'down');
    }
    prevTarget.current = value;
    if (reduced) setShown(value);
    else spring.set(value);
  }, [value, reduced, spring]);

  useEffect(() => spring.on('change', (v) => setShown(v)), [spring]);

  if (value == null) return <span className={className}>—</span>;
  const flashClass = flash && dir !== 'flat' ? (dir === 'up' ? 'mp-flash-up' : 'mp-flash-down') : '';
  return (
    <span key={flash ? value : undefined} className={`${flashClass} rounded ${className ?? ''}`}>
      {fmt(shown, kind, decimals)}
    </span>
  );
}
