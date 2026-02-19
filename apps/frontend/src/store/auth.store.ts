// ─── Auth Store ──────────────────────────────────────────────────────
// Manages user authentication state using Zustand.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services/api/auth';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified?: boolean;
  launchAccessGranted?: boolean;
  waitlistPosition?: number | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  refreshToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error?.message || 'Login failed',
          });
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signup(name, email, password);
          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error?.message || 'Signup failed',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Ignore logout errors, clear state anyway
        }
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      setAuth: (user: User, accessToken: string) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refresh();
          set({ accessToken: response.accessToken });
        } catch (error) {
          // Token refresh failed, logout
          get().logout();
        }
      },

      fetchProfile: async () => {
        try {
          const profile = await authApi.getProfile();
          set({
            user: {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              emailVerified: profile.emailVerified,
              launchAccessGranted: profile.launchAccessGranted,
              waitlistPosition: profile.waitlistPosition,
            },
          });
        } catch {
          // Ignore errors
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
