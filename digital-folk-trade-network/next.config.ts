import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Fix workspace root warning
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
