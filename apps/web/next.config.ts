import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  distDir: process.env.E2E === "1" ? ".next-e2e" : ".next",
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig
