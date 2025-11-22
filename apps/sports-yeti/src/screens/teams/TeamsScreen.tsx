import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TeamStackParamList } from '../../types';
import { getMyTeams } from '../../mocks/data';
import Button from '../../components/common/Button';

type TeamsScreenNavigationProp = StackNavigationProp<
  TeamStackParamList,
  'TeamsScreen'
>;

interface Props {
  navigation: TeamsScreenNavigationProp;
}

const TeamsScreen: React.FC<Props> = ({ navigation }) => {
  const myTeams = getMyTeams();

  const navigateToCreateTeam = () => {
    navigation.navigate('CreateTeam');
  };

  const navigateToTeamDetails = (teamId: string) => {
    navigation.navigate('TeamDetails', { teamId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Teams</Text>
          <Text style={styles.subtitle}>
            Manage your teams and find new ones
          </Text>
        </View>

        {/* Create Team Button */}
        <View style={styles.section}>
          <Button
            title="Create New Team"
            onPress={navigateToCreateTeam}
            variant="primary"
            size="large"
          />
        </View>

        {/* My Teams */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Teams</Text>

          {myTeams.length > 0 ? (
            myTeams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamCard}
                onPress={() => navigateToTeamDetails(team.id)}
              >
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamSport}>{team.sport}</Text>
                </View>

                <Text style={styles.teamDescription}>{team.description}</Text>

                <View style={styles.teamDetails}>
                  <Text style={styles.teamDetail}>
                    {team.members.length}/{team.maxMembers} members
                  </Text>
                  <Text style={styles.teamDetail}>•</Text>
                  <Text style={styles.teamDetail}>{team.skillLevel} level</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👥</Text>
              <Text style={styles.emptyStateTitle}>No Teams Yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Create a team or join an existing one to get started
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FindTeams')}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionTitle}>Find Teams</Text>
              <Text style={styles.actionSubtitle}>Discover teams to join</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('TeamRequests')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTitle}>Team Requests</Text>
              <Text style={styles.actionSubtitle}>Manage invitations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                if (myTeams.length > 0) {
                  navigation.navigate('TeamStats', { teamId: myTeams[0].id });
                } else {
                  Alert.alert(
                    'No Teams',
                    'Join or create a team to view stats'
                  );
                }
              }}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Team Stats</Text>
              <Text style={styles.actionSubtitle}>View performance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                if (myTeams.length > 0) {
                  navigateToTeamDetails(myTeams[0].id);
                } else {
                  Alert.alert('No Teams', 'Create a team first to manage it');
                }
              }}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionTitle}>Manage Teams</Text>
              <Text style={styles.actionSubtitle}>Edit team settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  teamCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  teamSport: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    textTransform: 'capitalize',
  },
  teamDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  teamDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamDetail: {
    fontSize: 12,
    color: '#6c757d',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default TeamsScreen;
