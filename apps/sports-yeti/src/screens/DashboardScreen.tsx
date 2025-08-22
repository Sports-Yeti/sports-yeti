import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Badge,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../services/apiClient';

interface UpcomingGame {
  id: number;
  team1: { name: string };
  team2: { name: string };
  facility: { name: string };
  scheduled_at: string;
  status: string;
}

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [upcomingGames, setUpcomingGames] = useState<UpcomingGame[]>([]);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    pointsEarned: 0,
    teamsJoined: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Load upcoming games
      const gamesResponse = await apiClient.get('/games?limit=5&upcoming=true');
      setUpcomingGames(gamesResponse.data.data || []);

      // Load user stats (mock for now)
      setStats({
        gamesPlayed: 12,
        pointsEarned: user?.player?.point_balance || 0,
        teamsJoined: 3,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Text
              size={60}
              label={user?.name?.charAt(0) || 'U'}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Title style={styles.userName}>{user?.name}</Title>
              <Paragraph style={styles.userRole}>
                {user?.player?.experience_level || 'Player'}
              </Paragraph>
              <View style={styles.pointsBadge}>
                <Badge style={styles.badge}>
                  {user?.player?.point_balance || 0} points
                </Badge>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.pointsEarned}</Text>
              <Text style={styles.statLabel}>Points Earned</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.teamsJoined}</Text>
              <Text style={styles.statLabel}>Teams Joined</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Upcoming Games */}
        <Card style={styles.section}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Upcoming Games</Title>
            {upcomingGames.length > 0 ? (
              upcomingGames.map((game) => (
                <Card key={game.id} style={styles.gameCard}>
                  <Card.Content>
                    <View style={styles.gameHeader}>
                      <Text style={styles.gameTeams}>
                        {game.team1.name} vs {game.team2.name}
                      </Text>
                      <Badge>{game.status}</Badge>
                    </View>
                    <Paragraph style={styles.gameDetails}>
                      📍 {game.facility.name}
                    </Paragraph>
                    <Paragraph style={styles.gameTime}>
                      🕒 {formatDateTime(game.scheduled_at)}
                    </Paragraph>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                No upcoming games. Join a team to start playing! 🏀
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.actionsGrid}>
              <Button
                mode="contained"
                icon="account-group"
                style={styles.actionButton}
                onPress={() => navigation.navigate('Teams')}
              >
                Find Team
              </Button>
              <Button
                mode="contained"
                icon="map-marker"
                style={styles.actionButton}
                onPress={() => navigation.navigate('Facilities')}
              >
                Book Facility
              </Button>
              <Button
                mode="contained"
                icon="tournament"
                style={styles.actionButton}
                onPress={() => navigation.navigate('Leagues')}
              >
                Join League
              </Button>
              <Button
                mode="contained"
                icon="qrcode-scan"
                style={styles.actionButton}
                onPress={() => navigation.navigate('QRScanner')}
              >
                Scan QR
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Navigate to create game or quick action menu
          Alert.alert(
            'Quick Actions',
            'What would you like to do?',
            [
              { text: 'Create Game', onPress: () => navigation.navigate('Games') },
              { text: 'Book Facility', onPress: () => navigation.navigate('Facilities') },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#1E40AF',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  pointsBadge: {
    alignSelf: 'flex-start',
  },
  badge: {
    backgroundColor: '#1E40AF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  gameCard: {
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTeams: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  gameDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  gameTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E40AF',
  },
});