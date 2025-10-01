import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow any HTTPS domain
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**', // Allow any HTTP domain
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
