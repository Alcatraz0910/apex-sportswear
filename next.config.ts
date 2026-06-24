import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images straight from the supplier CDNs (already-optimized JPEGs) instead of
    // Vercel's image optimizer — the catalogue's ~3.7k products x several images blow past
    // Hobby's image-optimization cap. This offloads all image bytes to the suppliers'
    // CDNs (zero Vercel optimization usage + near-zero Vercel image bandwidth).
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      // Supplier CDNs — bundled product images (interim; re-host at go-live, ADR-004).
      { protocol: "https", hostname: "img.staticdj.com" }, // Shoplazza (football)
      { protocol: "https", hostname: "cdn.staticyy.com" }, // ymcart/kitddm (NBA + F1)
      { protocol: "https", hostname: "us03-imgcdn.ymcart.com" }, // ymcart secondary
    ],
  },
};

export default nextConfig;
