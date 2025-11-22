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
import PaymentMethodsScreen from '../screens/payments/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../screens/payments/AddPaymentMethodScreen';
import PaymentHistoryScreen from '../screens/payments/PaymentHistoryScreen';
import CampsScreen from '../screens/camps/CampsScreen';
import CampDetailsScreen from '../screens/camps/CampDetailsScreen';
import MyCampsScreen from '../screens/camps/MyCampsScreen';

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
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="Camps" component={CampsScreen} />
      <Stack.Screen name="CampDetails" component={CampDetailsScreen} />
      <Stack.Screen name="MyCamps" component={MyCampsScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
