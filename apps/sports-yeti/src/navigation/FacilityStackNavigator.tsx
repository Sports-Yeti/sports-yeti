import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FacilityStackParamList } from '../types';

import FacilitiesScreen from '../screens/facilities/FacilitiesScreen';
import FacilityDetailsScreen from '../screens/facilities/FacilityDetailsScreen';
import BookFacilityScreen from '../screens/facilities/BookFacilityScreen';
import QRScannerScreen from '../screens/facilities/QRScannerScreen';
import BookingDetailsScreen from '../screens/facilities/BookingDetailsScreen';

const Stack = createStackNavigator<FacilityStackParamList>();

const FacilityStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FacilitiesScreen" component={FacilitiesScreen} />
      <Stack.Screen name="FacilityDetails" component={FacilityDetailsScreen} />
      <Stack.Screen name="BookFacility" component={BookFacilityScreen} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    </Stack.Navigator>
  );
};

export default FacilityStackNavigator;
