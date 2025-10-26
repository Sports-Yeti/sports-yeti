import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

// Import stack navigators
import HomeStackNavigator from './HomeStackNavigator';
import LeagueStackNavigator from './LeagueStackNavigator';
import TeamStackNavigator from './TeamStackNavigator';
import FacilityStackNavigator from './FacilityStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Leagues') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Teams') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Facilities') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Leagues" component={LeagueStackNavigator} />
      <Tab.Screen name="Teams" component={TeamStackNavigator} />
      <Tab.Screen name="Facilities" component={FacilityStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
