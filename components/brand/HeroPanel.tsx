import { products } from '@/content/brand/products';
import { Logo } from '@/components/brand/Logo';

/**
 * Decorative hero visual: a browser window standing in space, each product
 * on its own depth plane. CSS-only — no canvas, no 3D library.
 */
export function HeroPanel() {
  return (
    <div aria-hidden className="scene-wide hidden shrink-0 lg:block">
      <div className="hero-panel w-[22rem] rounded-2xl glass bg-surface shadow-glow-lg">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
          <span className="ml-2 h-5 flex-1 rounded-md bg-white/5" />
        </div>

        <div className="relative px-5 py-8">
          <Logo className="mx-auto h-16 w-16 text-accent" />
          <div className="mt-7 space-y-3">
            {products.map((product, i) => (
              <div
                key={product.slug}
                className="hero-chip rounded-xl px-4 py-2.5 font-mono text-sm text-foreground"
                style={{ transform: `translateZ(${34 - i * 12}px)` }}
              >
                {product.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
