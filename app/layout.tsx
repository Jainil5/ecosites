import type { Metadata } from 'next';
import { Archivo, Fira_Code, Fraunces, Geist_Mono, Inter, Playfair_Display } from 'next/font/google';
import { company } from '@/content/brand/company';
import { siteUrl } from '@/content/brand/site';
import './globals.css';

// The brand's poster face. The reference form sets headlines in a heavy
// grotesque in caps, so display carries both the headlines and body copy —
// Archivo ships 100-900, which is why one family covers the whole skin.
const display = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

// Brand-scoped mono. This deliberately does NOT replace --font-mono:
// 13 screener files read font-mono, and Coffee Cups's .cc-display inherits
// var(--font-sans) at weight 800.
const label = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-label',
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
      className={`dark ${display.variable} ${label.variable} ${mono.variable} ${sans.variable} ${serif.variable} ${displaySerif.variable}`}
    >
      <body className="font-body text-ink antialiased">{children}</body>
    </html>
  );
}
