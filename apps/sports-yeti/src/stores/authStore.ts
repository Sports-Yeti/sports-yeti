import { create } from 'zustand';
import { api } from '../services/api';
import type { LoginCredentials, RegisterData, User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await api.getToken();
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await api.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
