import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  // Em dev, proxy /api para o backend local (URLs relativas no browser)
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        { source: "/api/:path*", destination: "http://127.0.0.1:8000/api/:path*" },
      ];
    }
    return [];
  },
};

export default nextConfig;
