import type { NextConfig } from 'next';

const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages';

// Base path calculation:
// On Vercel / Local: basePath is strictly ''
// On GitHub Pages: basePath is repo-specific
const basePath = isGhPages
  ? (process.env.NEXT_PUBLIC_BASE_PATH !== undefined
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '/cropnetkhoaduc'))
  : '';

const nextConfig: NextConfig = {
  // On GitHub Pages: static export. Default (Local & Vercel): dynamic Next.js runtime with Route Handlers
  ...(isGhPages ? { output: 'export', trailingSlash: true } : {}),
  basePath: basePath,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  },
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
};

export default nextConfig;
