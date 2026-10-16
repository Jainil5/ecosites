import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';
import { ContactRow } from '@/components/brand/ContactCta';
import { Logo3D } from '@/components/brand/Logo3D';
import { SiteCompiler } from '@/components/brand/SiteCompiler';

/** One line of the manifesto, revealed by sliding out of its own slice. */
function Slice({ children, index }: { children: ReactNode; index: number }) {
  return (
    <span className="slice">
      <span
        className="slice-inner"
        style={{ '--delay': `${120 + index * 160}ms` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}

const TICKER = [
  'websites',
  'motion design',
  'automation',
  'ai assistants',
  'get found',
  'get known',
  'get running',
  'get smart',
];

/** Seamless mono band that closes the hero — the studio's vocabulary, scrolling. */
function Ticker() {
  const half = [...TICKER, ...TICKER];
  return (
    <div aria-hidden className="go-ticker mt-16">
      <div className="go-ticker-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex">
            {half.map((word, i) => (
              <span key={`${copy}-${i}`} className="go-ticker-item">
                {word}
                <span className="go-grad">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The manifesto: saze-style monospace declaration at display scale, the
 * interactive business-name compiler, and the 3D mark floating over the
 * crawling grid floor. No photo — the type IS the hero.
 */
export function Hero() {
  return (
    <section className="relative -mx-6 flex flex-col overflow-hidden px-6 pt-8 lg:min-h-[calc(100dvh-4.5rem)]">
      <span aria-hidden className="go-floor" />

      <div className="relative grid flex-1 items-center gap-x-14 gap-y-14 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <p className="go-label animate-fade-up">
            <b>01</b> <i>/</i> manifesto
          </p>

          <h1 className="go-manifesto text-foreground">
            <Slice index={0}>GET</Slice>
            <Slice index={1}>
              ONLINE<span className="go-grad">.</span>
            </Slice>
          </h1>

          <p className="max-w-xl animate-fade-up border-l-2 border-accent/40 pl-4 text-lg leading-relaxed text-subtle [animation-delay:460ms]">
            You exist offline. Your customers search, compare and book with whoever
            answers first. We get you online — then keep stacking the advantages:
            motion that makes you look established, automation that never forgets,
            AI that answers at 11pm.
          </p>

          <div className="animate-fade-up [animation-delay:580ms]">
            <SiteCompiler />
          </div>

          <div className="animate-fade-up [animation-delay:700ms]">
            <ContactRow />
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <Logo3D className="h-56 w-56 sm:h-72 sm:w-72" />
        </div>
      </div>

      <Ticker />
    </section>
  );
}
