export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Sentry configuration
export const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Stripe publishable key (pk_test_… or pk_live_…).
// Publishable keys are intended for client distribution, but each project
// must use ITS OWN key — using Stripe's public docs key would route demo
// charges to Stripe's account. We default to an empty string so the SDK
// initializes in mock mode until EXPO_PUBLIC_STRIPE_KEY is configured.
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_KEY ?? '';
