export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Sentry configuration
export const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
