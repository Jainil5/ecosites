import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system: freehand-style paper canvas, warm ink, orange accent.
        // Brand-scoped on purpose: the demo sites hardcode their own hex and
        // never read these, so flipping them cannot leak into client work.
        canvas: '#FFFFFF',
        paper: '#FDF8F4',
        band: '#FAF3E8',
        tint: '#FFF3EB',
        ink: '#0D0B08',
        'ink-2': '#4A3A2A',
        'ink-3': '#7A6855',
        hairline: '#EAE0D6',
        dark: '#1C1208',
        'dark-card': '#2C1D0D',
        accent: {
          DEFAULT: '#FE6200',
          10: '#FAE1D1',
          20: '#F9BD97',
          30: '#FB995B',
          50: '#DE5804',
          60: '#A04308',
          80: '#200B00',
        },
        // The tree-circuit mark keeps its green; it is a second brand hue, not
        // the interactive accent.
        'mark-green': '#22C55E',

        // Legacy dark scale. Still read by the go-* CSS and by brand components
        // not yet migrated; Task 12 deletes these once nothing references them.
        // `body` and `.frame` @apply several of them, so they cannot go earlier.
        background: '#0F172A',
        deep: '#0A1120',
        surface: '#111C31',
        elevated: '#1E293B',
        muted: '#272F42',
        border: '#475569',
        foreground: '#F8FAFC',
        subtle: '#94A3B8',
        brand: {
          DEFAULT: '#1E293B',
          dark: '#0F172A',
        },
      },
      fontFamily: {
        // display now resolves to the serif; label and body are new and
        // brand-only. mono and sans stay with the demos that depend on them.
        display: ['var(--font-display)', 'Georgia', 'serif'],
        label: ['var(--font-label)', 'ui-monospace', 'monospace'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        plate: '0 1px 2px rgba(13,11,8,0.04), 0 18px 40px -32px rgba(13,11,8,0.35)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '44px 44px',
      },
      perspective: {
        '1000': '1000px',
        '1200': '1200px',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-24px) translateX(12px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'gradient-pan': 'gradient-pan 8s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
