interface FlameMarkProps {
  className?: string;
}

/** The hearth glyph: a flame with a single coal beneath it. */
export function FlameMark({ className }: FlameMarkProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        d="M12.6 2.2c.4 3.1-1.1 4.4-2.6 5.8C8.3 9.6 7 11 7 13.4a5.6 5.6 0 0 0 11.2.3c0-2.4-1-3.9-2-5.3-.4 1-1 1.7-1.8 2 .7-2.6.2-5.6-1.8-8.2z"
        fill="currentColor"
      />
      <circle cx="8.4" cy="20.9" r="1.3" fill="currentColor" opacity=".55" />
      <circle cx="12.2" cy="21.8" r="1" fill="currentColor" opacity=".35" />
    </svg>
  );
}
