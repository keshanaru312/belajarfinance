import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    unoptimized: true, // required for Cloudflare compatibility
  },
};

export default nextConfig;