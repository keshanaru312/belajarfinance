import type { NextConfig } from "next";

const isCloudflare = process.env.CLOUDFLARE === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Cloudflare needs unoptimized images
  images: {
    unoptimized: isCloudflare,
  },

  // ✅ Configure for Cloudflare Pages
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Don't use export for edge runtime compatibility
  ...(isCloudflare ? {} : { output: 'standalone' }),

  // Ensure trailing slashes are handled correctly
  trailingSlash: false,
};

export default nextConfig;