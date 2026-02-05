import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { RootNavigator } from '../navigation';
import { ErrorBoundary } from '../components';
import { SENTRY_DSN, IS_PRODUCTION } from '../constants';

// Initialize Sentry
Sentry.init({
  dsn: SENTRY_DSN,
  // Send default PII data (e.g., automatic IP address collection)
  sendDefaultPii: true,
  // Enable automatic instrumentation
  enableAutoSessionTracking: true,
  // Set sample rates for production vs development
  tracesSampleRate: IS_PRODUCTION ? 0.2 : 1.0,
  // Enable performance monitoring
  enableAutoPerformanceTracing: true,
  // Set environment
  environment: IS_PRODUCTION ? 'production' : 'development',
  // Debug mode for development
  debug: !IS_PRODUCTION,
  // Set release identifier
  release: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  // Configure beforeSend to filter/modify events
  beforeSend(event) {
    // Don't send events if no DSN is configured
    if (!SENTRY_DSN) {
      return null;
    }
    return event;
  },
  // Integrate with React Navigation
  integrations: [
    Sentry.reactNavigationIntegration({
      enableTimeToInitialDisplay: true,
    }),
  ],
});

// Create a client for React Query with Sentry integration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        // Capture mutation errors in Sentry
        Sentry.captureException(error, {
          tags: { type: 'react_query_mutation' },
        });
      },
    },
  },
});

function AppContent() {
  useEffect(() => {
    // Add navigation breadcrumb on app start
    Sentry.addBreadcrumb({
      category: 'lifecycle',
      message: 'App mounted',
      level: 'info',
    });

    return () => {
      Sentry.addBreadcrumb({
        category: 'lifecycle',
        message: 'App unmounted',
        level: 'info',
      });
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

// Wrap the app with Sentry for automatic error boundary on the entire app
export default Sentry.wrap(App);
