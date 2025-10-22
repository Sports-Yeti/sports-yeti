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
import { LeagueStackParamList } from '../../types';
import { getActiveLeagues } from '../../mocks/data';
import Button from '../../components/common/Button';

type LeaguesScreenNavigationProp = StackNavigationProp<LeagueStackParamList, 'LeaguesScreen'>;

interface Props {
  navigation: LeaguesScreenNavigationProp;
}

const LeaguesScreen: React.FC<Props> = ({ navigation }) => {
  const activeLeagues = getActiveLeagues();

  const navigateToLeagueDetails = (leagueId: string) => {
    navigation.navigate('LeagueDetails', { leagueId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Leagues</Text>
          <Text style={styles.subtitle}>Find and join competitive leagues</Text>
        </View>

        {/* Active Leagues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Leagues</Text>

          {activeLeagues.length > 0 ? (
            activeLeagues.map((league) => (
              <TouchableOpacity
                key={league.id}
                style={styles.leagueCard}
                onPress={() => navigateToLeagueDetails(league.id)}
              >
                <View style={styles.leagueHeader}>
                  <Text style={styles.leagueName}>{league.name}</Text>
                  <Text style={styles.leagueSport}>{league.sportType}</Text>
                </View>

                <Text style={styles.leagueDescription}>{league.description}</Text>

                <View style={styles.leagueDetails}>
                  <View style={styles.leagueDetail}>
                    <Text style={styles.leagueDetailLabel}>Teams</Text>
                    <Text style={styles.leagueDetailValue}>
                      {league.maxTeams} max
                    </Text>
                  </View>

                  <View style={styles.leagueDetail}>
                    <Text style={styles.leagueDetailLabel}>Fee</Text>
                    <Text style={styles.leagueDetailValue}>
                      {league.registrationFee} pts
                    </Text>
                  </View>

                  <View style={styles.leagueDetail}>
                    <Text style={styles.leagueDetailLabel}>Season</Text>
                    <Text style={styles.leagueDetailValue}>
                      {league.season.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.leagueAmenities}>
                  {league.amenities.slice(0, 3).map((amenity, index) => (
                    <Text key={index} style={styles.amenityTag}>
                      {amenity}
                    </Text>
                  ))}
                </View>

                <Button
                  title="View Details"
                  onPress={() => navigateToLeagueDetails(league.id)}
                  variant="outline"
                  size="small"
                  style={styles.viewButton}
                />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏆</Text>
              <Text style={styles.emptyStateTitle}>No Active Leagues</Text>
              <Text style={styles.emptyStateSubtitle}>
                Check back later for new league opportunities
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionTitle}>Browse All</Text>
              <Text style={styles.actionSubtitle}>View all available leagues</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTitle}>My Leagues</Text>
              <Text style={styles.actionSubtitle}>Leagues you're part of</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionTitle}>Create League</Text>
              <Text style={styles.actionSubtitle}>Start your own league</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>League Stats</Text>
              <Text style={styles.actionSubtitle}>View league statistics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* League Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Join a League?</Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🏆</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Competitive Play</Text>
                <Text style={styles.benefitDescription}>
                  Regular scheduled games with organized teams
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🤝</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Community</Text>
                <Text style={styles.benefitDescription}>
                  Meet players with similar skill levels and interests
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📈</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Track Progress</Text>
                <Text style={styles.benefitDescription}>
                  Monitor your performance and improvement over time
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎁</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Earn Points</Text>
                <Text style={styles.benefitDescription}>
                  Get rewarded for participation and achievements
                </Text>
              </View>
            </View>
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
  leagueCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  leagueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leagueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  leagueSport: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    textTransform: 'capitalize',
  },
  leagueDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  leagueDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  leagueDetail: {
    flex: 1,
    alignItems: 'center',
  },
  leagueDetailLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  leagueDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  leagueAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  amenityTag: {
    fontSize: 10,
    color: '#6c757d',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  viewButton: {
    alignSelf: 'flex-start',
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
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitIcon: {
    fontSize: 24,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default LeaguesScreen;