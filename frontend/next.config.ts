import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
      { hostname: "images.unsplash.com" },
      { hostname: "ui.aceternity.com" },
      {
        protocol: "https",
        hostname: "**.gstatic.com",
      },
    ],
  },
};

export default nextConfig;
