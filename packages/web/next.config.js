/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@extractiq/shared', '@extractiq/ui', '@extractiq/core', '@extractiq/infrastructure'],
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'drizzle-orm'],
    instrumentationHook: true, // Enable instrumentation for background worker
  },
};

module.exports = nextConfig;
