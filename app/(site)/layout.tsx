import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GooDefs } from '@/components/brand/GooDefs';

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      {/* The gooey layers reference this by id; it must exist once per route. */}
      <GooDefs />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-3 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        {/* No top padding on purpose: the landing hero hugs the nav rule and
            each inner page adds its own air, so nothing is double-padded. */}
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-6 pb-16">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
