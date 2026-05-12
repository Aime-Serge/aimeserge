import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Note: Turbopack disabled due to memory constraints in resource-limited environments
  // SWC is used by default for minification in Next.js 15+

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Reduce build output verbosity to save memory
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Compress assets more aggressively
  compress: true,
};

module.exports = nextConfig;
