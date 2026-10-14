import { SiteFrame } from '@/components/brand/SiteFrame';
import { websites } from '@/content/websites/sites';

/** How far each frame sits behind the one in front, fanning up and left. */
const DEPTH = [
  { x: 0, y: 0, scale: 1 },
  { x: -2.1, y: -1.5, scale: 0.93 },
  { x: -4.2, y: -3, scale: 0.86 },
];

/**
 * The hero visual: the three delivered sites, raked back in depth so the
 * first thing a visitor sees is real work rather than a mock-up. CSS-only.
 */
export function HeroPanel() {
  const stack = websites.slice(0, DEPTH.length);

  return (
    <div aria-hidden className="scene-wide hidden shrink-0 lg:block">
      <div className="hero-panel relative h-[21rem] w-[27rem]">
        {stack.map((site, backIndex) => {
          const depth = DEPTH[backIndex] ?? DEPTH[DEPTH.length - 1];
          const front = backIndex === 0;
          return (
            <div
              key={site.slug}
              className="absolute bottom-0 right-0 w-[22rem] transition-transform duration-500 ease-out"
              style={{
                transform: `translate(${depth.x}rem, ${depth.y}rem) scale(${depth.scale})`,
                zIndex: DEPTH.length - backIndex,
                opacity: front ? 1 : 0.55 + 0.15 * (DEPTH.length - backIndex - 1),
              }}
            >
              {front ? (
                <span
                  className="absolute -inset-6 -z-10 rounded-[2rem] blur-3xl"
                  style={{ background: `${site.accent}22` }}
                />
              ) : null}
              <SiteFrame site={site} decorative priority={front} sizes="22rem" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
