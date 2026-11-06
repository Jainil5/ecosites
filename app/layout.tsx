import type { Metadata } from 'next';
import { Archivo, Cormorant_Garamond, Fira_Code, Fraunces, Geist_Mono, Inter, Playfair_Display } from 'next/font/google';
import { company } from '@/content/brand/company';
import { siteUrl } from '@/content/brand/site';
import './globals.css';

// The brand's poster face. The reference form sets headlines in a heavy
// grotesque in caps, so display carries the headlines, the buttons and the
// card titles — and nothing else. Prose reads in Inter below.
const display = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

// Brand-scoped mono. This deliberately does NOT replace --font-mono:
// 13 screener files read font-mono, and Brewery Cafe's .bc-display inherits
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

// The reading face. Body prose is set here, not in the poster grotesque:
// Archivo is the face the headlines, buttons and card titles are drawn in, and
// at 15px a tight uppercase-designed grotesque is work, not reading. The
// weights are named because this family is now the one every paragraph
// inherits — a missing 600 would be synthesised, and faux-bold prose is exactly
// what the display face is there to avoid.
const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
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

// Ruhani's own face, and nobody else's. A Garamond at 400 is the lightest
// thing in the family that still holds a headline at 60px, which is the whole
// argument for a jewellery page that whispers rather than a shop that shouts.
const rjDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-rj-display',
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
