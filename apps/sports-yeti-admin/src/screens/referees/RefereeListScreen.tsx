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
import type { Referee, PaginationMeta } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const SPORT_TYPES = ['basketball', 'soccer', 'football', 'baseball', 'volleyball', 'hockey'];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#F59E0B' : COLORS.disabled }}>
        ★
      </Text>
    );
  }
  return <View style={{ flexDirection: 'row', gap: 1 }}>{stars}</View>;
}

interface RefereeCardProps {
  referee: Referee;
  onPress: () => void;
}

function RefereeCard({ referee, onPress }: RefereeCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(referee.user?.name ?? 'R').charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle}>{referee.user?.name ?? 'Unknown'}</Text>
          <View style={styles.sportTags}>
            {referee.sport_types.slice(0, 3).map((sport) => (
              <View key={sport} style={styles.sportTag}>
                <Text style={styles.sportTagText}>{sport}</Text>
              </View>
            ))}
          </View>
        </View>
        <View
          style={[
            styles.availabilityBadge,
            { backgroundColor: (referee.is_available ? COLORS.success : COLORS.textMuted) + '20' },
          ]}
        >
          <Text
            style={[
              styles.availabilityText,
              { color: referee.is_available ? COLORS.success : COLORS.textMuted },
            ]}
          >
            {referee.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <StarRating rating={referee.rating} />
          <Text style={styles.statLabel}>{Number(referee.rating).toFixed(1)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${referee.hourly_rate}</Text>
          <Text style={styles.statLabel}>/ hour</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{referee.total_games}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{referee.experience_level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={(e) => {
            e.stopPropagation();
            onPress();
          }}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export function RefereeListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['referees', { search: searchQuery, sport_type: sportFilter, is_available: availabilityFilter, page }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, per_page: 15 };
      if (searchQuery) params.search = searchQuery;
      if (sportFilter) params.sport_type = sportFilter;
      if (availabilityFilter) params.is_available = availabilityFilter === 'available';
      return api.getReferees(params);
    },
  });

  const referees = data?.data ?? [];
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

  const handleRefereePress = (referee: Referee) => {
    navigation.navigate('RefereeDetail', { id: referee.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Referees</Text>
          <Text style={styles.subtitle}>Manage referees and their assignments</Text>
        </View>
        <TouchableOpacity
          style={styles.assignmentsButton}
          onPress={() => navigation.navigate('RefereeAssignments')}
        >
          <Text style={styles.assignmentsButtonText}>Manage Assignments</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search referees..."
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
          <View style={styles.filterDropdown}>
            <Text style={styles.filterLabel}>Sport:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, !sportFilter && styles.filterChipActive]}
                onPress={() => setSportFilter('')}
              >
                <Text style={[styles.filterChipText, !sportFilter && styles.filterChipTextActive]}>All</Text>
              </TouchableOpacity>
              {SPORT_TYPES.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  style={[styles.filterChip, sportFilter === sport && styles.filterChipActive]}
                  onPress={() => setSportFilter(sportFilter === sport ? '' : sport)}
                >
                  <Text style={[styles.filterChipText, sportFilter === sport && styles.filterChipTextActive]}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterDropdown}>
            <Text style={styles.filterLabel}>Availability:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['', 'available', 'unavailable'].map((status) => (
                <TouchableOpacity
                  key={status || 'all'}
                  style={[styles.filterChip, availabilityFilter === status && styles.filterChipActive]}
                  onPress={() => setAvailabilityFilter(availabilityFilter === status ? '' : status)}
                >
                  <Text style={[styles.filterChipText, availabilityFilter === status && styles.filterChipTextActive]}>
                    {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load referees</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {referees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏁</Text>
              <Text style={styles.emptyTitle}>No referees found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || sportFilter || availabilityFilter
                  ? 'Try adjusting your search or filters'
                  : 'Referees will appear here when they register'}
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {referees.map((referee) => (
                <RefereeCard
                  key={referee.id}
                  referee={referee}
                  onPress={() => handleRefereePress(referee)}
                />
              ))}
            </View>
          )}

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
                style={[styles.pageButton, page === meta.last_page && styles.pageButtonDisabled]}
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
  assignmentsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  assignmentsButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
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
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  cardTitleSection: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  sportTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  sportTag: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  sportTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  availabilityBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: COLORS.primaryLight,
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
