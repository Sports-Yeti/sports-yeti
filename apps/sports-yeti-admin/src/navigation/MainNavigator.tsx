import React, { useCallback, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores';
import { AppShell, type AdminRouteName } from '../admin';
import {
  AnalyticsScreen,
  ApprovalsInboxScreen,
  AuditLogScreen,
  BookingCalendarScreen,
  BookingDetailScreen,
  BookingFormScreen,
  CampDetailScreen,
  CampFormScreen,
  CampListScreen,
  DashboardScreen,
  DivisionDetailScreen,
  DivisionFormScreen,
  DivisionListScreen,
  ExternalBookingRequestScreen,
  ExternalRentalListingScreen,
  FacilityDetailScreen,
  FmAnalyticsScreen,
  FmDashboardScreen,
  OrgBrandingScreen,
  OrgIntegrationsScreen,
  OrgMoneyScreen,
  OrgPeopleScreen,
  OrgPulseScreen,
  FacilityFormScreen,
  FacilityListScreen,
  RecurringAvailabilityEditor,
  SpaceFormScreen,
  FinancialDashboardScreen,
  FixtureGeneratorScreen,
  FormControlsScreen,
  UIGalleryScreen,
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
  OrganizationDetailScreen,
  OrganizationListScreen,
  PaymentDetailScreen,
  PaymentListScreen,
  PlayerListScreen,
  RefereeMarketplaceScreen,
  ScheduleScreen,
  SeasonDetailScreen,
  SeasonFormScreen,
  SeasonListScreen,
  SettingsScreen,
  StatsScreen,
  TeamDetailScreen,
  TeamFormScreen,
  TeamListScreen,
  WaiverDetailScreen,
  WaiverFormScreen,
  WaiverListScreen,
} from '../screens';
import { navigate as rootNavigate } from './RootNavigator';

export type MainStackParamList = {
  Dashboard: undefined;
  Operations: undefined;
  Approvals: undefined;
  Organizations: undefined;
  OrganizationDetail: { id: string };
  Leagues: undefined;
  LeagueDetail: { id: string };
  LeagueForm: { id?: string } | undefined;
  Seasons: undefined;
  SeasonDetail: { id: string };
  SeasonForm: { id?: string } | undefined;
  Divisions: undefined;
  DivisionDetail: { id: string };
  DivisionForm: { id?: string } | undefined;
  Teams: undefined;
  TeamDetail: { id: string };
  TeamForm: { id?: string } | undefined;
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
  SpaceForm: { id?: string } | undefined;
  FacilityAvailability: { id: string };
  ExternalRentalListing: { id: string };
  ExternalBookingRequest: { id: string };
  FmDashboard: undefined;
  FmAnalytics: undefined;
  OrgPulse: undefined;
  OrgMoney: undefined;
  OrgPeople: undefined;
  OrgIntegrations: undefined;
  OrgBranding: { id?: string } | undefined;
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
  FormControls: undefined;
  UIGallery: undefined;
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
        <Stack.Screen name="Approvals" component={ApprovalsInboxScreen} />
        <Stack.Screen name="Organizations" component={OrganizationListScreen} />
        <Stack.Screen
          name="OrganizationDetail"
          component={OrganizationDetailScreen}
        />
        <Stack.Screen name="Leagues" component={LeagueListScreen} />
        <Stack.Screen name="LeagueDetail" component={LeagueDetailScreen} />
        <Stack.Screen name="LeagueForm" component={LeagueFormScreen} />
        <Stack.Screen name="Seasons" component={SeasonListScreen} />
        <Stack.Screen name="SeasonDetail" component={SeasonDetailScreen} />
        <Stack.Screen name="SeasonForm" component={SeasonFormScreen} />
        <Stack.Screen name="Divisions" component={DivisionListScreen} />
        <Stack.Screen name="DivisionDetail" component={DivisionDetailScreen} />
        <Stack.Screen name="DivisionForm" component={DivisionFormScreen} />
        <Stack.Screen name="Teams" component={TeamListScreen} />
        <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
        <Stack.Screen name="TeamForm" component={TeamFormScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="GameDetail" component={GameDetailScreen} />
        <Stack.Screen name="GameForm" component={GameFormScreen} />
        <Stack.Screen name="FixtureGenerator" component={FixtureGeneratorScreen} />
        <Stack.Screen name="Players" component={PlayerListScreen} />
        <Stack.Screen name="Referees" component={RefereeMarketplaceScreen} />
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
        <Stack.Screen name="SpaceForm" component={SpaceFormScreen} />
        <Stack.Screen
          name="FacilityAvailability"
          component={RecurringAvailabilityEditor}
        />
        <Stack.Screen
          name="ExternalRentalListing"
          component={ExternalRentalListingScreen}
        />
        <Stack.Screen
          name="ExternalBookingRequest"
          component={ExternalBookingRequestScreen}
        />
        <Stack.Screen name="FmDashboard" component={FmDashboardScreen} />
        <Stack.Screen name="FmAnalytics" component={FmAnalyticsScreen} />
        <Stack.Screen name="OrgPulse" component={OrgPulseScreen} />
        <Stack.Screen name="OrgMoney" component={OrgMoneyScreen} />
        <Stack.Screen name="OrgPeople" component={OrgPeopleScreen} />
        <Stack.Screen
          name="OrgIntegrations"
          component={OrgIntegrationsScreen}
        />
        <Stack.Screen name="OrgBranding" component={OrgBrandingScreen} />
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
        <Stack.Screen name="FormControls" component={FormControlsScreen} />
        <Stack.Screen name="UIGallery" component={UIGalleryScreen} />
      </Stack.Navigator>
    </AppShell>
  );
}
