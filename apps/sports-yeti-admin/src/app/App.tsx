import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UIThemeProvider } from '@sports-yeti/ui';
import { uiTheme } from '../theme';
import { RootNavigator } from '../navigation';
import { ToastProvider } from '../ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true, // Admin dashboard should refetch on focus
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <UIThemeProvider value={uiTheme}>
          <ToastProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </ToastProvider>
        </UIThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
