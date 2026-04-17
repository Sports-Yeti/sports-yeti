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
import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Team, League, PaginationMeta } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface TeamPaymentSummary {
  paid_count: number;
  pending_count: number;
  roster_count: number;
  is_complete: boolean;
}

interface TeamCardProps {
  team: Team;
  paymentSummary?: TeamPaymentSummary | null;
  isPaymentLoading?: boolean;
  onPress: () => void;
  onDelete: () => void;
  onApprove: () => void;
  onReject: () => void;
}

function RosterBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min(current / max, 1) : 0;
  const barColor = pct >= 1 ? COLORS.success : pct >= 0.5 ? COLORS.primary : COLORS.warning;

  return (
    <View style={styles.rosterBarContainer}>
      <View style={styles.rosterBarLabelRow}>
        <Text style={styles.rosterBarLabel}>Roster</Text>
        <Text style={styles.rosterBarValue}>{current}/{max}</Text>
      </View>
      <View style={styles.rosterBarTrack}>
        <View style={[styles.rosterBarFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

function PaymentProgress({ summary, isLoading }: { summary?: TeamPaymentSummary | null; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Payments</Text>
        <Text style={styles.paymentValue}>Loading…</Text>
      </View>
    );
  }
  if (!summary) return null;

  const paid = Number(summary.paid_count ?? 0);
  const total = Number(summary.roster_count ?? 0);
  const pct = total > 0 ? Math.min(paid / total, 1) : 0;
  const barColor = summary.is_complete ? COLORS.success : pct >= 0.5 ? COLORS.warning : COLORS.error;

  return (
    <View style={styles.paymentBlock}>
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Payments</Text>
        <Text style={[styles.paymentValue, summary.is_complete && { color: COLORS.success }]}>
          {paid}/{total} paid
        </Text>
      </View>
      <View style={styles.paymentTrack}>
        <View style={[styles.paymentFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

function TeamCard({ team, paymentSummary, isPaymentLoading, onPress, onDelete, onApprove, onReject }: TeamCardProps) {
  const statusColors: Record<string, string> = {
    approved: COLORS.success,
    pending: COLORS.warning,
    rejected: COLORS.error,
    inactive: COLORS.textMuted,
  };

  const isPending = team.status === 'pending';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.teamAvatarContainer}>
          <View style={styles.teamAvatar}>
            <Text style={styles.teamAvatarText}>
              {team.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle}>{team.name}</Text>
          <Text style={styles.leagueName}>{team.league?.name ?? 'No League'}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: (statusColors[team.status] || COLORS.textMuted) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusColors[team.status] || COLORS.textMuted },
            ]}
          >
            {team.status}
          </Text>
        </View>
      </View>

      {team.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {team.description}
        </Text>
      )}

      <RosterBar current={team.players_count ?? 0} max={team.max_roster_size} />

      {isPending && (
        <PaymentProgress summary={paymentSummary} isLoading={isPaymentLoading} />
      )}

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{team.players_count ?? 0}</Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{team.max_roster_size}</Text>
          <Text style={styles.statLabel}>Max Roster</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {team.captain?.user?.name?.split(' ')[0] ?? 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Captain</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {isPending ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={(e) => { e.stopPropagation(); onApprove(); }}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={(e) => { e.stopPropagation(); onReject(); }}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={(e) => { e.stopPropagation(); onPress(); }}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function TeamListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch leagues for filter
  const { data: leaguesData } = useQuery({
    queryKey: ['leagues', { per_page: 100 }],
    queryFn: () => api.getLeagues({ per_page: 100 }),
  });
  const leagues = leaguesData?.data ?? [];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teams', { search: searchQuery, league_id: selectedLeague, status: statusFilter, page }],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page,
        per_page: 15,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedLeague) params.league_id = selectedLeague;
      if (statusFilter) params.status = statusFilter;
      return api.getTeams(params);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateTeamStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const teams = data?.data ?? [];
  const meta: PaginationMeta | undefined = data?.meta;

  const pendingTeams = teams.filter((t) => t.status === 'pending');
  const paymentQueries = useQueries({
    queries: pendingTeams.map((team) => ({
      queryKey: ['team-payment-summary', team.id],
      queryFn: () => api.getTeamPaymentSummary(team.id),
      staleTime: 30_000,
    })),
  });
  const paymentSummariesByTeamId: Record<string, { summary: TeamPaymentSummary | null; isLoading: boolean }> = {};
  pendingTeams.forEach((team, idx) => {
    const result = paymentQueries[idx];
    paymentSummariesByTeamId[team.id] = {
      summary: result?.data ?? null,
      isLoading: !!result?.isLoading,
    };
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const handleTeamPress = (team: Team) => {
    navigation.navigate('TeamDetail', { id: team.id });
  };

  const handleDeleteTeam = async (team: Team) => {
    if (confirm(`Are you sure you want to delete "${team.name}"?`)) {
      await deleteMutation.mutateAsync(team.id);
    }
  };

  const handleApproveTeam = async (team: Team) => {
    if (confirm(`Approve team "${team.name}"?`)) {
      await statusMutation.mutateAsync({ id: team.id, status: 'approved' });
    }
  };

  const handleRejectTeam = async (team: Team) => {
    if (confirm(`Reject team "${team.name}"?`)) {
      await statusMutation.mutateAsync({ id: team.id, status: 'rejected' });
    }
  };

  const statuses = ['pending', 'approved', 'rejected', 'inactive'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Teams</Text>
          <Text style={styles.subtitle}>
            Manage all teams across your leagues
          </Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
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
                  All Leagues
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

          {/* Status Filter */}
          <View style={styles.filterDropdown}>
            <Text style={styles.filterLabel}>Status:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !statusFilter && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter('')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !statusFilter && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    statusFilter === status && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setStatusFilter(statusFilter === status ? '' : status)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      statusFilter === status && styles.filterChipTextActive,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
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
          <Text style={styles.errorText}>Failed to load teams</Text>
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
          {teams.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No teams found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedLeague || statusFilter
                  ? 'Try adjusting your search or filters'
                  : 'Teams will appear here when players create them'}
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {teams.map((team) => {
                const paymentInfo = paymentSummariesByTeamId[team.id];
                return (
                  <TeamCard
                    key={team.id}
                    team={team}
                    paymentSummary={paymentInfo?.summary}
                    isPaymentLoading={paymentInfo?.isLoading}
                    onPress={() => handleTeamPress(team)}
                    onDelete={() => handleDeleteTeam(team)}
                    onApprove={() => handleApproveTeam(team)}
                    onReject={() => handleRejectTeam(team)}
                  />
                );
              })}
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
    marginBottom: SPACING.sm,
  },
  teamAvatarContainer: {
    marginRight: SPACING.md,
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamAvatarText: {
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
    marginBottom: 2,
  },
  leagueName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
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
  approveButton: {
    backgroundColor: COLORS.success + '15',
  },
  approveButtonText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: COLORS.error + '15',
  },
  rejectButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: COLORS.error + '15',
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  rosterBarContainer: {
    marginBottom: SPACING.md,
  },
  rosterBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rosterBarLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  rosterBarValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  rosterBarTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  rosterBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  paymentBlock: {
    marginBottom: SPACING.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  paymentTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  paymentFill: {
    height: '100%',
    borderRadius: 3,
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
