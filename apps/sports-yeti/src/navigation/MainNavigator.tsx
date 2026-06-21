import React from 'react';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BookingDetailScreen,
  BookingsScreen,
  ChatScreen,
  ComponentShowcaseScreen,
  CreateGameScreen,
  FormControlsScreen,
  UIGalleryScreen,
  DiscoverScreen,
  FacilitiesScreen,
  FacilityDetailScreen,
  GameDetailScreen,
  HighlightDetailScreen,
  HighlightUploadScreen,
  HighlightsFeedScreen,
  LeagueBrowseScreen,
  LeagueDetailScreen,
  MessagesScreen,
  MyHighlightsScreen,
  NewsScreen,
  NewsArticleScreen,
  NotificationsScreen,
  PlayerDirectoryScreen,
  PlayerProfileScreen,
  BookmarkedHighlightsScreen,
  ProfileEditScreen,
  ProfileTabScreen,
  RoleHomeScreen,
  RolesScreen,
  ScheduleScreen,
  ScheduledEventDetailScreen,
  SettingsScreen,
  SquadsScreen,
  TeamDetailScreen,
  TeamPaymentScreen,
  WaiversScreen,
  // Phase 4 — Captain
  CaptainHomeScreen,
  TeamCreateScreen,
  TeamRosterScreen,
  DivisionApplyScreen,
  SubRequestCreateScreen,
  SubRequestInboxScreen,
  // Phase 5 — Player + Waiver gate
  WaiverGateScreen,
  WaiverSignScreen,
  JoinGamePaymentSheet,
  // Phase 6 — Referee
  RefereeHomeScreen,
  MarketplaceGameDetailScreen,
  GameReportScreen,
  // Phase 9 — News feed
  NewsFeedScreen,
  NewsDetailScreen,
} from '../screens';
import { colors } from '../theme';
import { SportsYetiTabBar } from './SportsYetiTabBar';
import { useRoleStack } from '../features/role-stack';

export type MainTabParamList = {
  Discover: undefined;
  News: undefined;
  Teams: undefined;
  Highlights: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Tabs container — typed as a nested navigator so callers can do
  // `navigation.navigate('MainTabs', { screen: 'News' })` from any
  // sibling stack screen (GameDetail, HighlightDetail, etc.).
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  // Discover / Schedule stack
  GameDetails: { id: string };
  CreateGame: undefined;
  ScheduledEventDetail: { id: string };
  // Schedule moved off the tab bar — now reachable from Profile -> More.
  Schedule: undefined;

  // Teams stack
  TeamDetails: { id: string };
  TeamPayment: { teamId: string };
  PlayerDirectory: undefined;
  LeagueBrowse:
    | { mode?: 'browse' | 'captain'; teamId?: string; fromChatId?: string }
    | undefined;
  LeagueDetails: { leagueId: string };

  // Highlights stack
  Highlights: undefined; // alias for going to Highlights feed tab from elsewhere
  MyHighlights: undefined;
  HighlightUpload: undefined;
  HighlightDetail: { id: string };

  // Profile stack
  ProfileEdit: undefined;
  PlayerProfile: { playerId: string };
  BookmarkedHighlights: undefined;
  Settings: undefined;
  Notifications: undefined;
  Waivers: undefined;
  Roles: undefined;

  // Captain stack (Phase 4)
  TeamCreate: undefined;
  TeamRoster: { teamId: string };
  DivisionApply: undefined;
  SubRequestCreate: undefined;
  SubRequestInbox: { teamId: string };

  // Player + Waiver (Phase 5)
  WaiverGate: {
    action: string;
    scopes: { kind: 'organization' | 'league' | 'division' | 'facility'; scopeId: string }[];
  };
  WaiverSign: { waiverId: string };
  JoinGamePayment: { gameId: string };

  // Referee (Phase 6)
  MarketplaceGameDetail: { gameId: string };
  GameReport: { assignmentId: string };

  // News feed (Phase 9)
  NewsFeed: undefined;
  NewsDetail: { articleId: string };
  // Consumer news tab → story detail with community comments.
  NewsArticle: { articleId: string };

  // Auxiliary (reachable from Profile -> More)
  Bookings: undefined;
  BookingDetails: { id: string };
  Facilities: undefined;
  FacilityDetails: { id: string };
  Messages: undefined;
  Chat: { chatId: string; title?: string };

  // Dev
  ComponentShowcase: undefined;
  FormControls: undefined;
  UIGallery: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Player tab set — the existing default. Discover / Schedule / Highlights /
 * Teams / Profile.
 */
function PlayerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <SportsYetiTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.surface.bg },
      }}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Highlights" component={HighlightsFeedScreen} />
      <Tab.Screen name="Teams" component={SquadsScreen} />
      <Tab.Screen name="Profile" component={ProfileTabScreen} />
    </Tab.Navigator>
  );
}

/**
 * Captain tab set — Phase 4. Home (CaptainHome) + Schedule + Profile.
 * Captain's Home surfaces team management, sub-requests, and quick links
 * to the focused stack screens (TeamCreate / DivisionApply / etc.).
 */
function CaptainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <SportsYetiTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.surface.bg },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={CaptainHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Profile" component={ProfileTabScreen} />
    </Tab.Navigator>
  );
}

/**
 * Referee tab set — Phase 6. Home (RefereeHomeScreen surfaces inbox +
 * marketplace + accepted + completed) + Schedule + Profile.
 */
function RefereeTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <SportsYetiTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.surface.bg },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={RefereeHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Profile" component={ProfileTabScreen} />
    </Tab.Navigator>
  );
}

/**
 * FM / OrgAdmin / LeagueAdmin tab sets are still placeholders (Phase 3).
 * Phases 7–8 replace each Home with real journeys (mostly admin-web).
 */
function makeRoleTabs(label: 'FM' | 'OrgAdmin' | 'LeagueAdmin') {
  function Component() {
    return (
      <Tab.Navigator
        tabBar={(props) => <SportsYetiTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          sceneStyle: { backgroundColor: colors.surface.bg },
        }}
      >
        <Tab.Screen
          name="Discover"
          component={RoleHomeScreen}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen name="News" component={NewsScreen} />
        <Tab.Screen name="Profile" component={ProfileTabScreen} />
      </Tab.Navigator>
    );
  }
  Component.displayName = `${label}Tabs`;
  return Component;
}

const FmTabs = makeRoleTabs('FM');
const OrgAdminTabs = makeRoleTabs('OrgAdmin');
const LeagueAdminTabs = makeRoleTabs('LeagueAdmin');

/**
 * Picks the right tab set based on the active role. The user's Role
 * Switcher (in the Profile tab + on RoleHomeScreen) calls
 * `setActiveRoleByIndex` and this component re-renders with the new tabs.
 */
function MainTabs() {
  const { activeRole } = useRoleStack();
  switch (activeRole.role) {
    case 'player':
      return <PlayerTabs />;
    case 'team_captain':
      return <CaptainTabs />;
    case 'referee':
      return <RefereeTabs />;
    case 'facility_manager':
      return <FmTabs />;
    case 'org_admin':
      return <OrgAdminTabs />;
    case 'league_admin':
      return <LeagueAdminTabs />;
  }
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface.bg },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="GameDetails" component={GameDetailScreen} />
      <Stack.Screen name="CreateGame" component={CreateGameScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen
        name="ScheduledEventDetail"
        component={ScheduledEventDetailScreen}
      />
      <Stack.Screen name="TeamDetails" component={TeamDetailScreen} />
      <Stack.Screen name="TeamPayment" component={TeamPaymentScreen} />
      <Stack.Screen name="PlayerDirectory" component={PlayerDirectoryScreen} />
      <Stack.Screen name="LeagueBrowse" component={LeagueBrowseScreen} />
      <Stack.Screen name="LeagueDetails" component={LeagueDetailScreen} />
      <Stack.Screen name="MyHighlights" component={MyHighlightsScreen} />
      <Stack.Screen name="HighlightUpload" component={HighlightUploadScreen} />
      <Stack.Screen name="HighlightDetail" component={HighlightDetailScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} />
      <Stack.Screen
        name="BookmarkedHighlights"
        component={BookmarkedHighlightsScreen}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Waivers" component={WaiversScreen} />
      <Stack.Screen name="Roles" component={RolesScreen} />

      {/* Captain stack (Phase 4) */}
      <Stack.Screen name="TeamCreate" component={TeamCreateScreen} />
      <Stack.Screen name="TeamRoster" component={TeamRosterScreen} />
      <Stack.Screen name="DivisionApply" component={DivisionApplyScreen} />
      <Stack.Screen
        name="SubRequestCreate"
        component={SubRequestCreateScreen}
      />
      <Stack.Screen
        name="SubRequestInbox"
        component={SubRequestInboxScreen}
      />

      {/* Player + Waiver (Phase 5) */}
      <Stack.Screen name="WaiverGate" component={WaiverGateScreen} />
      <Stack.Screen name="WaiverSign" component={WaiverSignScreen} />
      <Stack.Screen
        name="JoinGamePayment"
        component={JoinGamePaymentSheet}
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />

      {/* Referee (Phase 6) */}
      <Stack.Screen
        name="MarketplaceGameDetail"
        component={MarketplaceGameDetailScreen}
      />
      <Stack.Screen name="GameReport" component={GameReportScreen} />

      {/* News feed (Phase 9) */}
      <Stack.Screen name="NewsFeed" component={NewsFeedScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      <Stack.Screen name="NewsArticle" component={NewsArticleScreen} />
      <Stack.Screen name="Bookings" component={BookingsScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailScreen} />
      <Stack.Screen name="Facilities" component={FacilitiesScreen} />
      <Stack.Screen name="FacilityDetails" component={FacilityDetailScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ComponentShowcase" component={ComponentShowcaseScreen} />
      <Stack.Screen name="FormControls" component={FormControlsScreen} />
      <Stack.Screen name="UIGallery" component={UIGalleryScreen} />
    </Stack.Navigator>
  );
}
