import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { TeamStackParamList } from '../../types';
import { getTeamById } from '../../mocks/data';
import Button from '../../components/common/Button';

type TeamStatsScreenNavigationProp = StackNavigationProp<
  TeamStackParamList,
  'TeamStats'
>;
type TeamStatsScreenRouteProp = RouteProp<TeamStackParamList, 'TeamStats'>;

interface Props {
  navigation: TeamStatsScreenNavigationProp;
  route: TeamStatsScreenRouteProp;
}

const TeamStatsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { teamId } = route.params;
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

  // Mock team stats
  const stats = {
    gamesPlayed: 12,
    gamesWon: 8,
    gamesLost: 4,
    gamesDraw: 0,
    winPercentage: 66.7,
    totalPoints: 450,
    averagePoints: 37.5,
    topScorer: 'John Doe',
    mostAssists: 'Sarah Wilson',
    winStreak: 3,
    longestWinStreak: 5,
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
          <Text style={styles.title}>Team Stats</Text>
        </View>

        {/* Team Name */}
        <View style={styles.teamHeader}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamSport}>{team.sport}</Text>
        </View>

        {/* Overall Record */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Record</Text>

          <View style={styles.recordGrid}>
            <View style={styles.recordCard}>
              <Text style={styles.recordNumber}>{stats.gamesPlayed}</Text>
              <Text style={styles.recordLabel}>Games</Text>
            </View>

            <View style={[styles.recordCard, styles.winCard]}>
              <Text style={[styles.recordNumber, styles.winNumber]}>
                {stats.gamesWon}
              </Text>
              <Text style={styles.recordLabel}>Wins</Text>
            </View>

            <View style={[styles.recordCard, styles.lossCard]}>
              <Text style={[styles.recordNumber, styles.lossNumber]}>
                {stats.gamesLost}
              </Text>
              <Text style={styles.recordLabel}>Losses</Text>
            </View>

            <View style={styles.recordCard}>
              <Text style={styles.recordNumber}>{stats.winPercentage}%</Text>
              <Text style={styles.recordLabel}>Win Rate</Text>
            </View>
          </View>
        </View>

        {/* Points Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points Performance</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Points Earned</Text>
            <Text style={styles.statValue}>{stats.totalPoints}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Points per Game</Text>
            <Text style={styles.statValue}>{stats.averagePoints}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Win Streak</Text>
            <Text style={styles.statValue}>{stats.winStreak} games</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Longest Win Streak</Text>
            <Text style={styles.statValue}>{stats.longestWinStreak} games</Text>
          </View>
        </View>

        {/* Team Leaders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Leaders</Text>

          <View style={styles.leaderCard}>
            <Text style={styles.leaderIcon}>🏆</Text>
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderTitle}>Top Scorer</Text>
              <Text style={styles.leaderName}>{stats.topScorer}</Text>
            </View>
          </View>

          <View style={styles.leaderCard}>
            <Text style={styles.leaderIcon}>🤝</Text>
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderTitle}>Most Assists</Text>
              <Text style={styles.leaderName}>{stats.mostAssists}</Text>
            </View>
          </View>
        </View>

        {/* Recent Games */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Games</Text>

          <View style={styles.gamesList}>
            <View style={styles.gameItem}>
              <Text style={styles.gameResult}>W</Text>
              <View style={styles.gameInfo}>
                <Text style={styles.gameOpponent}>vs Thunder Squad</Text>
                <Text style={styles.gameDate}>Jan 20, 2024</Text>
              </View>
              <Text style={styles.gameScore}>65-58</Text>
            </View>

            <View style={styles.gameItem}>
              <Text style={styles.gameResult}>W</Text>
              <View style={styles.gameInfo}>
                <Text style={styles.gameOpponent}>vs City Runners</Text>
                <Text style={styles.gameDate}>Jan 18, 2024</Text>
              </View>
              <Text style={styles.gameScore}>72-69</Text>
            </View>

            <View style={styles.gameItem}>
              <Text style={[styles.gameResult, styles.lossResult]}>L</Text>
              <View style={styles.gameInfo}>
                <Text style={styles.gameOpponent}>vs Elite Team</Text>
                <Text style={styles.gameDate}>Jan 15, 2024</Text>
              </View>
              <Text style={styles.gameScore}>55-62</Text>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  teamHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  teamSport: {
    fontSize: 14,
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  recordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recordCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  winCard: {
    backgroundColor: '#d4edda',
  },
  lossCard: {
    backgroundColor: '#f8d7da',
  },
  recordNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  winNumber: {
    color: '#28a745',
  },
  lossNumber: {
    color: '#dc3545',
  },
  recordLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  leaderCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  leaderIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderTitle: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  gamesList: {
    gap: 12,
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  gameResult: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#28a745',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  lossResult: {
    backgroundColor: '#dc3545',
  },
  gameInfo: {
    flex: 1,
  },
  gameOpponent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  gameDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  gameScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  bottomSpacing: {
    height: 80,
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

export default TeamStatsScreen;
