import type { NextConfig } from 'next';

const isVercel = process.env.DEPLOY_TARGET === 'vercel' || process.env.VERCEL === '1';
const isProd = process.env.NODE_ENV === 'production';

// Base path calculation:
// On Vercel: basePath is strictly empty string ''
// On GitHub Pages: basePath is '/cropnetkhoaduc'
const basePath = isVercel
  ? ''
  : (process.env.NEXT_PUBLIC_BASE_PATH !== undefined
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : (isProd ? '/cropnetkhoaduc' : '')));

const nextConfig: NextConfig = {
  // On Vercel: dynamic serverless runtime with API route handlers; On GitHub Pages: static HTML export
  ...(isVercel ? {} : { output: 'export' }),
  basePath: basePath,
  trailingSlash: !isVercel,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  },
  ...(isVercel
    ? {
        async rewrites() {
          return [
            {
              source: '/_next/static/chunks/maplibre-gl-worker.mjs',
              destination: '/maplibre-gl-worker.mjs'
            },
            {
              source: '/_next/static/chunks/maplibre-gl-worker.mjs.map',
              destination: '/maplibre-gl-worker.mjs.map'
            }
          ];
        }
      }
    : {})
};

export default nextConfig;
