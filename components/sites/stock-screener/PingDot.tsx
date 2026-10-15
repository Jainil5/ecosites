'use client';

import type { LiveTick } from './useLiveTicks';

/** Live ping point: pulses green on an upward tick, red on a downward one. */
export function PingDot({ dir }: { dir: LiveTick['dir'] }) {
  const color = dir === 'up' ? 'bg-[#16C784]' : dir === 'down' ? 'bg-[#EA3943]' : 'bg-[#5B6B85]';
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
      {dir !== 'flat' && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${color}`} />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}
