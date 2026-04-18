import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  DiscoverScreen,
  HighlightsFeedScreen,
  SquadsScreen,
  ScheduleScreen,
  ProfileTabScreen,
  FacilitiesScreen,
  FacilityDetailScreen,
  GamesScreen,
  GameDetailScreen,
  CreateGameScreen,
  TeamDetailScreen,
  PlayerDirectoryScreen,
  LeagueBrowseScreen,
  TeamPaymentScreen,
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
  SubRequestsScreen,
  MessagesScreen,
  AvailableGamesScreen,
  MyAssignmentsScreen,
  RefereeEarningsScreen,
  RefereeProfileScreen,
  WaiversScreen,
  ComponentShowcaseScreen,
} from '../screens';
import { colors } from '../theme';
import { fontFamilies } from '../theme/typography';
import { SportsYetiTabBar } from './SportsYetiTabBar';

export type MainTabParamList = {
  Discover: undefined;
  Highlights: undefined;
  Teams: undefined;
  Schedule: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  GameDetails: { id: string };
  CreateGame: undefined;
  Games: undefined;
  FacilityDetails: { id: string };
  BookingDetails: { id: string };
  CampDetails: { id: string };
  TeamDetails: { id: string };
  Camps: undefined;
  Bookings: { spaceId?: string; facilityId?: string };
  Scanner: undefined;
  Chat: { chatId: string; title?: string };
  Messages: undefined;
  Marketplace: undefined;
  HighlightUpload: undefined;
  HighlightDetail: { id: string };
  Highlights: undefined;
  Facilities: undefined;
  PlayerDirectory: undefined;
  LeagueBrowse: undefined;
  TeamPayment: { teamId: string };
  SubRequests: undefined;
  Waivers: undefined;
  RefereeAvailableGames: undefined;
  RefereeMyAssignments: undefined;
  RefereeEarnings: undefined;
  RefereeProfile: undefined;
  ComponentShowcase: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
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
      <Tab.Screen name="Highlights" component={HighlightsFeedScreen} />
      <Tab.Screen name="Teams" component={SquadsScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Profile" component={ProfileTabScreen} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface.card,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontFamily: fontFamilies.displayBold,
          fontSize: 18,
        },
        contentStyle: { backgroundColor: colors.surface.bg },
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
        name="Games"
        component={GamesScreen}
        options={{ title: 'Games' }}
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
        name="Messages"
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{ title: 'Marketplace' }}
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
        name="PlayerDirectory"
        component={PlayerDirectoryScreen}
        options={{ title: 'Player Directory' }}
      />
      <Stack.Screen
        name="LeagueBrowse"
        component={LeagueBrowseScreen}
        options={{ title: 'Browse Leagues' }}
      />
      <Stack.Screen
        name="TeamPayment"
        component={TeamPaymentScreen}
        options={{ title: 'Team Payment' }}
      />
      <Stack.Screen
        name="SubRequests"
        component={SubRequestsScreen}
        options={{ title: 'Sub Requests' }}
      />
      <Stack.Screen
        name="Waivers"
        component={WaiversScreen}
        options={{ title: 'Waivers' }}
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
      <Stack.Screen
        name="ComponentShowcase"
        component={ComponentShowcaseScreen}
        options={{ title: 'Design System' }}
      />
    </Stack.Navigator>
  );
}
