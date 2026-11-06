import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { company } from '@/content/brand/company';
import { siteUrl } from '@/content/brand/site';
import './globals.css';

// Every face is read off disk at build time instead of being fetched from
// Google Fonts. The deploy host builds behind a proxy that rewrites the font
// URLs inside the CSS Google returns, and next/font/google then dies working
// out a file extension from one of them: `Cannot read properties of null
// (reading '1')`. A build that passed yesterday failed for a reason nobody in
// this repo could see or test. The files in app/fonts are the same variable
// fonts, latin subset, checked in — so the build needs no network and the type
// cannot change under us between two deploys.
//
// Latin only: the whole corpus is Latin script, and the accented copy is é and
// à, which sit inside the latin subset. Nothing here renders Cyrillic.

// The brand's poster face. The reference form sets headlines in a heavy
// grotesque in caps, so display carries the headlines, the buttons and the
// card titles — and nothing else. Prose reads in Inter below.
const display = localFont({
  src: './fonts/archivo-latin.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-display',
  display: 'swap',
});

// Brand-scoped mono. This deliberately does NOT replace --font-mono:
// 13 screener files read font-mono, and Brewery Cafe's .bc-display inherits
// var(--font-sans) at weight 800.
const label = localFont({
  src: './fonts/geist-mono-latin.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-label',
  display: 'swap',
});

const mono = localFont({
  src: './fonts/fira-code-latin.woff2',
  weight: '300 700',
  style: 'normal',
  variable: '--font-mono',
  display: 'swap',
});

// The reading face. Body prose is set here, not in the poster grotesque:
// Archivo is the face the headlines, buttons and card titles are drawn in, and
// at 15px a tight uppercase-designed grotesque is work, not reading. The
// weights are named because this family is now the one every paragraph
// inherits — a missing 600 would be synthesised, and faux-bold prose is exactly
// what the display face is there to avoid.
const sans = localFont({
  src: './fonts/inter-latin.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-sans',
  display: 'swap',
});

// Serif used by the demo websites (e.g. Hair Adore), not the main portfolio.
const serif = localFont({
  src: './fonts/playfair-display-latin.woff2',
  weight: '400 900',
  style: 'normal',
  variable: '--font-serif',
  adjustFontFallback: 'Times New Roman',
  display: 'swap',
});

// Display serif used by the Savour demo site only.
const displaySerif = localFont({
  src: './fonts/fraunces-latin.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-display-serif',
  adjustFontFallback: 'Times New Roman',
  display: 'swap',
});

// Ruhani's own face, and nobody else's. A Garamond at 400 is the lightest
// thing in the family that still holds a headline at 60px, which is the whole
// argument for a jewellery page that whispers rather than a shop that shouts.
const rjDisplay = localFont({
  src: './fonts/cormorant-garamond-latin.woff2',
  weight: '300 700',
  style: 'normal',
  variable: '--font-rj-display',
  adjustFontFallback: 'Times New Roman',
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
      className={`dark ${display.variable} ${label.variable} ${mono.variable} ${sans.variable} ${serif.variable} ${displaySerif.variable} ${rjDisplay.variable}`}
    >
      <body className="font-body text-ink antialiased">{children}</body>
    </html>
  );
}
