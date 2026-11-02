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
      // The cafe site was renamed to Coffee Cups. Cards, bookmarks and shared
      // links still carry the old slug, so the whole subtree moves with a 301.
      { source: '/dream-cafe', destination: '/coffee-cups', permanent: true },
      { source: '/dream-cafe/:path*', destination: '/coffee-cups/:path*', permanent: true },
      // OrderBook's internal slug was `analytical-register`; the product is now
      // addressed by name, with one address per counter underneath it.
      { source: '/analytical-register', destination: '/orderbook', permanent: true },
    ];
  },
};

export default nextConfig;
