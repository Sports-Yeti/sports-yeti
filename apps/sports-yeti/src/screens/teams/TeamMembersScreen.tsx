import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { TeamStackParamList, TeamMember } from '../../types';
import { getTeamById } from '../../mocks/data';
import Button from '../../components/common/Button';

type TeamMembersScreenNavigationProp = StackNavigationProp<
  TeamStackParamList,
  'TeamMembers'
>;
type TeamMembersScreenRouteProp = RouteProp<TeamStackParamList, 'TeamMembers'>;

interface Props {
  navigation: TeamMembersScreenNavigationProp;
  route: TeamMembersScreenRouteProp;
}

const TeamMembersScreen: React.FC<Props> = ({ navigation, route }) => {
  const { teamId } = route.params;
  const team = getTeamById(teamId);
  const [members, setMembers] = useState(team?.members || []);

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

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement remove member API call
            setMembers(members.filter((m) => m.id !== memberId));
            Alert.alert(
              'Success',
              `${memberName} has been removed from the team.`
            );
          },
        },
      ]
    );
  };

  const handlePromoteMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Promote to Co-Captain',
      `Promote ${memberName} to co-captain?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          onPress: () => {
            // TODO: Implement promote member API call
            setMembers(
              members.map((m) =>
                m.id === memberId ? { ...m, role: 'co-captain' as const } : m
              )
            );
            Alert.alert('Success', `${memberName} is now a co-captain!`);
          },
        },
      ]
    );
  };

  const handleInviteMembers = () => {
    Alert.alert('Invite Members', 'Search for players to invite to your team', [
      {
        text: 'OK',
        onPress: () => {
          // TODO: Navigate to player search screen
        },
      },
    ]);
  };

  const renderMember = ({ item }: { item: TeamMember }) => (
    <View style={styles.memberCard}>
      <Image source={{ uri: item.player.avatar }} style={styles.memberAvatar} />

      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.player.firstName} {item.player.lastName}
        </Text>
        <Text style={styles.memberRole}>{item.role}</Text>
        <Text style={styles.memberJoined}>
          Joined {new Date(item.joinedAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.memberActions}>
        {item.role === 'captain' ? (
          <View style={styles.captainBadge}>
            <Text style={styles.captainBadgeText}>👑 Captain</Text>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            {item.role === 'player' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  handlePromoteMember(
                    item.id,
                    `${item.player.firstName} ${item.player.lastName}`
                  )
                }
              >
                <Text style={styles.actionButtonText}>Promote</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() =>
                handleRemoveMember(
                  item.id,
                  `${item.player.firstName} ${item.player.lastName}`
                )
              }
            >
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Members</Text>
        <TouchableOpacity onPress={handleInviteMembers}>
          <Text style={styles.inviteButton}>+ Invite</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {members.length}/{team.maxMembers} members
        </Text>
        <Text style={styles.statsSubtext}>
          {team.maxMembers - members.length} spots available
        </Text>
      </View>

      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👥</Text>
            <Text style={styles.emptyStateTitle}>No Members</Text>
            <Text style={styles.emptyStateSubtitle}>
              Invite players to join your team
            </Text>
          </View>
        }
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  inviteButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  statsBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  statsSubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
    color: '#007AFF',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  memberJoined: {
    fontSize: 12,
    color: '#6c757d',
  },
  memberActions: {
    alignItems: 'flex-end',
  },
  captainBadge: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  captainBadgeText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  actionButtons: {
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    minWidth: 70,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#dc3545',
  },
  removeButtonText: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6c757d',
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
});

export default TeamMembersScreen;
