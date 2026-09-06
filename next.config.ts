// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Penting untuk Docker production
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Optimasi untuk Docker
  experimental: {
    // Ini akan membantu mengurangi size image
    outputFileTracingRoot: undefined,
  },
  // Environment variables yang tersedia di browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
};

export default nextConfig;