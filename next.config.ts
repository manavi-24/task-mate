import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // `buildActivity` was removed/renamed in newer Next versions.
    // Keep this empty object so we still control the indicator position if needed.
  },
};

export default nextConfig;
