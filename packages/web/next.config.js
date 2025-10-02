/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@docuflow/shared', '@docuflow/ui'],
  reactStrictMode: true,
};

module.exports = nextConfig;
