import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
    resolveAlias: {
      fs: { browser: "./config/empty-browser-module.ts" },
      path: { browser: "./config/empty-browser-module.ts" },
    },
  },
};

export default nextConfig;
