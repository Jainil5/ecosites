'use client';

import { useEffect, useRef } from 'react';
import type { BrandEffect } from './BrandBackground';

/**
 * Per-effect camera and water parameters. The mesh is the same object on
 * every route; only how it moves changes, so the brand reads as one film
 * with three cuts rather than three unrelated animations.
 *
 * crest  — spatial frequency of the travelling wave (higher = tighter ripples)
 * speed  — how fast a crest walks toward the camera
 * yaw    — how far the vanishing point swings sideways over time
 * glow   — brightness multiplier on the two drifting light bodies
 */
const EFFECTS: Record<BrandEffect, { crest: number; speed: number; yaw: number; glow: number }> = {
  ripple: { crest: 0.7, speed: 1.05, yaw: 0.0, glow: 1.1 },
  wave: { crest: 0.55, speed: 1.5, yaw: 0.06, glow: 0.85 },
  orbit: { crest: 0.62, speed: 0.8, yaw: 0.34, glow: 1.45 },
};

// The two brand colours the field is lit with, kept as canvas colour triplets
// because a CSS variable cannot be composed into a per-frame gradient stop.
const PLANE_RGB = '34, 197, 94';
const LIME_RGB = '190, 242, 100';

const ROWS = 15; // depth samples between the camera and the horizon
const COLS = 21; // world-space columns of the mesh
const SEGMENTS = 26; // points per row, so a crest draws as a curve not a rule
const FRAME_MS = 1000 / 30; // capped frame rate; a background never needs 60

export function MotionField({ effect }: { effect: BrandEffect }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const params = EFFECTS[effect];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0 };

    let width = 0;
    let height = 0;

    const resize = () => {
      // DPR is capped: this layer sits behind frosted glass and a 3x buffer
      // would cost the whole frame budget for pixels the blur discards.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /**
     * One frame of the plane. World space is a floor: `x` across, `z` away
     * from the camera. A point projects with a fixed focal length, which is
     * what makes the columns converge on the vanishing point on their own.
     */
    const draw = (t: number) => {
      if (!width || !height) return;

      const horizonY = height * 0.52;
      const focal = height * 0.62;
      const sway = Math.sin(t * 0.12) * params.yaw;
      const vanishX = width / 2 + pointer.x * 26 + sway * width * 0.16;
      const vanishY = horizonY + pointer.y * 16;

      ctx.clearRect(0, 0, width, height);

      // Light bodies: two blurred lamps sliding on slow ellipses behind the mesh.
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i += 1) {
        const phase = t * (0.09 + i * 0.04) + i * 2.4;
        const cx = width * (0.5 + Math.cos(phase) * (0.26 + i * 0.08));
        const cy = height * (0.52 + Math.sin(phase * 1.3) * 0.2);
        const radius = Math.max(width, height) * (0.3 + i * 0.1);
        const rgb = i === 0 ? PLANE_RGB : LIME_RGB;
        const alpha = (i === 0 ? 0.14 : 0.08) * params.glow;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        glow.addColorStop(0, `rgba(${rgb}, ${alpha})`);
        glow.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = 'source-over';

      /** Screen position of a world point, with the crest displacement applied. */
      const project = (x: number, z: number) => {
        const scale = focal / z;
        // Ripple reads distance from one submerged point, so its crests spread
        // as rings; the other cuts measure distance straight down the plane.
        const phase = effect === 'ripple' ? Math.hypot(x * 1.6, z) : z;
        const crest = Math.sin(phase * params.crest - t * params.speed) * 0.55;
        // Near rows move further than far rows: the same wave, seen in perspective.
        const lift = crest * height * 0.05 * (4 / z);
        // The floor drops away below the horizon: a nearer row (small z) lands
        // lower on screen, which is what makes the columns converge upward.
        return { sx: vanishX + x * scale, sy: vanishY + scale * 0.85 + lift };
      };

      const zNear = 1.6;
      const zFar = 26;

      ctx.lineWidth = 1;

      // Depth rows, far to near, so the closest line lays over the rest.
      for (let r = ROWS - 1; r >= 0; r -= 1) {
        const depth = zNear + ((zFar - zNear) * r) / (ROWS - 1);
        const fade = 1 - r / (ROWS - 1);
        const alpha = 0.05 + fade * 0.16;
        ctx.strokeStyle = `rgba(${PLANE_RGB}, ${alpha})`;
        ctx.beginPath();
        for (let s = 0; s <= SEGMENTS; s += 1) {
          const x = (s / SEGMENTS - 0.5) * COLS;
          const { sx, sy } = project(x, depth);
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }

      // Columns: straight in world space, converging on screen.
      for (let c = 0; c <= COLS; c += 1) {
        const x = (c / COLS - 0.5) * COLS * 1.1;
        const edge = Math.abs(x) / (COLS * 0.55);
        ctx.strokeStyle = `rgba(${LIME_RGB}, ${0.05 + (1 - edge) * 0.08})`;
        ctx.beginPath();
        for (let s = 0; s <= 12; s += 1) {
          const depth = zNear + ((zFar - zNear) * s) / 12;
          const { sx, sy } = project(x, depth);
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    };

    resize();

    if (reduce) {
      // One composed still frame: the field still gives the page depth, it
      // simply never moves. Resize repaints so the still never distorts.
      draw(0);
      const onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    let raf = 0;
    let last = 0;
    let elapsed = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const delta = now - last;
      if (delta < FRAME_MS) return;
      last = now;
      elapsed += Math.min(delta, 100) / 1000; // clamp so a backgrounded tab does not jump
      draw(elapsed);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('visibilitychange', onVisibility);
    last = performance.now();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [effect]);

  return <canvas ref={canvasRef} className="brand-bg-motion" />;
}
