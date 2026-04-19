import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BookingDetailScreen,
  BookingsScreen,
  ChatScreen,
  ComponentShowcaseScreen,
  CreateGameScreen,
  FormControlsScreen,
  DiscoverScreen,
  FacilitiesScreen,
  FacilityDetailScreen,
  GameDetailScreen,
  HighlightDetailScreen,
  HighlightUploadScreen,
  HighlightsFeedScreen,
  LeagueBrowseScreen,
  MessagesScreen,
  MyHighlightsScreen,
  NotificationsScreen,
  PlayerDirectoryScreen,
  ProfileEditScreen,
  ProfileTabScreen,
  ScheduleScreen,
  SettingsScreen,
  SquadsScreen,
  TeamDetailScreen,
  TeamPaymentScreen,
  WaiversScreen,
} from '../screens';
import { colors } from '../theme';
import { SportsYetiTabBar } from './SportsYetiTabBar';

export type MainTabParamList = {
  Discover: undefined;
  Schedule: undefined;
  Teams: undefined;
  Highlights: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Tabs container
  MainTabs: undefined;

  // Discover / Schedule stack
  GameDetails: { id: string };
  CreateGame: undefined;

  // Teams stack
  TeamDetails: { id: string };
  TeamPayment: { teamId: string };
  PlayerDirectory: undefined;
  LeagueBrowse: undefined;

  // Highlights stack
  Highlights: undefined; // alias for going to Highlights feed tab from elsewhere
  MyHighlights: undefined;
  HighlightUpload: undefined;
  HighlightDetail: { id: string };

  // Profile stack
  ProfileEdit: undefined;
  Settings: undefined;
  Notifications: undefined;
  Waivers: undefined;

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
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Highlights" component={HighlightsFeedScreen} />
      <Tab.Screen name="Teams" component={SquadsScreen} />
      <Tab.Screen name="Profile" component={ProfileTabScreen} />
    </Tab.Navigator>
  );
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
      <Stack.Screen name="TeamDetails" component={TeamDetailScreen} />
      <Stack.Screen name="TeamPayment" component={TeamPaymentScreen} />
      <Stack.Screen name="PlayerDirectory" component={PlayerDirectoryScreen} />
      <Stack.Screen name="LeagueBrowse" component={LeagueBrowseScreen} />
      <Stack.Screen name="MyHighlights" component={MyHighlightsScreen} />
      <Stack.Screen name="HighlightUpload" component={HighlightUploadScreen} />
      <Stack.Screen name="HighlightDetail" component={HighlightDetailScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Waivers" component={WaiversScreen} />
      <Stack.Screen name="Bookings" component={BookingsScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailScreen} />
      <Stack.Screen name="Facilities" component={FacilitiesScreen} />
      <Stack.Screen name="FacilityDetails" component={FacilityDetailScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ComponentShowcase" component={ComponentShowcaseScreen} />
      <Stack.Screen name="FormControls" component={FormControlsScreen} />
    </Stack.Navigator>
  );
}
