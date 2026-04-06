import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import {
  DashboardScreen,
  FacilitiesScreen,
  FacilityDetailScreen,
  GamesScreen,
  GameDetailScreen,
  CreateGameScreen,
  ProfileScreen,
  TeamsScreen,
  TeamDetailScreen,
  BookingsScreen,
  BookingDetailScreen,
  CampsScreen,
  CampDetailScreen,
  ChatScreen,
  ScannerScreen,
  MyHighlightsScreen,
  HighlightUploadScreen,
  HighlightDetailScreen,
  MarketplaceScreen,
  MessagesScreen,
  AvailableGamesScreen,
  MyAssignmentsScreen,
  RefereeEarningsScreen,
  RefereeProfileScreen,
} from '../screens';
import { COLORS } from '../constants';

export type MainTabParamList = {
  Dashboard: undefined;
  Games: undefined;
  Teams: undefined;
  Marketplace: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  GameDetails: { id: string };
  CreateGame: undefined;
  FacilityDetails: { id: string };
  BookingDetails: { id: string };
  CampDetails: { id: string };
  TeamDetails: { id: string };
  Camps: undefined;
  Bookings: { spaceId?: string; facilityId?: string };
  Scanner: undefined;
  Chat: { chatId: string; title?: string };
  HighlightUpload: undefined;
  HighlightDetail: { id: string };
  Highlights: undefined;
  Facilities: undefined;
  RefereeAvailableGames: undefined;
  RefereeMyAssignments: undefined;
  RefereeEarnings: undefined;
  RefereeProfile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏠',
    Games: '🏀',
    Teams: '👥',
    Marketplace: '🏪',
    Messages: '💬',
    Profile: '👤',
  };

  return (
    <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.6 }}>
      {icons[name] || '📱'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Home',
          headerTitle: 'Sports Yeti',
        }}
      />
      <Tab.Screen
        name="Games"
        component={GamesScreen}
        options={{
          title: 'Games',
          headerTitle: 'Games',
        }}
      />
      <Tab.Screen
        name="Teams"
        component={TeamsScreen}
        options={{
          title: 'Teams',
          headerTitle: 'Teams',
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          title: 'Marketplace',
          headerTitle: 'Marketplace',
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Messages',
          headerTitle: 'Messages',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
}


export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GameDetails"
        component={GameDetailScreen}
        options={{ title: 'Game Details' }}
      />
      <Stack.Screen
        name="CreateGame"
        component={CreateGameScreen}
        options={{ title: 'Create Game' }}
      />
      <Stack.Screen
        name="FacilityDetails"
        component={FacilityDetailScreen}
        options={{ title: 'Facility Details' }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailScreen}
        options={{ title: 'Booking Details' }}
      />
      <Stack.Screen
        name="CampDetails"
        component={CampDetailScreen}
        options={{ title: 'Camp Details' }}
      />
      <Stack.Screen
        name="TeamDetails"
        component={TeamDetailScreen}
        options={{ title: 'Team Details' }}
      />
      <Stack.Screen
        name="Camps"
        component={CampsScreen}
        options={{ title: 'Training Camps' }}
      />
      <Stack.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ title: 'My Bookings' }}
      />
      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{ title: 'Scan QR Code', headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Chat',
        })}
      />
      <Stack.Screen
        name="HighlightUpload"
        component={HighlightUploadScreen}
        options={{ title: 'New Highlight' }}
      />
      <Stack.Screen
        name="HighlightDetail"
        component={HighlightDetailScreen}
        options={{ title: 'Highlight Details' }}
      />
      <Stack.Screen
        name="Highlights"
        component={MyHighlightsScreen}
        options={{ title: 'Highlights Studio' }}
      />
      <Stack.Screen
        name="Facilities"
        component={FacilitiesScreen}
        options={{ title: 'Facilities' }}
      />
      <Stack.Screen
        name="RefereeAvailableGames"
        component={AvailableGamesScreen}
        options={{ title: 'Available Games' }}
      />
      <Stack.Screen
        name="RefereeMyAssignments"
        component={MyAssignmentsScreen}
        options={{ title: 'My Assignments' }}
      />
      <Stack.Screen
        name="RefereeEarnings"
        component={RefereeEarningsScreen}
        options={{ title: 'Earnings' }}
      />
      <Stack.Screen
        name="RefereeProfile"
        component={RefereeProfileScreen}
        options={{ title: 'Referee Profile' }}
      />
    </Stack.Navigator>
  );
}
