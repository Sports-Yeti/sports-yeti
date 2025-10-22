import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getMyUpcomingGames, getRecentPosts, getMyUpcomingBookings } from '../../mocks/data';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeScreen'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  const upcomingGames = getMyUpcomingGames();
  const recentPosts = getRecentPosts().slice(0, 3);
  const upcomingBookings = getMyUpcomingBookings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.firstName}!</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image source={{ uri: user.avatar }} style={styles.profileImage} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user.pointBalance}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user.stats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{upcomingGames.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🏀</Text>
              <Text style={styles.actionTitle}>Create Game</Text>
              <Text style={styles.actionSubtitle}>Find players & book</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🏟️</Text>
              <Text style={styles.actionTitle}>Book Facility</Text>
              <Text style={styles.actionSubtitle}>Court, field, equipment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionTitle}>Find Team</Text>
              <Text style={styles.actionSubtitle}>Join or create teams</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🏆</Text>
              <Text style={styles.actionTitle}>Join League</Text>
              <Text style={styles.actionSubtitle}>Competitive play</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Games */}
        {upcomingGames.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Games</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingGames.slice(0, 2).map((game) => (
              <TouchableOpacity key={game.id} style={styles.gameCard}>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>
                    {game.team1Id} vs {game.team2Id}
                  </Text>
                  <Text style={styles.gameDetails}>
                    {new Date(game.scheduledAt).toLocaleDateString()} at{' '}
                    {new Date(game.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.gameLocation}>{game.facilityId}</Text>
                </View>
                <View style={styles.gameStatus}>
                  <Text style={styles.gameType}>{game.gameType}</Text>
                  <Text style={styles.pointWager}>{game.pointWager} pts</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingBookings.slice(0, 2).map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTitle}>{booking.spaceId}</Text>
                  <Text style={styles.bookingDetails}>
                    {new Date(booking.startTime).toLocaleDateString()} •{' '}
                    {new Date(booking.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(booking.endTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.bookingCost}>
                    {booking.pointCost} points
                  </Text>
                </View>
                <Text style={styles.qrCode}>{booking.qrCode}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentPosts.map((post) => (
            <TouchableOpacity key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image source={{ uri: post.user.avatar }} style={styles.postAvatar} />
                <View style={styles.postUser}>
                  <Text style={styles.postUserName}>
                    {post.user.firstName} {post.user.lastName}
                  </Text>
                  <Text style={styles.postTime}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              {post.mediaUrls.length > 0 && (
                <Image source={{ uri: post.mediaUrls[0] }} style={styles.postImage} />
              )}
              <View style={styles.postStats}>
                <Text style={styles.postStat}>❤️ {post.likesCount}</Text>
                <Text style={styles.postStat}>💬 {post.commentsCount}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
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
  gameCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  gameDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  gameLocation: {
    fontSize: 12,
    color: '#007AFF',
  },
  gameStatus: {
    alignItems: 'flex-end',
  },
  gameType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  pointWager: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  bookingDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  bookingCost: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  qrCode: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  postCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  postUser: {
    flex: 1,
  },
  postUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  postTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  postContent: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  postStat: {
    fontSize: 12,
    color: '#6c757d',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default HomeScreen;