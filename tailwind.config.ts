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
        // Premium dark skin: a graphite field, warm bone type, hairline
        // edges, and the brand green kept as a *material* rather than a
        // signal light. The neon version of this table read as a startup
        // landing page; the same roles, darkened and desaturated, read as a
        // studio. Roles are unchanged so every gs-* component re-skins with
        // this table — only `plane`, `forest` and `lime` lost their voltage.
        // Brand-scoped on purpose: the demo sites hardcode their own hex and
        // never read these, so flipping them cannot leak into client work.
        canvas: '#0A0B0B',
        // Translucent white, not a tinted black: this is the glass fill, so a
        // bg-paper panel and a .gs-card must read as the same material.
        paper: '#FFFFFF08',
        // Deep emerald: the brand green as cut stone, not as a highlighter.
        plane: '#1C5E42',
        // The only green bright enough to sit next to type as a signal.
        forest: '#3F8F68',
        // Muted sage: replaces the neon lime that used to carry every label.
        lime: '#A9C6A8',
        // Bone, not white: headlines and primary text, warm against a cold field.
        ink: '#E9E6DF',
        'ink-2': '#A6ACA5',
        'ink-3': '#757B74',
        hairline: '#FFFFFF14',
        // The deep panel fill (CTA bands, nav pill) the old forest provided.
        // Named plane-deep: a bare `deep` already exists in the legacy scale.
        'plane-deep': '#101A15',
        // Ink that sits *on* a filled plane: near-black on bone or emerald,
        // where `ink` (the light text colour) would vanish.
        'plane-ink': '#0A0B0B',

        accent: {
          DEFAULT: '#1C5E42',
          soft: '#3F8F68',
          dark: '#144831',
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
        // Three roles, and each one only does its own job: display is the
        // poster grotesque, label is the mono used for corner annotations, and
        // body is the face prose is actually read in. Inter ships with the
        // demos, so the reading role reuses it rather than loading a fourth
        // family. mono and sans stay with the demos that depend on them and
        // must never be repointed.
        display: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        label: ['var(--font-label)', 'ui-monospace', 'monospace'],
        body: ['var(--font-sans)', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        plate: '0 1px 2px rgba(8,12,10,0.06), 0 18px 40px -32px rgba(8,12,10,0.45)',
        // Legacy: still referenced by unmigrated components. Deleted with them.
        // The neon bloom these used to cast (a 20px green halo at 35%) is what
        // made panels read as a gaming HUD; the same keys now carry a deep
        // emerald bloom at a fraction of the light, so callers keep compiling.
        glow: '0 0 24px rgba(28,94,66,0.22)',
        'glow-lg': '0 0 48px rgba(28,94,66,0.18)',
        card: '0 10px 30px -14px rgba(0,0,0,0.72)',
        'card-hover': '0 22px 48px -18px rgba(0,0,0,0.8)',
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
