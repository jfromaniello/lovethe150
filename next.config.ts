import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. A stray package-lock.json higher up the tree makes
  // Next infer the wrong root, which can break asset/route resolution.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
