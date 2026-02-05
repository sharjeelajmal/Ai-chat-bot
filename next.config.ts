import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ye line Vercel ko batati hai ke is library ko bundle mat karo
  serverExternalPackages: ['@xenova/transformers'],
};

export default nextConfig;