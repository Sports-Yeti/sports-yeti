import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LeagueStackParamList } from '../types';

import LeaguesScreen from '../screens/leagues/LeaguesScreen';
import LeagueDetailsScreen from '../screens/leagues/LeagueDetailsScreen';
import JoinLeagueScreen from '../screens/leagues/JoinLeagueScreen';

const Stack = createStackNavigator<LeagueStackParamList>();

const LeagueStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LeaguesScreen" component={LeaguesScreen} />
      <Stack.Screen name="LeagueDetails" component={LeagueDetailsScreen} />
      <Stack.Screen name="JoinLeague" component={JoinLeagueScreen} />
    </Stack.Navigator>
  );
};

export default LeagueStackNavigator;
