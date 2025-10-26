import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TeamStackParamList } from '../types';

import TeamsScreen from '../screens/teams/TeamsScreen';
import TeamDetailsScreen from '../screens/teams/TeamDetailsScreen';
import CreateTeamScreen from '../screens/teams/CreateTeamScreen';
import EditTeamScreen from '../screens/teams/EditTeamScreen';
import TeamMembersScreen from '../screens/teams/TeamMembersScreen';
import FindTeamsScreen from '../screens/teams/FindTeamsScreen';
import TeamRequestsScreen from '../screens/teams/TeamRequestsScreen';
import TeamStatsScreen from '../screens/teams/TeamStatsScreen';

const Stack = createStackNavigator<TeamStackParamList>();

const TeamStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TeamsScreen" component={TeamsScreen} />
      <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
      <Stack.Screen name="EditTeam" component={EditTeamScreen} />
      <Stack.Screen name="TeamMembers" component={TeamMembersScreen} />
      <Stack.Screen name="FindTeams" component={FindTeamsScreen} />
      <Stack.Screen name="TeamRequests" component={TeamRequestsScreen} />
      <Stack.Screen name="TeamStats" component={TeamStatsScreen} />
    </Stack.Navigator>
  );
};

export default TeamStackNavigator;
