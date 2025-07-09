import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "chineselearning.cloudfront.gcdn.top" },
    ]
  },
  // Enable following config for build with less resources
  // eslint: {
  //       ignoreDuringBuilds: true,
  // },
  // typescript: {
  //       ignoreBuildErrors: true,
  // }
};

export default nextConfig;
