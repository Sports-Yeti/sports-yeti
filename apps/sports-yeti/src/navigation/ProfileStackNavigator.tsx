import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';

import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PointsScreen from '../screens/profile/PointsScreen';
import AchievementsScreen from '../screens/profile/AchievementsScreen';
import DataExportScreen from '../screens/profile/DataExportScreen';
import HelpScreen from '../screens/profile/HelpScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Points" component={PointsScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="DataExport" component={DataExportScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
