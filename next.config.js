/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  // Optimize for production
  swcMinify: true,
  // Image optimization
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
