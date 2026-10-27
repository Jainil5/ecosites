'use client';

import { useEffect, useRef } from 'react';

interface EmberFieldProps {
  className?: string;
  /** How many coals to keep in the air. */
  count?: number;
}

interface Coal {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  life: number;
  hue: number;
}

// A background never needs 60 frames, and this one now sits behind every panel
// on the page rather than only behind the hero.
const FRAME_MS = 1000 / 30;

/**
 * The hearth glow: a canvas of coals lifting off the bottom edge and dying out
 * as they climb. One rAF loop ticking at 30 fps, one canvas, and it stops itself
 * when the layer is off-screen or the tab is hidden — the effect never runs out
 * of sight. Under `prefers-reduced-motion` it paints one still scatter instead,
 * so the page keeps its warmth without the movement.
 */
export function EmberField({ className, count = 46 }: EmberFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let coals: Coal[] = [];
    let frame = 0;
    let running = false;
    let visible = true;
    let drift = 0;

    const seed = (c: Coal, fresh: boolean): Coal => {
      c.x = Math.random() * width;
      // Fresh coals start below the lip; the still frame scatters up the column.
      c.y = fresh ? height + Math.random() * 40 : Math.random() * height;
      c.r = 0.7 + Math.random() * 2.2;
      c.vy = 0.18 + Math.random() * 0.55;
      c.vx = (Math.random() - 0.5) * 0.22;
      c.life = fresh ? 1 : 0.35 + Math.random() * 0.65;
      c.hue = 12 + Math.random() * 26;
      return c;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      coals = Array.from({ length: count }, () => seed({} as Coal, false));
      if (reduce) paint();
    };

    function paint() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (const c of coals) {
        const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 5);
        glow.addColorStop(0, `hsla(${c.hue}, 100%, 62%, ${0.55 * c.life})`);
        glow.addColorStop(1, 'hsla(14, 100%, 50%, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // The canvas keeps asking for a frame every vsync, but the coals only move on
    // a 30 fps clock — a background field does not need to be any smoother.
    let last = 0;

    const step = (now: number) => {
      if (!running) return;
      frame = requestAnimationFrame(step);
      if (now - last < FRAME_MS) return;
      last = now;
      for (const c of coals) {
        c.y -= c.vy;
        // A lazy sway, plus a nudge toward wherever the pointer is.
        c.x += c.vx + Math.sin((c.y + c.r * 40) / 90) * 0.25 + drift * 0.02;
        c.life -= 0.0022;
        if (c.life <= 0 || c.y < -20) seed(c, true);
      }
      drift *= 0.94;
      paint();
    };

    // One loop, started and stopped as a pair — a second `requestAnimationFrame`
    // for the same field would double the coals every time the tab came back.
    const start = () => {
      if (reduce || running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      drift = (e.clientX - rect.left - rect.width / 2) / rect.width;
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) start();
        else stop();
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.addEventListener('visibilitychange', onVisibility);
    if (!reduce) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      start();
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
