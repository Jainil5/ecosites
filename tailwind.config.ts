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
        // Dark-glass skin, sampled from shaders.com's pixels: near-black
        // field, frosted translucent panels, hairline glass edges, and the
        // same green/lime accents the cut-plane skin earned. Token roles are
        // unchanged (canvas = field, ink = text), only their values flipped —
        // so every gs-* component re-skins with this table.
        // Brand-scoped on purpose: the demo sites hardcode their own hex and
        // never read these, so flipping them cannot leak into client work.
        canvas: '#0C0D0C',
        // Translucent white, not a tinted black: this is the glass fill, so a
        // bg-paper panel and a .gs-card must read as the same material.
        paper: '#FFFFFF0D',
        plane: '#22C55E',
        forest: '#4ADE80',
        lime: '#BEF264',
        ink: '#F2F5F2',
        'ink-2': '#B6C2B8',
        'ink-3': '#7E8F82',
        hairline: '#FFFFFF1F',
        // The deep panel fill (CTA bands, nav pill) the old forest provided.
        // Named plane-deep: a bare `deep` already exists in the legacy scale.
        'plane-deep': '#0E2417',
        // Ink that sits *on* a filled plane: near-black text on bright green,
        // where `ink` (the light text colour) would vanish.
        'plane-ink': '#071209',

        accent: {
          DEFAULT: '#22C55E',
          soft: '#4ADE80',
          dark: '#16A34A',
        },

        // Legacy dark scale. Still read by the go-* CSS and by brand components
        // not yet migrated; the cleanup task deletes these once nothing
        // references them. `body` and `.frame` @apply several of them, so they
        // cannot go earlier.
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
        // display is the poster grotesque; body shares it at a lighter weight.
        // label is the mono used for corner labels. mono and sans stay with the
        // demos that depend on them and must never be repointed.
        display: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        label: ['var(--font-label)', 'ui-monospace', 'monospace'],
        body: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        plate: '0 1px 2px rgba(11,20,16,0.05), 0 18px 40px -32px rgba(11,20,16,0.4)',
        // Legacy: still referenced by unmigrated components. Deleted with them.
        glow: '0 0 20px rgba(34,197,94,0.35)',
        'glow-lg': '0 0 45px rgba(34,197,94,0.45)',
        card: '0 10px 30px -12px rgba(0,0,0,0.6)',
        'card-hover': '0 24px 50px -12px rgba(0,0,0,0.7)',
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
