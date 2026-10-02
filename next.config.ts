import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  cacheLife: {
    test: {
      revalidate: 5,
    }
  },
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: true, // Muestra la URL completa para identificar mejor la request
    },
  },
  productionBrowserSourceMaps: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/dx.:theme.css',
        destination: '/dx/dx.:theme.css',
      },
    ];
  },
};

export default nextConfig;
