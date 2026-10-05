'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt angle in degrees. */
  max?: number;
}

// Pointer-driven 3D tilt with a moving glare. Honors prefers-reduced-motion
// (the global CSS collapses transitions) and resets on pointer leave.
export function TiltCard({ children, className = '', max = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * (max * 2);
    const rotateX = (0.5 - py) * (max * 2);
    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.02)`,
    );
    setGlare({ x: px * 100, y: py * 100, opacity: 0.35 });
  }

  function reset() {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setGlare((g) => ({ ...g, opacity: 0 }));
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ transform, willChange: 'transform' }}
      className={`preserve-3d relative transition-transform duration-200 ease-out ${className}`}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.18), transparent 45%)`,
        }}
      />
    </div>
  );
}
