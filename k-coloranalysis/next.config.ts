import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.29.128.1"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
