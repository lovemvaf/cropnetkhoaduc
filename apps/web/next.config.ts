import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
// Base path calculation: prioritize NEXT_PUBLIC_BASE_PATH, then GitHub Actions GITHUB_REPOSITORY, then default to /cropnetkhoaduc on prod
const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : (isProd ? '/cropnetkhoaduc' : ''));

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath,
  trailingSlash: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
