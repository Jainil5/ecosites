import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project so a stray lockfile in a parent
  // directory does not change workspace inference.
  outputFileTracingRoot: path.join(import.meta.dirname),
  images: {
    // Add external demo-host domains here as needed, e.g. your Vercel app domain.
    remotePatterns: [],
  },
  async redirects() {
    return [
      // The cafe site has changed hands twice: Dream Cafe, then Coffee Cups,
      // now Brewery Cafe. Cards, bookmarks and shared links still carry the old
      // slugs, so both retired subtrees move with a 301.
      { source: '/dream-cafe', destination: '/brewery-cafe', permanent: true },
      { source: '/dream-cafe/:path*', destination: '/brewery-cafe/:path*', permanent: true },
      { source: '/coffee-cups', destination: '/brewery-cafe', permanent: true },
      { source: '/coffee-cups/:path*', destination: '/brewery-cafe/:path*', permanent: true },
      // The café's OrderBook counter moved with the café: its address carries
      // the brand slug, so the one already handed round needs following.
      {
        source: '/orderbook/coffee-cups-demo',
        destination: '/orderbook/brewery-cafe-demo',
        permanent: true,
      },
      // OrderBook's internal slug was `analytical-register`; the product is now
      // addressed by name, with one address per counter underneath it.
      { source: '/analytical-register', destination: '/orderbook', permanent: true },
    ];
  },
};

export default nextConfig;
