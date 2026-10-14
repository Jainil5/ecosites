import { Leaf } from 'lucide-react';
import { ContactRow } from '@/components/brand/ContactCta';
import { HeroPanel } from '@/components/brand/HeroPanel';
import { company } from '@/content/brand/company';

export function Hero() {
  return (
    <section className="animate-fade-up flex flex-wrap items-start gap-10 pt-6">
      <div className="min-w-[20rem] flex-1 space-y-6">
        <p className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 font-mono text-xs text-accent">
          <Leaf aria-hidden className="h-3.5 w-3.5" />
          {company.badge}
        </p>

        <h1 className="max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          <span className="text-foreground">Your business, </span>
          <span className="text-gradient text-glow">online</span>
          <span className="text-foreground"> and working for you.</span>
        </h1>

        <p className="max-w-2xl text-lg text-subtle">{company.pitch}</p>

        <ContactRow />
      </div>

      <HeroPanel />
    </section>
  );
}
