import axios from 'axios';
import { useAuthStore } from '@/shared/stores/auth';

const isBrowser = typeof window !== 'undefined';
const isProd = process.env.NODE_ENV === 'production';
const isGithubPages = isBrowser ? window.location.hostname.includes('github.io') : process.env.DEPLOY_TARGET === 'github-pages';
const isVercelHost = isBrowser ? (window.location.hostname.includes('vercel.app') || window.location.hostname === 'localhost') : (process.env.DEPLOY_TARGET === 'vercel' || process.env.VERCEL === '1');

// Base API URL:
// - If NEXT_PUBLIC_API_URL is provided, use it.
// - On Vercel: use relative '/api' for Next.js Route Handlers.
// - On GitHub Pages: empty string (showcase mode).
// - On Local Dev: 'http://localhost:5000/api' or '/api'.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (isVercelHost ? '/api' : (isGithubPages ? '' : 'http://localhost:5000/api'));
export const isShowcaseDemoMode = isGithubPages;

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true, // Send httpOnly cookies (refreshToken)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach the short-lived access token to headers
apiClient.interceptors.request.use(
  (config) => {
    if (!API_BASE_URL && isShowcaseDemoMode) {
      return Promise.reject(new Error('SHOWCASE_MODE_NO_BACKEND: Nền tảng đang chạy ở chế độ tĩnh Showcase trên GitHub Pages'));
    }
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 and refresh the token silently
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refreshing fails
    if (error.response?.status === 401 && !originalRequest._retry && API_BASE_URL) {
      originalRequest._retry = true;

      try {
        // Request token rotation
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (res.data.success) {
          const newAccessToken = res.data.data.accessToken;
          
          // Update state store
          useAuthStore.getState().setAccessToken(newAccessToken);
          
          // Update failed request authorization header and retry
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear session and logout user if token refresh fails
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
