import axios from 'axios';
import { useAuthStore } from '@/shared/stores/auth';

const isBrowser = typeof window !== 'undefined';
const isGithubPages = isBrowser ? window.location.hostname.includes('github.io') : process.env.DEPLOY_TARGET === 'github-pages';
const isVercelHost = isBrowser ? (window.location.hostname.includes('vercel.app') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') : (process.env.DEPLOY_TARGET === 'vercel' || process.env.VERCEL === '1');

// Base API URL:
// - Always prefer relative '/api' on Vercel and local Next.js dev server
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (isVercelHost ? '/api' : (isGithubPages ? '' : '/api'));
export const isShowcaseDemoMode = isGithubPages;

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true, // Send httpOnly session cookies automatically
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Safe showcase mode check
apiClient.interceptors.request.use(
  (config) => {
    if (!API_BASE_URL && isShowcaseDemoMode) {
      return Promise.reject(new Error('SHOWCASE_MODE_NO_BACKEND: Nền tảng đang chạy ở chế độ tĩnh Showcase trên GitHub Pages'));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 and refresh the session silently via cookie rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refreshing fails or endpoint is refresh-token itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      API_BASE_URL
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (res.data.success) {
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear session and logout user if session refresh fails
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
