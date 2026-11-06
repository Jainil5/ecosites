import type { CSSProperties } from 'react';
import { SectionIntro } from '@/components/brand/SectionIntro';
import { serviceSteps } from '@/content/brand/services';
import { company } from '@/content/brand/company';

/**
 * One tier of branches: `y` is the apex height, `w` the half spread and `h`
 * how far the tips hang below the apex. Ordered from the ground up, so the
 * first tier is the widest and lowest — the same order as `serviceSteps`.
 */
const TIERS = [
  { y: 170, w: 84, h: 34, stroke: 'var(--gs-plane)', width: 5 },
  { y: 132, w: 64, h: 30, stroke: 'var(--gs-plane)', width: 5 },
  { y: 96, w: 46, h: 26, stroke: 'var(--gs-forest)', width: 5 },
  { y: 62, w: 28, h: 22, stroke: 'var(--gs-forest)', width: 5 },
];

const GROUND = 246;
/** The trunk climbs to the widest tier's apex, so the arms read as branches
 *  coming off it rather than chevrons hovering over a stump. */
const TRUNK_TOP = TIERS[0].y;

/** Scroll-driven draw windows, as percentages of the band's `entry` range.
 *  Each tier cuts in a little above the last one, so the tree builds from
 *  the ground up rather than appearing all at once. */
const drawWindow = (start: number, end: number): DrawStyle =>
  ({ '--r0': `${start}%`, '--r1': `${end}%` }) as DrawStyle;

/** `pathLength={1}` lets the draw animation run on a 0→1 dash offset, so the
 *  stroke lengths never have to be measured in JS. */
interface DrawStyle extends CSSProperties {
  '--r0'?: string;
  '--r1'?: string;
}

export function GrowBand() {
  return (
    <section id="growth" className="gs-reveal relative scroll-mt-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <SectionIntro index="02" label="growth" title="We help businesses grow — with tech, at prices they can pay.">
            {company.pitch}
          </SectionIntro>

          <ul className="flex flex-col-reverse gap-px border border-hairline bg-hairline">
            {serviceSteps.map((step, i) => (
              <li key={step.key} className="flex items-baseline gap-4 bg-paper px-4 py-3">
                <span className="gs-label gs-label-hot shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="gs-display text-lg">{step.service}</span>
                <span className="ml-auto hidden text-right text-sm leading-snug text-ink-2 sm:block">
                  {step.tagline}
                </span>
              </li>
            ))}
          </ul>

          <p className="gs-label mt-5 text-forest">{company.badge}</p>
        </div>

        {/* The brand mark planted and grown: the same circuit tree, drawn
            trunk-first, tiers cutting in above it, pads popping last. */}
        <div className="gs-stage relative mx-auto w-full max-w-md">
          <span
            aria-hidden
            className="gs-plane gs-plane-a absolute"
            style={{ top: '6%', right: '-4%', width: '5.5rem', height: '5.5rem', '--pz': '70px', '--rot': '8deg', '--d': '200ms' } as CSSProperties}
          />
          <span
            aria-hidden
            className="gs-plane gs-plane-b absolute"
            style={{ bottom: '4%', left: '-6%', width: '4.5rem', height: '3.25rem', '--pz': '40px', '--rot': '-6deg', '--d': '340ms' } as CSSProperties}
          />
          <svg
            viewBox="0 0 320 270"
            role="img"
            aria-label="Circuit tree growing in four tiers: website, motion design, automation, AI assistant"
            className="gs-tree relative w-full"
          >
            <g className="gs-tree-crown" fill="none" strokeLinecap="square" strokeLinejoin="miter">
              <path
                className="gs-trunk"
                d={`M160 ${GROUND} V ${TRUNK_TOP}`}
                stroke="var(--gs-forest)"
                strokeWidth={7}
                pathLength={1}
                style={drawWindow(2, 30)}
              />
              <path
                className="gs-trunk"
                d={`M124 ${GROUND} H196`}
                stroke="var(--gs-forest)"
                strokeWidth={4}
                opacity={0.5}
                pathLength={1}
                style={drawWindow(2, 30)}
              />
              {TIERS.map((tier, i) => (
                <path
                  key={tier.y}
                  className="gs-branch"
                  d={`M${160 - tier.w} ${tier.y + tier.h} L160 ${tier.y} L${160 + tier.w} ${tier.y + tier.h}`}
                  stroke={tier.stroke}
                  strokeWidth={tier.width}
                  pathLength={1}
                  style={drawWindow(8 + i * 10, 40 + i * 11)}
                />
              ))}
              {TIERS.map((tier, i) =>
                [-1, 1].map((side) => (
                  <rect
                    key={`${tier.y}-${side}`}
                    className="gs-pad"
                    x={160 + side * tier.w - 4}
                    y={tier.y + tier.h - 4}
                    width={8}
                    height={8}
                    fill={i < 2 ? 'var(--gs-forest)' : 'var(--gs-plane)'}
                    style={drawWindow(18 + i * 10, 52 + i * 11)}
                  />
                )),
              )}
              <rect
                className="gs-pad gs-pad-crown"
                x={154}
                y={TIERS[3].y - 14}
                width={12}
                height={12}
                fill="var(--gs-lime)"
                style={drawWindow(62, 86)}
              />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
