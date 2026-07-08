import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ['firebase-admin'],
  allowedDevOrigins: ['*.space-z.ai', 'localhost'],
};

export default nextConfig;
