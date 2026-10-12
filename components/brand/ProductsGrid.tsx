import Link from 'next/link';
import { ArrowRight, Globe, MessagesSquare, Sparkles, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
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
    <section id="services" className="scroll-mt-24">
      <SectionHeading eyebrow="What we do" title="Three ways we help a shop grow">
        Start with a website, add the AI and automation when it earns for you.
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => {
          const Icon = ICONS[product.icon];
          return (
            <TiltCard key={product.slug} max={8} className="rounded-2xl">
              <div
                className="animate-fade-up flex h-full flex-col rounded-2xl glass p-6 shadow-card"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Icon aria-hidden className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-display text-xl text-foreground">{product.title}</h3>
                <p className="mt-2 text-sm text-subtle">{product.summary}</p>
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {product.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-sm text-foreground/85">
                      <span aria-hidden className="text-accent">
                        ·
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          );
        })}

        <TiltCard max={8} className="rounded-2xl">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-dashed border-accent/40 p-6">
            <div>
              <MessagesSquare aria-hidden className="h-6 w-6 text-accent" />
              <h3 className="mt-4 font-display text-xl text-foreground">Something else</h3>
              <p className="mt-2 text-sm text-subtle">
                Not sure what you need? Tell us what hurts in your business and we will say
                honestly whether we can help.
              </p>
            </div>
            <Link
              href="/contact"
              className="focus-ring mt-5 inline-flex cursor-pointer items-center gap-2 font-mono text-sm text-accent"
            >
              Talk to us
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
