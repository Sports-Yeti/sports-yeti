import React, { useCallback, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores';
import { AppShell, type AdminRouteName } from '../admin';
import {
  AnalyticsScreen,
  AuditLogScreen,
  BookingCalendarScreen,
  BookingDetailScreen,
  BookingFormScreen,
  CampDetailScreen,
  CampFormScreen,
  CampListScreen,
  DashboardScreen,
  FacilityDetailScreen,
  FacilityFormScreen,
  FacilityListScreen,
  FinancialDashboardScreen,
  FixtureGeneratorScreen,
  GameDetailScreen,
  GameFormScreen,
  InvitePeopleScreen,
  LeagueDetailScreen,
  LeagueFormScreen,
  LeagueListScreen,
  MarketplaceScreen,
  NewsComposerScreen,
  NewsScreen,
  OperationsScreen,
  PaymentDetailScreen,
  PaymentListScreen,
  PlayerListScreen,
  RefereeListScreen,
  ScheduleScreen,
  SettingsScreen,
  StatsScreen,
  TeamDetailScreen,
  TeamListScreen,
  WaiverDetailScreen,
  WaiverFormScreen,
  WaiverListScreen,
} from '../screens';
import { navigate as rootNavigate } from './RootNavigator';

export type MainStackParamList = {
  Dashboard: undefined;
  Operations: undefined;
  Leagues: undefined;
  LeagueDetail: { id: string };
  LeagueForm: { id?: string } | undefined;
  Teams: undefined;
  TeamDetail: { id: string };
  Schedule: undefined;
  GameDetail: { id: string };
  GameForm: { id?: string } | undefined;
  FixtureGenerator: { id?: string } | undefined;
  Players: undefined;
  Referees: undefined;
  InvitePeople: { id?: string } | undefined;
  Camps: undefined;
  CampDetail: { id: string };
  CampForm: { id?: string } | undefined;
  Waivers: undefined;
  WaiverDetail: { id: string };
  WaiverForm: { id?: string } | undefined;
  Facilities: undefined;
  FacilityDetail: { id: string };
  FacilityForm: { id?: string } | undefined;
  Bookings: undefined;
  BookingDetail: { id: string };
  BookingForm: { id?: string } | undefined;
  Payments: undefined;
  PaymentDetail: { id: string };
  Finance: undefined;
  Analytics: undefined;
  Stats: undefined;
  AuditLog: undefined;
  Marketplace: undefined;
  News: undefined;
  NewsComposer: { id?: string } | undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  const logout = useAuthStore((s) => s.logout);
  const [activeRoute, setActiveRoute] = useState<AdminRouteName>('Dashboard');

  const handleNavigate = useCallback((route: AdminRouteName) => {
    rootNavigate(route as keyof MainStackParamList);
    setActiveRoute(route);
  }, []);

  return (
    <AppShell
      activeRoute={activeRoute}
      onNavigate={handleNavigate}
      onLogout={() => {
        logout().catch(() => undefined);
      }}
    >
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'none' }}
        screenListeners={{
          state: (e) => {
            const state = e.data.state as
              | { routes: { name: string }[]; index?: number }
              | undefined;
            if (state?.routes && state.routes.length > 0) {
              const current = state.routes[state.index ?? 0];
              if (current?.name) setActiveRoute(current.name as AdminRouteName);
            }
          },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Operations" component={OperationsScreen} />
        <Stack.Screen name="Leagues" component={LeagueListScreen} />
        <Stack.Screen name="LeagueDetail" component={LeagueDetailScreen} />
        <Stack.Screen name="LeagueForm" component={LeagueFormScreen} />
        <Stack.Screen name="Teams" component={TeamListScreen} />
        <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="GameDetail" component={GameDetailScreen} />
        <Stack.Screen name="GameForm" component={GameFormScreen} />
        <Stack.Screen name="FixtureGenerator" component={FixtureGeneratorScreen} />
        <Stack.Screen name="Players" component={PlayerListScreen} />
        <Stack.Screen name="Referees" component={RefereeListScreen} />
        <Stack.Screen name="InvitePeople" component={InvitePeopleScreen} />
        <Stack.Screen name="Camps" component={CampListScreen} />
        <Stack.Screen name="CampDetail" component={CampDetailScreen} />
        <Stack.Screen name="CampForm" component={CampFormScreen} />
        <Stack.Screen name="Waivers" component={WaiverListScreen} />
        <Stack.Screen name="WaiverDetail" component={WaiverDetailScreen} />
        <Stack.Screen name="WaiverForm" component={WaiverFormScreen} />
        <Stack.Screen name="Facilities" component={FacilityListScreen} />
        <Stack.Screen name="FacilityDetail" component={FacilityDetailScreen} />
        <Stack.Screen name="FacilityForm" component={FacilityFormScreen} />
        <Stack.Screen name="Bookings" component={BookingCalendarScreen} />
        <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
        <Stack.Screen name="BookingForm" component={BookingFormScreen} />
        <Stack.Screen name="Payments" component={PaymentListScreen} />
        <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
        <Stack.Screen name="Finance" component={FinancialDashboardScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="AuditLog" component={AuditLogScreen} />
        <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
        <Stack.Screen name="News" component={NewsScreen} />
        <Stack.Screen name="NewsComposer" component={NewsComposerScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </AppShell>
  );
}
