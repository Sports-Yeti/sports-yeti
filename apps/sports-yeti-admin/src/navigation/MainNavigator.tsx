import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Sidebar } from '../components';
import { DashboardScreen } from '../screens';
import { COLORS, NavItemId } from '../constants';

export type MainStackParamList = {
  Dashboard: undefined;
  Leagues: undefined;
  Teams: undefined;
  Players: undefined;
  Facilities: undefined;
  Bookings: undefined;
  Payments: undefined;
  AuditLogs: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

// Placeholder screens for Wave 2
function PlaceholderScreen() {
  return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
}

function MainContent() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Leagues" component={PlaceholderScreen} />
      <Stack.Screen name="Teams" component={PlaceholderScreen} />
      <Stack.Screen name="Players" component={PlaceholderScreen} />
      <Stack.Screen name="Facilities" component={PlaceholderScreen} />
      <Stack.Screen name="Bookings" component={PlaceholderScreen} />
      <Stack.Screen name="Payments" component={PlaceholderScreen} />
      <Stack.Screen name="AuditLogs" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  const [activeRoute, setActiveRoute] = useState<NavItemId>('dashboard');

  const handleNavigate = (route: string) => {
    // Map route to NavItemId
    const routeToId: Record<string, NavItemId> = {
      Dashboard: 'dashboard',
      Leagues: 'leagues',
      Teams: 'teams',
      Players: 'players',
      Facilities: 'facilities',
      Bookings: 'bookings',
      Payments: 'payments',
      AuditLogs: 'audit',
    };
    setActiveRoute(routeToId[route] || 'dashboard');
  };

  return (
    <View style={styles.container}>
      <Sidebar activeRoute={activeRoute} onNavigate={handleNavigate} />
      <View style={styles.content}>
        <MainContent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
