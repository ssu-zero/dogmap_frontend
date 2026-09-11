import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  distDir: process.env.E2E === "1" ? ".next-e2e" : ".next",
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    const apiOrigin = process.env.DOGMAP_API_ORIGIN ?? "http://localhost:8000"

    return [
      {
        source: "/backend-api/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ]
  },
}

export default nextConfig
