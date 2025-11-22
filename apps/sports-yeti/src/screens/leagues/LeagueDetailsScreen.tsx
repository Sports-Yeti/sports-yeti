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
import { RouteProp } from '@react-navigation/native';
import { LeagueStackParamList } from '../../types';
import { getLeagueById, getTeamsByLeague } from '../../mocks/data';
import Button from '../../components/common/Button';

type LeagueDetailsScreenNavigationProp = StackNavigationProp<
  LeagueStackParamList,
  'LeagueDetails'
>;
type LeagueDetailsScreenRouteProp = RouteProp<
  LeagueStackParamList,
  'LeagueDetails'
>;

interface Props {
  navigation: LeagueDetailsScreenNavigationProp;
  route: LeagueDetailsScreenRouteProp;
}

const LeagueDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { leagueId } = route.params;
  const league = getLeagueById(leagueId);
  const teams = getTeamsByLeague(leagueId);

  if (!league) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>League not found</Text>
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

  const handleJoinLeague = () => {
    navigation.navigate('JoinLeague', { leagueId });
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

        {/* League Header */}
        <View style={styles.heroSection}>
          <Text style={styles.leagueName}>{league.name}</Text>
          <Text style={styles.leagueSport}>{league.sportType}</Text>
          <Text style={styles.leagueLocation}>
            📍 {league.location.city}, {league.location.state}
          </Text>
        </View>

        {/* League Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{teams.length}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{league.registrationFee}</Text>
            <Text style={styles.statLabel}>Fee (pts)</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{league.divisions.length}</Text>
            <Text style={styles.statLabel}>Divisions</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{league.description}</Text>
        </View>

        {/* Current Season */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Season</Text>
          <View style={styles.seasonCard}>
            <Text style={styles.seasonName}>{league.season.name}</Text>
            <Text style={styles.seasonDates}>
              {league.season.startDate} - {league.season.endDate}
            </Text>
            {league.season.isActive && (
              <Text style={styles.seasonActive}>● Active</Text>
            )}
          </View>
        </View>

        {/* Divisions */}
        {league.divisions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Divisions</Text>
            {league.divisions.map((division) => (
              <View key={division.id} style={styles.divisionCard}>
                <Text style={styles.divisionName}>{division.name}</Text>
                <Text style={styles.divisionDetails}>
                  {division.skillLevel} • {division.maxTeams} teams max
                </Text>
                <Text style={styles.divisionFee}>
                  Registration: {division.registrationFee} pts
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>League Rules</Text>
          {league.rules.map((rule, index) => (
            <Text key={index} style={styles.ruleItem}>
              {index + 1}. {rule}
            </Text>
          ))}
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {league.amenities.map((amenity, index) => (
              <Text key={index} style={styles.amenityTag}>
                ✓ {amenity}
              </Text>
            ))}
          </View>
        </View>

        {/* Join Button */}
        <View style={styles.actionsSection}>
          <Button
            title="Join League"
            onPress={handleJoinLeague}
            variant="primary"
            size="large"
          />
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
  leagueName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  leagueSport: {
    fontSize: 16,
    color: '#007AFF',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  leagueLocation: {
    fontSize: 14,
    color: '#6c757d',
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
  seasonCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  seasonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  seasonDates: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  seasonActive: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  divisionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  divisionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  divisionDetails: {
    fontSize: 14,
    color: '#6c757d',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  divisionFee: {
    fontSize: 12,
    color: '#007AFF',
  },
  ruleItem: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 24,
    marginBottom: 8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    fontSize: 12,
    color: '#28a745',
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
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

export default LeagueDetailsScreen;
