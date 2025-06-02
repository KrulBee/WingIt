import type { NextConfig } from "next";

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
};

export default nextConfig;
