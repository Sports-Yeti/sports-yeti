import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Team, Sport, TeamStackParamList } from '../../types';
import { mockTeams } from '../../mocks/data';
import Button from '../../components/common/Button';
import { useDebounce } from '../../hooks/useDebounce';

type FindTeamsScreenNavigationProp = StackNavigationProp<
  TeamStackParamList,
  'FindTeams'
>;

interface Props {
  navigation: FindTeamsScreenNavigationProp;
}

const FindTeamsScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const SPORTS: { value: Sport | 'all'; label: string }[] = [
    { value: 'all', label: 'All Sports' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'soccer', label: 'Soccer' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'football', label: 'Football' },
  ];

  // Filter teams based on search and sport
  const filteredTeams = mockTeams.filter((team) => {
    const matchesSearch =
      debouncedSearch === '' ||
      team.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      team.description?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesSport =
      selectedSport === 'all' || team.sport === selectedSport;

    return matchesSearch && matchesSport;
  });

  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamSport}>{item.sport}</Text>
      </View>

      <Text style={styles.teamDescription} numberOfLines={2}>
        {item.description || 'No description'}
      </Text>

      <View style={styles.teamDetails}>
        <Text style={styles.teamDetail}>
          {item.members.length}/{item.maxMembers} members
        </Text>
        <Text style={styles.teamDetail}>•</Text>
        <Text style={styles.teamDetail}>{item.skillLevel}</Text>
        {item.leagueId && (
          <>
            <Text style={styles.teamDetail}>•</Text>
            <Text style={styles.teamDetailLeague}>In League</Text>
          </>
        )}
      </View>

      <Button
        title="View Team"
        onPress={() => navigateToTeamDetails(item.id)}
        variant="outline"
        size="small"
        style={styles.viewButton}
      />
    </TouchableOpacity>
  );

  const navigateToTeamDetails = (teamId: string) => {
    navigation.navigate('TeamDetails', { teamId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Find Teams</Text>
          <Text style={styles.subtitle}>Discover teams to join</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      {/* Sport Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterChips}>
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport.value}
                style={[
                  styles.filterChip,
                  selectedSport === sport.value && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedSport(sport.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSport === sport.value &&
                      styles.filterChipTextSelected,
                  ]}
                >
                  {sport.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Results */}
      <FlatList
        data={filteredTeams}
        renderItem={renderTeam}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No Teams Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search or filters
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#f8f9fa',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212529',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    backgroundColor: '#ffffff',
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#212529',
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  teamCard: {
    backgroundColor: '#ffffff',
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
    marginBottom: 12,
  },
  teamDetail: {
    fontSize: 12,
    color: '#6c757d',
  },
  teamDetailLeague: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  viewButton: {
    alignSelf: 'flex-start',
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

export default FindTeamsScreen;
