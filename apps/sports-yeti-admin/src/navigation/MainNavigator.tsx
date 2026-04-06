import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Sidebar } from '../components';
import {
  DashboardScreen,
  LeagueListScreen,
  LeagueDetailScreen,
  LeagueFormScreen,
  TeamListScreen,
  TeamDetailScreen,
  PlayerListScreen,
  PlayerDetailScreen,
  PaymentListScreen,
  PaymentDetailScreen,
  AuditLogScreen,
  BookingCalendarScreen,
  FacilityListScreen,
  FacilityDetailScreen,
  FacilityFormScreen,
  RefereeListScreen,
  RefereeDetailScreen,
  RefereeAssignmentScreen,
  WaiverListScreen,
  WaiverDetailScreen,
  WaiverFormScreen,
  CampListScreen,
  CampDetailScreen,
  CampFormScreen,
  ScheduleScreen,
  FinancialDashboardScreen,
  StatsScreen,
  NewsScreen,
  AnalyticsScreen,
  SettingsScreen,
  MarketplaceMonitorScreen,
} from '../screens';
import { COLORS, NavItemId } from '../constants';
import { navigate as rootNavigate } from './RootNavigator';
import type { MainStackParamList } from '../types';

// Re-export for backward compatibility
export type { MainStackParamList } from '../types';

const Stack = createNativeStackNavigator<MainStackParamList>();

// Map route names to NavItemId
const routeToId: Record<string, NavItemId> = {
  Dashboard: 'dashboard',
  Leagues: 'leagues',
  LeagueDetail: 'leagues',
  LeagueForm: 'leagues',
  Teams: 'teams',
  TeamDetail: 'teams',
  Players: 'teams',
  PlayerDetail: 'teams',
  Facilities: 'facilities',
  FacilityDetail: 'facilities',
  FacilityForm: 'facilities',
  Bookings: 'schedule',
  Schedule: 'schedule',
  Waivers: 'waivers',
  WaiverDetail: 'waivers',
  WaiverForm: 'waivers',
  Camps: 'camps',
  CampDetail: 'camps',
  CampForm: 'camps',
  Finance: 'finance',
  Referees: 'referees',
  RefereeDetail: 'referees',
  RefereeAssignments: 'referees',
  Payments: 'payments',
  PaymentDetail: 'payments',
  AuditLogs: 'audit',
  Stats: 'stats',
  News: 'news',
  Analytics: 'analytics',
  Settings: 'settings',
  MarketplaceMonitor: 'marketplace',
};

interface MainContentProps {
  onRouteChange: (routeName: string) => void;
}

function MainContent({ onRouteChange }: MainContentProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
      screenListeners={{
        state: (e) => {
          // Get the current route name when navigation state changes
          const state = e.data.state;
          if (state && state.routes && state.routes.length > 0) {
            const currentRoute = state.routes[state.index ?? 0];
            onRouteChange(currentRoute.name);
          }
        },
      }}
    >
      {/* Dashboard */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} />

      {/* Leagues - B2 */}
      <Stack.Screen name="Leagues" component={LeagueListScreen} />
      <Stack.Screen name="LeagueDetail" component={LeagueDetailScreen} />
      <Stack.Screen name="LeagueForm" component={LeagueFormScreen} />

      {/* Teams - B2 */}
      <Stack.Screen name="Teams" component={TeamListScreen} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />

      {/* Players - B2 */}
      <Stack.Screen name="Players" component={PlayerListScreen} />
      <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} />

      {/* Facilities - B3 */}
      <Stack.Screen name="Facilities" component={FacilityListScreen} />
      <Stack.Screen name="FacilityDetail" component={FacilityDetailScreen} />
      <Stack.Screen name="FacilityForm" component={FacilityFormScreen} />
      <Stack.Screen name="Bookings" component={BookingCalendarScreen} />

      {/* Schedule */}
      <Stack.Screen name="Schedule" component={ScheduleScreen} />

      {/* Waivers */}
      <Stack.Screen name="Waivers" component={WaiverListScreen} />
      <Stack.Screen name="WaiverDetail" component={WaiverDetailScreen} />
      <Stack.Screen name="WaiverForm" component={WaiverFormScreen} />

      {/* Camps */}
      <Stack.Screen name="Camps" component={CampListScreen} />
      <Stack.Screen name="CampDetail" component={CampDetailScreen} />
      <Stack.Screen name="CampForm" component={CampFormScreen} />

      {/* Finance */}
      <Stack.Screen name="Finance" component={FinancialDashboardScreen} />

      {/* Referees */}
      <Stack.Screen name="Referees" component={RefereeListScreen} />
      <Stack.Screen name="RefereeDetail" component={RefereeDetailScreen} />
      <Stack.Screen name="RefereeAssignments" component={RefereeAssignmentScreen} />

      <Stack.Screen name="Payments" component={PaymentListScreen} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
      <Stack.Screen name="AuditLogs" component={AuditLogScreen} />

      {/* Stats & Highlights */}
      <Stack.Screen name="Stats" component={StatsScreen} />

      {/* News & Ads */}
      <Stack.Screen name="News" component={NewsScreen} />

      {/* Analytics */}
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />

      {/* Settings */}
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* Marketplace Monitor */}
      <Stack.Screen name="MarketplaceMonitor" component={MarketplaceMonitorScreen} />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  const [activeRoute, setActiveRoute] = useState<NavItemId>('dashboard');

  const handleRouteChange = useCallback((routeName: string) => {
    setActiveRoute(routeToId[routeName] || 'dashboard');
  }, []);

  const handleNavigate = useCallback((route: string) => {
    // Navigate using the root navigation ref
    rootNavigate(route as keyof MainStackParamList);
    setActiveRoute(routeToId[route] || 'dashboard');
  }, []);

  return (
    <View style={styles.container}>
      <Sidebar activeRoute={activeRoute} onNavigate={handleNavigate} />
      <View style={styles.content}>
        <MainContent onRouteChange={handleRouteChange} />
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
