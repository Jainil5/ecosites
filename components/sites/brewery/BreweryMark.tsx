/** The Brewery mark: a hop cone, the one thing every beer on the wall starts with. */
export function BreweryMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="none">
      <path
        d="M16 4.5c6 4.8 9.2 10.8 9.2 15.9 0 4.8-4.1 8.1-9.2 8.1s-9.2-3.3-9.2-8.1c0-5.1 3.2-11.1 9.2-15.9z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M10 17.5c3.9 2.4 8.1 2.4 12 0M8.8 23.2c4.5 2.6 9.9 2.6 14.4 0"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M16 4.5V1.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
