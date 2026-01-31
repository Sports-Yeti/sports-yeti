export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Sentry configuration
export const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const COLORS = {
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#E3F2FD',
  secondary: '#FF6F00',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  border: '#E0E0E0',
  disabled: '#BDBDBD',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const EXPERIENCE_LEVELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  pro: 'Professional',
};

export const AVAILABILITY_STATUS = {
  available: 'Available',
  looking_for_team: 'Looking for Team',
  unavailable: 'Unavailable',
};

export const GAME_STATUS = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  postponed: 'Postponed',
};

export const BOOKING_STATUS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};
