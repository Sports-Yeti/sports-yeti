import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { TeamStackParamList } from '../../types';
import { getTeamById } from '../../mocks/data';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';

type TeamDetailsScreenNavigationProp = StackNavigationProp<
  TeamStackParamList,
  'TeamDetails'
>;
type TeamDetailsScreenRouteProp = RouteProp<TeamStackParamList, 'TeamDetails'>;

interface Props {
  navigation: TeamDetailsScreenNavigationProp;
  route: TeamDetailsScreenRouteProp;
}

const TeamDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { teamId } = route.params;
  const { user } = useAuth();
  const team = getTeamById(teamId);

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Team not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="medium"
          />
        </View>
      </SafeAreaView>
    );
  }

  const isMember = team.members.some((member) => member.playerId === user?.id);
  const isCaptain = team.captainId === user?.id;

  const handleJoinTeam = () => {
    // TODO: Implement join team API call
    Alert.alert(
      'Join Request Sent',
      'The team captain will review your request'
    );
  };

  const handleLeaveTeam = () => {
    Alert.alert('Leave Team', 'Are you sure you want to leave this team?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          // TODO: Implement leave team API call
          Alert.alert('Left Team', 'You have left the team');
          navigation.goBack();
        },
      },
    ]);
  };

  const handleEditTeam = () => {
    navigation.navigate('EditTeam', { teamId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Team Hero */}
        <View style={styles.heroSection}>
          {team.avatar && (
            <Image source={{ uri: team.avatar }} style={styles.teamAvatar} />
          )}
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamSport}>{team.sport}</Text>
          <Text style={styles.teamSkillLevel}>{team.skillLevel} level</Text>
        </View>

        {/* Team Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{team.members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{team.maxMembers}</Text>
            <Text style={styles.statLabel}>Max Size</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {team.leagueId ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.statLabel}>In League</Text>
          </View>
        </View>

        {/* Description */}
        {team.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{team.description}</Text>
          </View>
        )}

        {/* Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Team Members ({team.members.length}/{team.maxMembers})
          </Text>

          {team.members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <Image
                source={{ uri: member.player.avatar }}
                style={styles.memberAvatar}
              />

              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {member.player.firstName} {member.player.lastName}
                </Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>

              {member.role === 'captain' && (
                <Text style={styles.captainBadge}>👑</Text>
              )}
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          {!isMember && (
            <Button
              title="Join Team"
              onPress={handleJoinTeam}
              variant="primary"
              size="large"
            />
          )}

          {isMember && !isCaptain && (
            <Button
              title="Leave Team"
              onPress={handleLeaveTeam}
              variant="danger"
              size="large"
            />
          )}

          {isCaptain && (
            <>
              <Button
                title="Edit Team"
                onPress={handleEditTeam}
                variant="primary"
                size="large"
                style={styles.actionButton}
              />

              <Button
                title="Manage Members"
                onPress={() => navigation.navigate('TeamMembers', { teamId })}
                variant="outline"
                size="large"
                style={styles.actionButton}
              />
            </>
          )}
        </View>

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
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  heroSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  teamAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  teamName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  teamSport: {
    fontSize: 16,
    color: '#007AFF',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  teamSkillLevel: {
    fontSize: 14,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  section: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  captainBadge: {
    fontSize: 24,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
  },
  actionButton: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#212529',
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default TeamDetailsScreen;
