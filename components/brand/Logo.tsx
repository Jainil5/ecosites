interface LogoProps {
  className?: string;
}

/** Pine silhouette whose branch ends and crown are circuit pads. Inherits the accent via currentColor. */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 6.4 12 4.2l2 2.2" />
      <path d="M8 10.6 12 6.2l4 4.4" />
      <path d="M6 14.8 12 8.4l6 6.4" />
      <path d="M12 20.6v-5.8" />
      <circle cx="6" cy="14.8" r="1.2" />
      <circle cx="18" cy="14.8" r="1.2" />
      <circle cx="8" cy="10.6" r="1.1" />
      <circle cx="16" cy="10.6" r="1.1" />
    </svg>
  );
}
