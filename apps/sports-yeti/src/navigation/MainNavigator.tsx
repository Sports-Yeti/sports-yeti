import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import {
  DashboardScreen,
  FacilitiesScreen,
  GamesScreen,
  ProfileScreen,
  TeamsScreen,
  BookingsScreen,
  CampsScreen,
  ChatScreen,
} from '../screens';
import { COLORS } from '../constants';

export type MainTabParamList = {
  Dashboard: undefined;
  Games: undefined;
  Facilities: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  GameDetails: { id: string };
  FacilityDetails: { id: string };
  BookingDetails: { id: string };
  CampDetails: { id: string };
  TeamDetails: { id: string };
  Teams: undefined;
  Camps: undefined;
  Bookings: undefined;
  Scanner: undefined;
  Chat: { chatId: string; title?: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏠',
    Games: '🏀',
    Facilities: '🏟️',
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
        name="Facilities"
        component={FacilitiesScreen}
        options={{
          title: 'Facilities',
          headerTitle: 'Facilities',
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

// Placeholder for detail screens that need more implementation
function PlaceholderScreen() {
  return null;
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
        component={PlaceholderScreen}
        options={{ title: 'Game Details' }}
      />
      <Stack.Screen
        name="FacilityDetails"
        component={PlaceholderScreen}
        options={{ title: 'Facility Details' }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={PlaceholderScreen}
        options={{ title: 'Booking Details' }}
      />
      <Stack.Screen
        name="CampDetails"
        component={PlaceholderScreen}
        options={{ title: 'Camp Details' }}
      />
      <Stack.Screen
        name="TeamDetails"
        component={PlaceholderScreen}
        options={{ title: 'Team Details' }}
      />
      <Stack.Screen
        name="Teams"
        component={TeamsScreen}
        options={{ title: 'Find Teams' }}
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
        component={PlaceholderScreen}
        options={{ title: 'Scan QR Code' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Chat',
        })}
      />
    </Stack.Navigator>
  );
}
