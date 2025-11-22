// Configuration and Environment Variables
// Centralized configuration management for the app

import Constants from 'expo-constants';

interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  enableMockData: boolean;
  enableDebugLogs: boolean;
  version: string;
  environment: 'development' | 'staging' | 'production';
}

// Get configuration from environment or use defaults
export const config: AppConfig = {
  apiUrl: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1',
  apiTimeout: 30000,
  enableMockData: true, // Set to false when backend is ready
  enableDebugLogs: __DEV__,
  version: Constants.expoConfig?.version || '1.0.0',
  environment: __DEV__ ? 'development' : 'production',
};

// Helper function to check if we should use mock data
export function shouldUseMockData(): boolean {
  return config.enableMockData;
}

// Helper function for debug logging
export function debugLog(...args: unknown[]): void {
  if (config.enableDebugLogs) {
    console.log('[Sports Yeti]', ...args);
  }
}

// API endpoint builders
export const endpoints = {
  auth: {
    login: `${config.apiUrl}/auth/login`,
    register: `${config.apiUrl}/auth/register`,
    logout: `${config.apiUrl}/auth/logout`,
    me: `${config.apiUrl}/auth/me`,
    forgotPassword: `${config.apiUrl}/auth/forgot-password`,
  },
  players: {
    list: `${config.apiUrl}/players`,
    get: (id: string) => `${config.apiUrl}/players/${id}`,
    update: (id: string) => `${config.apiUrl}/players/${id}`,
  },
  teams: {
    list: `${config.apiUrl}/teams`,
    create: `${config.apiUrl}/teams`,
    get: (id: string) => `${config.apiUrl}/teams/${id}`,
    update: (id: string) => `${config.apiUrl}/teams/${id}`,
    join: (id: string) => `${config.apiUrl}/teams/${id}/join`,
    leave: (id: string) => `${config.apiUrl}/teams/${id}/leave`,
  },
  leagues: {
    list: `${config.apiUrl}/leagues`,
    get: (id: string) => `${config.apiUrl}/leagues/${id}`,
    join: (id: string) => `${config.apiUrl}/leagues/${id}/join`,
  },
  facilities: {
    list: `${config.apiUrl}/facilities`,
    get: (id: string) => `${config.apiUrl}/facilities/${id}`,
    book: (id: string) => `${config.apiUrl}/facilities/${id}/book`,
  },
  bookings: {
    get: (id: string) => `${config.apiUrl}/bookings/${id}`,
    cancel: (id: string) => `${config.apiUrl}/bookings/${id}`,
  },
  games: {
    list: `${config.apiUrl}/games`,
    create: `${config.apiUrl}/games`,
    get: (id: string) => `${config.apiUrl}/games/${id}`,
    updateAttendance: (id: string) => `${config.apiUrl}/games/${id}/attendance`,
    report: (id: string) => `${config.apiUrl}/games/${id}/report`,
  },
  chat: {
    messages: (chatId: string) => `${config.apiUrl}/chats/${chatId}/messages`,
    sendMessage: (chatId: string) =>
      `${config.apiUrl}/chats/${chatId}/messages`,
    createPoll: (chatId: string) => `${config.apiUrl}/chats/${chatId}/polls`,
    votePoll: (pollId: string) => `${config.apiUrl}/polls/${pollId}/vote`,
  },
  social: {
    posts: `${config.apiUrl}/posts`,
    createPost: `${config.apiUrl}/posts`,
    likePost: (id: string) => `${config.apiUrl}/posts/${id}/like`,
    commentOnPost: (id: string) => `${config.apiUrl}/posts/${id}/comments`,
  },
  points: {
    transactions: `${config.apiUrl}/points/transactions`,
    purchase: `${config.apiUrl}/points/purchase`,
  },
  notifications: {
    list: `${config.apiUrl}/notifications`,
    markAsRead: (id: string) => `${config.apiUrl}/notifications/${id}/read`,
    markAllAsRead: `${config.apiUrl}/notifications/mark-all-read`,
    delete: (id: string) => `${config.apiUrl}/notifications/${id}`,
  },
  media: {
    uploadImage: `${config.apiUrl}/media/upload/image`,
    uploadVideo: `${config.apiUrl}/media/upload/video`,
  },
  export: {
    request: `${config.apiUrl}/export/request`,
  },
  qr: {
    validate: `${config.apiUrl}/qr/validate`,
    checkin: `${config.apiUrl}/qr/checkin`,
  },
};

export default config;
