'use client';

import { CountUp } from '@/components/brand/CountUp';
import { industries } from '@/content/brand/industries';
import { websites } from '@/content/websites/sites';

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

const stats: Stat[] = [
  { value: websites.length, label: 'businesses live right now' },
  { value: industries.length, label: 'industry verticals we build for' },
  { value: 7, suffix: 'd', label: 'typical time to first draft' },
  { value: 24, suffix: 'h', label: 'maximum time to a reply' },
];

function StatCell({ stat }: { stat: Stat }) {
  return (
    <div className="px-6 py-8 text-center sm:py-10">
      <p className="gs-display text-5xl sm:text-6xl">
        <CountUp value={stat.value} suffix={stat.suffix} pad />
      </p>
      <p className="gs-label mt-3 text-ink/65">{stat.label}</p>
    </div>
  );
}

/** The thin proof strip under the hero: numbers, not adjectives. */
export function ProofBand() {
  return (
    <div className="-mx-6 gs-plane-a border-y border-forest/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-forest/25 sm:grid-cols-4 sm:divide-y-0">
        {stats.map((stat) => (
          <StatCell key={stat.label} stat={stat} />
        ))}
      </div>
    </div>
  );
}
