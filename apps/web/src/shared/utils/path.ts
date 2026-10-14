export function getAssetPath(url?: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  if (cleanUrl.startsWith('/cropnetkhoaduc/')) {
    return cleanUrl;
  }
  
  // On GitHub Pages, Next.js basePath is '/cropnetkhoaduc'
  const isGithubPages = typeof window !== 'undefined' 
    ? window.location.hostname.includes('github.io')
    : process.env.NODE_ENV === 'production';

  if (isGithubPages) {
    return `/cropnetkhoaduc${cleanUrl}`;
  }
  return cleanUrl;
}
