import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { useAuthStore } from '../stores';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { COLORS } from '../constants';
import type { MainStackParamList } from '../types';

// Create a navigation ref that can be used outside of React components
export const navigationRef = createNavigationContainerRef<MainStackParamList>();

// Helper function to navigate from anywhere
export function navigate<RouteName extends keyof MainStackParamList>(
  name: RouteName,
  params?: MainStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params as never);
  }
}

export function RootNavigator() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.sidebar,
  },
});
