import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com"
      },
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com"
      },
      {
        protocol: "https",
        hostname: "yt3.googleusercontent.com"
      }
    ]
  }
}

export default nextConfig
