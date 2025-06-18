import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
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
      },
      {
        protocol: "https",
        hostname: "i.imgur.com"
      }
    ]
  }
}

export default nextConfig
