import type { NextConfig } from "next";
import { securityHeaders } from "./src/infrastructure/security/securityHeaders";

// Only optimise images from our own Supabase storage. A "**" wildcard turns
// /_next/image into a free public image proxy that anyone can bill to us.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  logging: {
    fetches: { fullUrl: false },
  },

  experimental: {
    // Tree-shake large icon/animation libraries to the parts actually imported.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost }] : []),
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },

  async headers() {
    const staticHeaders = Object.entries(securityHeaders).map(([key, value]) => ({ key, value }));
    return [
      // Security headers on every route, including /api (middleware does not run there).
      { source: "/:path*", headers: staticHeaders },
      // Files in /public/uploads are versioned by name; cache for a week.
      {
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
