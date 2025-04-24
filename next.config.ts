import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "chineselearning.cloudfront.gcdn.top" },
    ]
  }
};

export default nextConfig;
