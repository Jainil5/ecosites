import { Leaf } from 'lucide-react';
import { ContactRow } from '@/components/brand/ContactCta';
import { HeroPanel } from '@/components/brand/HeroPanel';
import { company } from '@/content/brand/company';

export function Hero() {
  return (
    <section className="animate-fade-up flex flex-wrap items-center gap-x-12 gap-y-12 pt-4">
      <div className="min-w-[20rem] flex-1 space-y-7">
        <p className="edge inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3.5 py-1.5 font-mono text-xs tracking-wide text-accent">
          <Leaf aria-hidden className="h-3.5 w-3.5" />
          {company.badge}
        </p>

        <h1 className="max-w-3xl font-display text-[2.125rem] leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.06]">
          <span className="text-foreground">Your business, </span>
          <span className="text-gradient text-glow">online</span>
          <span className="text-foreground"> and working for you.</span>
        </h1>

        <p className="max-w-xl border-l-2 border-accent/40 pl-4 text-lg leading-relaxed text-subtle">
          {company.pitch}
        </p>

        <ContactRow />
      </div>

      <HeroPanel />
    </section>
  );
}
