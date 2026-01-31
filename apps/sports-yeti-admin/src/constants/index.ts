export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Admin dashboard uses a darker, more professional color scheme
export const COLORS = {
  // Primary - Slate/Blue professional palette
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',

  // Secondary accents
  secondary: '#8B5CF6',
  accent: '#06B6D4',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Surfaces
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceHover: '#F8FAFC',
  sidebar: '#1E293B',
  sidebarHover: '#334155',
  sidebarActive: '#3B82F6',

  // Text
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#FFFFFF',
  textMuted: '#94A3B8',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Disabled
  disabled: '#CBD5E1',
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

// Admin sidebar configuration
export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

// Admin navigation items
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', route: 'Dashboard' },
  { id: 'leagues', label: 'Leagues', icon: '🏆', route: 'Leagues' },
  { id: 'teams', label: 'Teams', icon: '👥', route: 'Teams' },
  { id: 'players', label: 'Players', icon: '🏃', route: 'Players' },
  { id: 'facilities', label: 'Facilities', icon: '🏟️', route: 'Facilities' },
  { id: 'bookings', label: 'Bookings', icon: '📅', route: 'Bookings' },
  { id: 'payments', label: 'Payments', icon: '💳', route: 'Payments' },
  { id: 'audit', label: 'Audit Logs', icon: '📋', route: 'AuditLogs' },
] as const;

export type NavItemId = (typeof NAV_ITEMS)[number]['id'];
