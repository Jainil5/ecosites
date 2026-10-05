import type { Metadata } from 'next';
import { Fira_Code, Fraunces, Inter, Playfair_Display, Share_Tech_Mono } from 'next/font/google';
import './globals.css';

const display = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
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
  // Set NEXT_PUBLIC_SITE_URL in Vercel (e.g. https://<your-project>.vercel.app)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'),
  title: {
    default: 'Jainil Patel — Software Engineer',
    template: '%s | Jainil Patel',
  },
  description:
    'Portfolio of Jainil Patel, a software engineer building production systems — data platforms, ETL automation, and cloud infrastructure on AWS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${display.variable} ${mono.variable} ${sans.variable} ${serif.variable} ${displaySerif.variable}`}>
      <body className="font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
