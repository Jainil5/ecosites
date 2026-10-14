import { Leaf } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';
import { ContactRow } from '@/components/brand/ContactCta';
import { HeroPanel } from '@/components/brand/HeroPanel';
import { company } from '@/content/brand/company';

/** One line of headline type, revealed by sliding out of its own slice. */
function Slice({ children, index }: { children: ReactNode; index: number }) {
  return (
    <span className="slice">
      <span
        className="slice-inner"
        style={{ '--delay': `${120 + index * 130}ms` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  return (
    <section className="flex flex-wrap items-center gap-x-12 gap-y-12 pt-4">
      <div className="min-w-[20rem] flex-1 space-y-7">
        <p className="edge animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3.5 py-1.5 font-mono text-xs tracking-wide text-accent">
          <Leaf aria-hidden className="h-3.5 w-3.5" />
          {company.badge}
        </p>

        <h1 className="max-w-3xl font-display text-[2.125rem] leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.06]">
          <Slice index={0}>Your business,</Slice>
          <Slice index={1}>
            <span className="text-gradient text-glow">online</span>
          </Slice>
          <Slice index={2}>and working for you.</Slice>
        </h1>

        <p className="max-w-xl animate-fade-up border-l-2 border-accent/40 pl-4 text-lg leading-relaxed text-subtle [animation-delay:480ms]">
          {company.pitch}
        </p>

        <div className="animate-fade-up [animation-delay:600ms]">
          <ContactRow />
        </div>
      </div>

      <HeroPanel />
    </section>
  );
}

