import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
        port: "",
        pathname: "/**", // Allow all paths
      },
      {
        protocol: "https",
        hostname: "ibb.co.com",
      },
    ],
  },
};

export default nextConfig;
