import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "images.chesscomfiles.com",
      },
      {
        protocol: "https",
        hostname: "www.chess.com",
      },
    ],
  },
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
