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
};

export default nextConfig;
