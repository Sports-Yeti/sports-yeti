import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from '../types';

import HomeScreen from '../screens/home/HomeScreen';
import CreateGameScreen from '../screens/games/CreateGameScreen';
import ChatScreen from '../screens/chat/ChatScreen';

const Stack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CreateGame" component={CreateGameScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
