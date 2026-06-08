import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The backend repo also has a package-lock.json; pin the workspace root to web/.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Allow Next/Vercel Image Optimization to fetch + resize recipe images served
    // from the public Supabase Storage bucket (any project ref *.supabase.co).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
