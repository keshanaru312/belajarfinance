import type { NextConfig } from "next";

const isCloudflare = process.env.CLOUDFLARE === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Cloudflare needs unoptimized images
  images: {
    unoptimized: isCloudflare,
  },

  // ✅ Node build uses standalone output
  ...(isCloudflare ? {} : { output: "standalone" }),
};

export default nextConfig;