import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BrandBackground } from '@/components/brand/BrandBackground';
import { LeadTracker } from '@/components/brand/LeadTracker';
import { ScrollMotion } from '@/components/brand/ScrollMotion';
import { WhatsAppFab } from '@/components/brand/WhatsAppFab';
import 'lenis/dist/lenis.css';

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      {/* The still field the glass cards frost over: a wash, a horizon, grain. */}
      <BrandBackground />
      {/* Lenis and the scroll-momentum variables the brand effects read. */}
      <ScrollMotion />
      {/* Which enquiry control a visitor actually reached for, by placement. */}
      <LeadTracker />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-canvas focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        {/* No top padding on purpose: the landing hero hugs the nav rule and
            each inner page adds its own air, so nothing is double-padded.
            The sideways clip is not decoration: a scroll-driven band is drawn
            through a perspective, and far from its origin that projection is
            several screens wide. Without this the page drags sideways on a
            phone. `clip` rather than `hidden`, so the nav keeps sticking. */}
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 overflow-x-clip px-6 pb-16">
          {children}
        </main>
        <Footer />
        {/* Inside the z-10 shell, so an open mega-menu still sits over it. */}
        <WhatsAppFab />
      </div>
    </div>
  );
}
