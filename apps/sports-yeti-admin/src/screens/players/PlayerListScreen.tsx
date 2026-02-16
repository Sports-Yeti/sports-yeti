import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Player, League, PaginationMeta } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface PlayerCardProps {
  player: Player;
  onPress: () => void;
}

function PlayerCard({ player, onPress }: PlayerCardProps) {
  const experienceColors: Record<string, string> = {
    beginner: COLORS.success,
    intermediate: COLORS.primary,
    advanced: COLORS.warning,
    pro: COLORS.error,
  };

  const availabilityColors: Record<string, string> = {
    available: COLORS.success,
    looking_for_team: COLORS.warning,
    unavailable: COLORS.textMuted,
  };

  const availabilityLabels: Record<string, string> = {
    available: 'Available',
    looking_for_team: 'Looking for Team',
    unavailable: 'Unavailable',
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.playerAvatarContainer}>
          <View style={styles.playerAvatar}>
            <Text style={styles.playerAvatarText}>
              {player.user?.name?.charAt(0).toUpperCase() ?? 'P'}
            </Text>
          </View>
          {player.is_private && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>🔒</Text>
            </View>
          )}
        </View>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle}>{player.user?.name ?? 'Unknown'}</Text>
          <Text style={styles.playerEmail}>
            {player.user?.email ?? 'No email'}
          </Text>
        </View>
        <View
          style={[
            styles.experienceBadge,
            { backgroundColor: (experienceColors[player.experience_level] || COLORS.textMuted) + '20' },
          ]}
        >
          <Text
            style={[
              styles.experienceBadgeText,
              { color: experienceColors[player.experience_level] || COLORS.textMuted },
            ]}
          >
            {player.experience_level}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Position:</Text>
          <Text style={styles.cardValue}>{player.position ?? 'Not set'}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>League:</Text>
          <Text style={styles.cardValue}>
            {player.league?.name ?? 'No League'}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Teams:</Text>
          <Text style={styles.cardValue}>
            {player.teams?.length ?? 0} team(s)
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.availabilityBadge,
            {
              backgroundColor:
                (availabilityColors[player.availability_status] || COLORS.textMuted) + '20',
            },
          ]}
        >
          <View
            style={[
              styles.availabilityDot,
              {
                backgroundColor:
                  availabilityColors[player.availability_status] || COLORS.textMuted,
              },
            ]}
          />
          <Text
            style={[
              styles.availabilityText,
              {
                color:
                  availabilityColors[player.availability_status] || COLORS.textMuted,
              },
            ]}
          >
            {availabilityLabels[player.availability_status] || player.availability_status}
          </Text>
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export function PlayerListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [experienceFilter, setExperienceFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch leagues for filter
  const { data: leaguesData } = useQuery({
    queryKey: ['leagues', { per_page: 100 }],
    queryFn: () => api.getLeagues({ per_page: 100 }),
  });
  const leagues = leaguesData?.data ?? [];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'players',
      {
        search: searchQuery,
        league_id: selectedLeague,
        experience_level: experienceFilter,
        availability_status: availabilityFilter,
        page,
      },
    ],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page,
        per_page: 15,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedLeague) params.league_id = selectedLeague;
      if (experienceFilter) params.experience_level = experienceFilter;
      if (availabilityFilter) params.availability_status = availabilityFilter;
      return api.getPlayers(params);
    },
  });

  const players = data?.data ?? [];
  const meta: PaginationMeta | undefined = data?.meta;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const handlePlayerPress = (player: Player) => {
    navigation.navigate('PlayerDetail', { id: player.id });
  };

  const experienceLevels = ['beginner', 'intermediate', 'advanced', 'pro'];
  const availabilityStatuses = ['available', 'looking_for_team', 'unavailable'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Players</Text>
          <Text style={styles.subtitle}>
            View and manage all players across your leagues
          </Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search players by name..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          {/* League Filter */}
          <View style={styles.filterDropdown}>
            <Text style={styles.filterLabel}>League:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedLeague && styles.filterChipActive,
                ]}
                onPress={() => setSelectedLeague('')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !selectedLeague && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {leagues.map((league: League) => (
                <TouchableOpacity
                  key={league.id}
                  style={[
                    styles.filterChip,
                    selectedLeague === league.id && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setSelectedLeague(selectedLeague === league.id ? '' : league.id)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedLeague === league.id && styles.filterChipTextActive,
                    ]}
                  >
                    {league.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Experience Filter */}
          <View style={styles.filterDropdown}>
            <Text style={styles.filterLabel}>Experience:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !experienceFilter && styles.filterChipActive,
                ]}
                onPress={() => setExperienceFilter('')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !experienceFilter && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterChip,
                    experienceFilter === level && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setExperienceFilter(experienceFilter === level ? '' : level)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      experienceFilter === level && styles.filterChipTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Availability Filter */}
          <View style={styles.filterDropdown}>
            <Text style={styles.filterLabel}>Availability:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !availabilityFilter && styles.filterChipActive,
                ]}
                onPress={() => setAvailabilityFilter('')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !availabilityFilter && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {availabilityStatuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    availabilityFilter === status && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setAvailabilityFilter(availabilityFilter === status ? '' : status)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      availabilityFilter === status && styles.filterChipTextActive,
                    ]}
                  >
                    {status === 'looking_for_team'
                      ? 'Looking'
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load players</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {players.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏃</Text>
              <Text style={styles.emptyTitle}>No players found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedLeague || experienceFilter || availabilityFilter
                  ? 'Try adjusting your search or filters'
                  : 'Players will appear here when they register'}
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onPress={() => handlePlayerPress(player)}
                />
              ))}
            </View>
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                Page {meta.current_page} of {meta.last_page}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  page === meta.last_page && styles.pageButtonDisabled,
                ]}
                onPress={() => setPage(Math.min(meta.last_page, page + 1))}
                disabled={page === meta.last_page}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textMuted,
    padding: SPACING.xs,
  },
  filterRow: {
    gap: SPACING.sm,
  },
  filterDropdown: {
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    margin: SPACING.sm,
    minWidth: 320,
    maxWidth: '48%',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  playerAvatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  playerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  privateBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 2,
  },
  privateBadgeText: {
    fontSize: 12,
  },
  cardTitleSection: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  playerEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  experienceBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  experienceBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardBody: {
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  cardLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  cardValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  availabilityText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.lg,
  },
  pageButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
