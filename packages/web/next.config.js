/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@extractiq/shared', '@extractiq/ui'],
  reactStrictMode: true,
};

module.exports = nextConfig;
