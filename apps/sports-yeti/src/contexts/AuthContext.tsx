import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, Player, LoginForm, RegisterForm } from '../types';
import { getCurrentPlayer } from '../mocks/data';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // TODO: Validate token with backend
        // For now, just set the current player as logged in
        setUser(getCurrentPlayer());
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginForm): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Implement actual login API call
      // For now, simulate login
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate successful login
      const loggedInUser = getCurrentPlayer();
      setUser(loggedInUser);
      setIsAuthenticated(true);

      // Store auth token
      await AsyncStorage.setItem('authToken', 'mock-jwt-token');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterForm): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Implement actual registration API call
      // For now, simulate registration
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate successful registration
      const newUser: Player = {
        ...userData,
        id: 'new-user-' + Date.now(),
        bio: '',
        availabilityStatus: 'available',
        isPrivate: false,
        pointBalance: 100, // Starting points
        achievements: [],
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          winRate: 0,
          totalPoints: 100,
          averagePointsPerGame: 0,
          strengths: [],
          areasForImprovement: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setUser(newUser);
      setIsAuthenticated(true);

      // Store auth token
      await AsyncStorage.setItem('authToken', 'mock-jwt-token');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // TODO: Implement actual logout API call
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Player>): Promise<void> => {
    if (!user) return;

    try {
      // TODO: Implement actual profile update API call
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};