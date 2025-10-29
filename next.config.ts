import type { NextConfig } from "next";

const isCloudflare = process.env.CLOUDFLARE === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Cloudflare needs unoptimized images
  images: {
    unoptimized: isCloudflare,
  },

  // ✅ Use edge runtime for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // ✅ Set output to 'export' for Cloudflare Pages
  output: isCloudflare ? 'export' : 'standalone',

  // Ensure trailing slashes are handled correctly
  trailingSlash: false,
};

export default nextConfig;