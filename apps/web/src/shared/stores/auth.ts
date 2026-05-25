import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CUSTOMER' | 'FARMER' | 'LOGISTICS' | 'INSPECTOR';
  status: string;
  supplierId?: string | null;
  supplierStatus?: string | null;
}

interface AuthStore {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Load initial state safely checking for server-side rendering boundary
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  user: typeof window !== 'undefined' && localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user') || 'null') 
    : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false,
  
  login: (accessToken, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ accessToken, user, isAuthenticated: true });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
  
  setAccessToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
    set({ accessToken: token, isAuthenticated: true });
  }
}));
