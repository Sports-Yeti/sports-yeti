import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { useAuthStore } from '../stores';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator, type MainStackParamList } from './MainNavigator';
import { colors } from '../theme';

export const navigationRef = createNavigationContainerRef<MainStackParamList>();

export function navigate<RouteName extends keyof MainStackParamList>(
  name: RouteName,
  params?: MainStackParamList[RouteName],
) {
  if (navigationRef.isReady()) {
    // react-navigation's typed overloads don't gracefully accept the
    // generic RouteName + optional params shape, so we widen here.
    (navigationRef.navigate as (n: string, p?: unknown) => void)(name, params);
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
        <ActivityIndicator size="large" color={colors.brand.primary} />
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
    backgroundColor: colors.surface.sidebar,
  },
});
