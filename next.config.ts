import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Ignore video streaming files from caching if any, mostly cache js/css
});

const nextConfig: NextConfig = {
  transpilePackages: ['y-supabase', '@supabase/realtime-js'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "y-supabase": require.resolve("y-supabase/dist/index.js"),
    };
    return config;
  },
};

export default withPWA(nextConfig);
