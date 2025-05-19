import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["placeholder.co", "via.placeholder.com", "images.unsplash.com"],
  },
};

export default nextConfig;
