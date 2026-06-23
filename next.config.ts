import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      // Supplier CDN — bundled product images (interim; re-host at go-live, ADR-004).
      { protocol: "https", hostname: "img.staticdj.com" },
    ],
  },
};

export default nextConfig;
