import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'ADMIN' | 'CUSTOMER' | 'FARMER' | 'LOGISTICS' | 'INSPECTOR';
  status: string;
  farmName?: string | null;
  address?: string | null;
  isEmailVerified?: boolean;
  supplierId?: string | null;
  supplierStatus?: string | null;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchCurrentUser: () => Promise<User | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user: User) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-store' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.user) {
          const user = json.data.user;
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch session profile:', e);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
    return null;
  }
}));
