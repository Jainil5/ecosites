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
        // Design system: Dark OLED + "code dark + run green"
        background: '#0F172A',
        // Deeper than the canvas: the band a full-bleed section sits on, so
        // sections stop reading as one continuous dark field.
        deep: '#0A1120',
        surface: '#111C31',
        elevated: '#1E293B',
        muted: '#272F42',
        border: '#475569',
        foreground: '#F8FAFC',
        subtle: '#94A3B8',
        accent: {
          DEFAULT: '#22C55E',
          soft: '#4ADE80',
          dark: '#16A34A',
        },
        brand: {
          DEFAULT: '#1E293B',
          dark: '#0F172A',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-monospace', 'monospace'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
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
