import type { Metadata } from 'next';
import { Fira_Code, Fraunces, Fustat, Geist_Mono, Inter, Playfair_Display, Source_Serif_4 } from 'next/font/google';
import { company } from '@/content/brand/company';
import { siteUrl } from '@/content/brand/site';
import './globals.css';

// freehand.ai sets its headlines in the licensed BL Pylon Serif at weight 300.
// Source Serif 4 is the closest free face that actually ships a 300.
const display = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

// Brand-scoped mono and body faces. These deliberately do NOT replace
// --font-mono or --font-sans: 13 screener files read font-mono, and
// Dream Cafe's .dc-display inherits var(--font-sans) at weight 800.
const label = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-label',
  display: 'swap',
});

// Fustat has no italic axis, so no style is requested here.
const body = Fustat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const mono = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Serif used by the demo websites (e.g. Hair Adore), not the main portfolio.
const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

// Display serif used by the Savour demo site only.
const displaySerif = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.name} — ${company.tagline}`,
    template: `%s | ${company.name}`,
  },
  description: company.pitch,
  openGraph: {
    type: 'website',
    siteName: company.name,
    title: `${company.name} — ${company.tagline}`,
    description: company.pitch,
    url: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${label.variable} ${body.variable} ${mono.variable} ${sans.variable} ${serif.variable} ${displaySerif.variable}`}
    >
      <body className="font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
