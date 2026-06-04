import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The backend repo also has a package-lock.json; pin the workspace root to web/.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
