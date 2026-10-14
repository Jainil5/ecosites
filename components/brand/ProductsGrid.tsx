import Link from 'next/link';
import { ArrowRight, MessagesSquare, Globe, Sparkles, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { Icon3D } from '@/components/Icon3D';
import { TiltCard } from '@/components/TiltCard';
import { products } from '@/content/brand/products';
import type { ProductIcon } from '@/content/brand/types';

const ICONS: Record<ProductIcon, LucideIcon> = {
  globe: Globe,
  sparkles: Sparkles,
  workflow: Workflow,
};

export function ProductsGrid() {
  return (
    <section id="services" className="reveal scroll-mt-24">
      <SectionHeading eyebrow="What we do" title="Three ways we help a business grow">
        Start with a website, add the AI and automation when it earns for you.
      </SectionHeading>

      <div className="scene-wide grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => {
          const Icon = ICONS[product.icon];
          const first = i === 0;
          return (
            <div
              key={product.slug}
              className="plate-in"
              style={{ '--drift': `${1.8 + i * 0.9}rem` } as CSSProperties}
            >
              <TiltCard max={7} className="h-full rounded-2xl">
                <div
                  className={`edge group flex h-full flex-col rounded-2xl p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover ${
                    first
                      ? 'bg-gradient-to-b from-accent/[0.13] to-white/[0.02]'
                      : 'bg-gradient-to-b from-white/[0.06] to-white/[0.015]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon3D icon={Icon} className="pb-5" />
                    {/* The order is the advice: website first, then the rest. */}
                    <span
                      aria-hidden
                      className={`font-mono text-xs ${first ? 'text-accent' : 'text-subtle/70'}`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-foreground">{product.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-subtle">{product.summary}</p>

                  {first ? (
                    <p className="mt-4 w-fit rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[11px] text-accent">
                      Start here
                    </p>
                  ) : null}

                  <ul className="mt-5 space-y-2 border-t border-white/[0.08] pt-4">
                    {product.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-2.5 text-sm leading-snug text-foreground/85"
                      >
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </div>
          );
        })}
      </div>

      <TiltCard max={4} className="mt-5 rounded-2xl">
        <div className="edge beacon flex flex-col justify-between gap-6 rounded-2xl bg-gradient-to-r from-white/[0.07] via-white/[0.03] to-accent/[0.08] p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <MessagesSquare aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
            <div>
              <h3 className="font-display text-xl text-foreground">Something else</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-subtle">
                Not sure what you need? Tell us what hurts in your business and we will say honestly
                whether we can help.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="focus-ring inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white/[0.07] px-4 py-2.5 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-background"
          >
            Talk to us
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </TiltCard>
    </section>
  );
}
