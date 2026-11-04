'use client';

import type { CSSProperties } from 'react';

/**
 * Hop cones and rising bubbles adrift behind the hero and the menu board.
 * Positions, sizes and hues are hand-placed once so the field reads
 * art-directed, and CSS owns the loop — a reduced-motion browser simply
 * gets still hops.
 */
interface Hop {
  x: string;
  y: string;
  s: number;
  op: number;
  fill: string;
  crease: string;
  dur: string;
  delay: string;
  dx: string;
  dy: string;
  r1: string;
  r2: string;
  /** Bubbles drift straight up; cones tumble. */
  bubble?: boolean;
}

const HOP = ['#7d9b4e', '#56743a', '#9ab45f', '#d9e3a8', '#b8721d'];

const HOPS: Hop[] = [
  { x: '6%', y: '12%', s: 30, op: 0.5, fill: HOP[0], crease: '#22331a', dur: '9s', delay: '0s', dx: '18px', dy: '-26px', r1: '-20deg', r2: '14deg' },
  { x: '84%', y: '8%', s: 22, op: 0.42, fill: HOP[2], crease: '#22331a', dur: '11s', delay: '-2s', dx: '-22px', dy: '18px', r1: '30deg', r2: '-8deg' },
  { x: '14%', y: '72%', s: 26, op: 0.4, fill: HOP[1], crease: '#e6efc8', dur: '13s', delay: '-5s', dx: '26px', dy: '-16px', r1: '12deg', r2: '-26deg' },
  { x: '72%', y: '64%', s: 34, op: 0.34, fill: HOP[0], crease: '#22331a', dur: '10s', delay: '-1s', dx: '-14px', dy: '-28px', r1: '-34deg', r2: '10deg' },
  { x: '44%', y: '22%', s: 18, op: 0.5, fill: HOP[3], crease: '#4c6b2c', dur: '12s', delay: '-7s', dx: '16px', dy: '22px', r1: '24deg', r2: '-14deg' },
  { x: '28%', y: '40%', s: 24, op: 0.3, fill: HOP[1], crease: '#e6efc8', dur: '14s', delay: '-3s', dx: '-24px', dy: '-14px', r1: '6deg', r2: '38deg' },
  { x: '60%', y: '84%', s: 20, op: 0.4, fill: HOP[2], crease: '#22331a', dur: '9.5s', delay: '-6s', dx: '20px', dy: '-22px', r1: '-12deg', r2: '22deg' },
  { x: '90%', y: '38%', s: 26, op: 0.36, fill: HOP[0], crease: '#e6efc8', dur: '11.5s', delay: '-9s', dx: '-18px', dy: '24px', r1: '40deg', r2: '-6deg' },
  { x: '4%', y: '46%', s: 20, op: 0.44, fill: HOP[4], crease: '#22331a', dur: '13.5s', delay: '-4s', dx: '22px', dy: '-18px', r1: '-28deg', r2: '16deg' },
  { x: '36%', y: '90%', s: 16, op: 0.5, fill: HOP[3], crease: '#4c6b2c', dur: '8.5s', delay: '-2.5s', dx: '-16px', dy: '-24px', r1: '18deg', r2: '-30deg' },
  { x: '54%', y: '8%', s: 22, op: 0.32, fill: HOP[1], crease: '#e6efc8', dur: '12.5s', delay: '-8s', dx: '14px', dy: '26px', r1: '-6deg', r2: '28deg' },
  { x: '78%', y: '26%', s: 16, op: 0.46, fill: HOP[2], crease: '#22331a', dur: '10.5s', delay: '-5.5s', dx: '-26px', dy: '14px', r1: '34deg', r2: '-12deg' },
  { x: '20%', y: '18%', s: 18, op: 0.38, fill: HOP[0], crease: '#e6efc8', dur: '14.5s', delay: '-11s', dx: '18px', dy: '20px', r1: '-40deg', r2: '8deg' },
  { x: '66%', y: '48%', s: 28, op: 0.26, fill: HOP[1], crease: '#fdf8ef', dur: '15s', delay: '-7.5s', dx: '-20px', dy: '-26px', r1: '10deg', r2: '-34deg' },
  { x: '40%', y: '62%', s: 16, op: 0.42, fill: HOP[4], crease: '#22331a', dur: '9s', delay: '-3.5s', dx: '24px', dy: '16px', r1: '-16deg', r2: '26deg' },
  { x: '94%', y: '80%', s: 22, op: 0.34, fill: HOP[2], crease: '#e6efc8', dur: '11s', delay: '-10s', dx: '-14px', dy: '-20px', r1: '28deg', r2: '-18deg' },
  { x: '12%', y: '28%', s: 10, op: 0.5, fill: '#fdf8ef', crease: '#fdf8ef', dur: '7s', delay: '-1.5s', dx: '4px', dy: '-40px', r1: '0deg', r2: '0deg', bubble: true },
  { x: '48%', y: '78%', s: 8, op: 0.42, fill: '#fdf8ef', crease: '#fdf8ef', dur: '8.5s', delay: '-3.2s', dx: '-6px', dy: '-34px', r1: '0deg', r2: '0deg', bubble: true },
  { x: '82%', y: '54%', s: 12, op: 0.36, fill: '#fdf8ef', crease: '#fdf8ef', dur: '9.5s', delay: '-6.4s', dx: '3px', dy: '-46px', r1: '0deg', r2: '0deg', bubble: true },
  { x: '26%', y: '58%', s: 9, op: 0.44, fill: '#fdf8ef', crease: '#fdf8ef', dur: '8s', delay: '-4.7s', dx: '5px', dy: '-38px', r1: '0deg', r2: '0deg', bubble: true },
];

export function HopField({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`br-hop-field ${className}`}>
      {HOPS.map((b, i) => (
        <svg
          key={i}
          className={b.bubble ? 'br-hop br-bubble' : 'br-hop'}
          viewBox="0 0 32 22"
          style={
            {
              '--x': b.x,
              '--y': b.y,
              '--sw': `${b.s}px`,
              '--op': b.op,
              '--dur': b.dur,
              '--delay': b.delay,
              '--dx': b.dx,
              '--dy': b.dy,
              '--r1': b.r1,
              '--r2': b.r2,
            } as CSSProperties
          }
        >
          {b.bubble ? (
            <circle cx="16" cy="11" r="9" fill={b.fill} fillOpacity="0.28" />
          ) : (
            <>
              <path
                d="M16 2.5c6 4.8 9.2 10.8 9.2 15.9 0 4.8-4.1 8.1-9.2 8.1s-9.2-3.3-9.2-8.1C6.8 13.3 10 7.3 16 2.5z"
                fill={b.fill}
              />
              <path
                d="M10 15c3.9 2.4 8.1 2.4 12 0M9 20.5c4.5 2.6 9.5 2.6 14 0"
                fill="none"
                stroke={b.crease}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      ))}
    </div>
  );
}
