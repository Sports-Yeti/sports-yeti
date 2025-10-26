import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TeamStackParamList } from '../../types';
import Button from '../../components/common/Button';

type TeamRequestsScreenNavigationProp = StackNavigationProp<
  TeamStackParamList,
  'TeamRequests'
>;

interface Props {
  navigation: TeamRequestsScreenNavigationProp;
}

interface TeamRequest {
  id: string;
  teamId: string;
  teamName: string;
  teamSport: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// Mock team requests
const mockRequests: TeamRequest[] = [
  {
    id: 'req-1',
    teamId: 'team-2',
    teamName: 'Queens United',
    teamSport: 'soccer',
    requestedAt: '2024-01-23T10:00:00Z',
    status: 'pending',
  },
  {
    id: 'req-2',
    teamId: 'team-3',
    teamName: 'Brooklyn Nets',
    teamSport: 'basketball',
    requestedAt: '2024-01-22T14:00:00Z',
    status: 'pending',
  },
];

const TeamRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const [requests, setRequests] = useState<TeamRequest[]>(mockRequests);

  const handleAcceptRequest = (requestId: string, teamName: string) => {
    Alert.alert('Accept Request', `Join ${teamName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          // TODO: Implement accept request API call
          setRequests(
            requests.map((r) =>
              r.id === requestId ? { ...r, status: 'accepted' as const } : r
            )
          );
          Alert.alert('Success', `You've joined ${teamName}!`);
        },
      },
    ]);
  };

  const handleRejectRequest = (requestId: string, teamName: string) => {
    Alert.alert('Reject Request', `Decline invitation to ${teamName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          // TODO: Implement reject request API call
          setRequests(
            requests.map((r) =>
              r.id === requestId ? { ...r, status: 'rejected' as const } : r
            )
          );
          Alert.alert('Request Declined', `You've declined the invitation.`);
        },
      },
    ]);
  };

  const renderRequest = ({ item }: { item: TeamRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.teamName}>{item.teamName}</Text>
          <Text style={styles.teamSport}>{item.teamSport}</Text>
          <Text style={styles.requestTime}>
            {new Date(item.requestedAt).toLocaleDateString()}
          </Text>
        </View>

        {item.status === 'pending' ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>Pending</Text>
          </View>
        ) : item.status === 'accepted' ? (
          <View style={styles.acceptedBadge}>
            <Text style={styles.acceptedBadgeText}>Accepted</Text>
          </View>
        ) : (
          <View style={styles.rejectedBadge}>
            <Text style={styles.rejectedBadgeText}>Declined</Text>
          </View>
        )}
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <Button
            title="Accept"
            onPress={() => handleAcceptRequest(item.id, item.teamName)}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />

          <Button
            title="Decline"
            onPress={() => handleRejectRequest(item.id, item.teamName)}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
        </View>
      )}
    </View>
  );

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Team Requests</Text>
          <Text style={styles.subtitle}>
            {pendingRequests.length} pending invitation
            {pendingRequests.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📬</Text>
            <Text style={styles.emptyStateTitle}>No Requests</Text>
            <Text style={styles.emptyStateSubtitle}>
              Team invitations will appear here
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 12,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6c757d',
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  teamSport: {
    fontSize: 12,
    color: '#007AFF',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingBadgeText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  acceptedBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acceptedBadgeText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '500',
  },
  rejectedBadge: {
    backgroundColor: '#f8d7da',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rejectedBadgeText: {
    fontSize: 12,
    color: '#721c24',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
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
});

export default TeamRequestsScreen;
