// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Penting untuk Docker production
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    domains: ['wedding.spairum.my.id'],
  },
  experimental: {
   
  },
  // Optimasi untuk Docker
  // experimental: {
  //   // Ini akan membantu mengurangi size image
  //   outputFileTracingRoot: undefined,
  //   allowedDevOrigins: ['localhost:8001', 'wedding.spairum.my.id']
  // },
  // Environment variables yang tersedia di browser
  // env: {
  //   NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  // },
};

export default nextConfig;