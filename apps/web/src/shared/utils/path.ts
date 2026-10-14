export function getAssetPath(url?: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  if (cleanUrl.startsWith('/cropnetkhoaduc/')) {
    return cleanUrl;
  }
  
  // If running on Vercel or local dev, never prepend /cropnetkhoaduc
  const isVercel = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'vercel' || 
                   process.env.DEPLOY_TARGET === 'vercel' ||
                   (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
  if (isVercel) {
    return cleanUrl;
  }

  // On GitHub Pages, Next.js basePath is '/cropnetkhoaduc'
  const isGithubPages = typeof window !== 'undefined' 
    ? window.location.hostname.includes('github.io')
    : (process.env.DEPLOY_TARGET === 'github-pages' || process.env.NODE_ENV === 'production');

  if (isGithubPages) {
    return `/cropnetkhoaduc${cleanUrl}`;
  }
  return cleanUrl;
}
