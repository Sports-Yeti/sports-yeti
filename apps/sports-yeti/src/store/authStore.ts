import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/apiClient';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  player?: {
    id: number;
    experience_level: string;
    availability_status: string;
    point_balance: number;
    league_id?: number;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          const response = await apiClient.post('/auth/login', {
            email,
            password,
          });

          const { user, access_token, refresh_token } = response.data.data;
          
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Update API client with new token
          apiClient.setAuthToken(access_token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: any) => {
        try {
          set({ isLoading: true });
          
          const response = await apiClient.post('/auth/register', userData);
          
          const { user, access_token, refresh_token } = response.data.data;
          
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          apiClient.setAuthToken(access_token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        const { accessToken } = get();
        
        if (accessToken) {
          apiClient.post('/auth/logout').catch(() => {
            // Ignore logout errors, proceed with local logout
          });
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        apiClient.clearAuthToken();
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await apiClient.post('/auth/refresh', {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { access_token, refresh_token } = response.data.data;
          
          set({
            accessToken: access_token,
            refreshToken: refresh_token,
          });

          apiClient.setAuthToken(access_token);
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          throw error;
        }
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true });
          
          const { accessToken, refreshToken } = get();
          
          if (!accessToken || !refreshToken) {
            set({ isLoading: false });
            return;
          }

          // Set token in API client
          apiClient.setAuthToken(accessToken);
          
          // Try to get user profile to verify token
          try {
            const response = await apiClient.get('/auth/profile');
            set({
              user: response.data.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // Token might be expired, try refresh
            await get().refreshAccessToken();
            set({ isLoading: false });
          }
        } catch (error) {
          // All auth attempts failed
          get().logout();
          set({ isLoading: false });
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'sports-yeti-auth',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);