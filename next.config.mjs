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
      // The cafe site was renamed to Brewery, then Coffee Cups before that.
      // Cards, bookmarks and shared links still carry the old slugs, so the
      // whole subtree moves with a 301.
      { source: '/dream-cafe', destination: '/brewery', permanent: true },
      { source: '/dream-cafe/:path*', destination: '/brewery/:path*', permanent: true },
      { source: '/coffee-cups', destination: '/brewery', permanent: true },
      { source: '/coffee-cups/:path*', destination: '/brewery/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
