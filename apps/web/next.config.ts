import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
// If building on GitHub Actions, GITHUB_REPOSITORY is defined as "owner/repo"
const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? repoName : '',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
