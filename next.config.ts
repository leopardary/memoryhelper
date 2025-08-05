import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "chineselearning.cloudfront.gcdn.top" },
      { hostname: "memoryhelper.s3.us-west-1.amazonaws.com"}
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
