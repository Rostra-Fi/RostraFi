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
      { hostname: "img.freepik.com" },
      { hostname: "media.istockphoto.com" },
      { hostname: "cdn.pixabay.com" },
      { hostname: "upload.wikimedia.org" },
      { hostname: "pbs.twimg.com" },
      {
        protocol: "https",
        hostname: "**.gstatic.com",
      },
    ],
  },
};

export default nextConfig;
