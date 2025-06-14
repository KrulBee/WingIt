import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      "placeholder.co",
      "via.placeholder.com",
      "images.unsplash.com",
      "res.cloudinary.com" // Add Cloudinary domain for image hosting
    ],
  },
  webpack: (config) => {
    // Add path alias resolution for production builds
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;
