import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Game, League } from '../../types';

type ViewMode = 'list' | 'week';

const GAME_TYPE_COLORS: Record<string, string> = {
  regular: COLORS.primary,
  playoff: COLORS.warning,
  championship: COLORS.error,
  friendly: COLORS.success,
  scrimmage: COLORS.textMuted,
};

function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

interface GameCardProps {
  game: Game;
}

function GameCard({ game }: GameCardProps) {
  const typeColor = GAME_TYPE_COLORS[game.game_type] || COLORS.textMuted;
  const statusColors: Record<string, string> = {
    scheduled: COLORS.primary,
    in_progress: COLORS.warning,
    completed: COLORS.success,
    cancelled: COLORS.error,
    postponed: COLORS.textMuted,
  };
  const statusColor = statusColors[game.status] || COLORS.textMuted;

  return (
    <View style={styles.gameCard}>
      <View style={styles.gameCardTop}>
        <View style={styles.gameTeams}>
          <Text style={styles.teamName}>{game.team1?.name ?? 'TBD'}</Text>
          <Text style={styles.vsText}>vs</Text>
          <Text style={styles.teamName}>{game.team2?.name ?? 'TBD'}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
          <Text style={[styles.typeBadgeText, { color: typeColor }]}>{game.game_type}</Text>
        </View>
      </View>

      <View style={styles.gameCardMeta}>
        <Text style={styles.gameTime}>
          {new Date(game.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.gameFacility}>{game.facility?.name ?? 'No Facility'}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.gameStatus, { color: statusColor }]}>{game.status}</Text>
      </View>

      {game.team1_score !== null && game.team2_score !== null && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>{game.team1_score} - {game.team2_score}</Text>
        </View>
      )}
    </View>
  );
}

export function ScheduleScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);

  const { data: leaguesData } = useQuery({
    queryKey: ['leagues', { per_page: 100 }],
    queryFn: () => api.getLeagues({ per_page: 100 }),
  });
  const leagues = leaguesData?.data ?? [];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['games', { league_id: selectedLeague, status: statusFilter }],
    queryFn: async () => {
      const params: Record<string, unknown> = { per_page: 100 };
      if (selectedLeague) params.league_id = selectedLeague;
      if (statusFilter) params.status = statusFilter;
      return api.getGames(params);
    },
  });

  const games = data?.data ?? [];

  const gamesByDate = useMemo(() => {
    const grouped: Record<string, Game[]> = {};
    for (const game of games) {
      const key = game.scheduled_at.split('T')[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(game);
    }
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    }
    return grouped;
  }, [games]);

  const sortedDateKeys = useMemo(() =>
    Object.keys(gamesByDate).sort(), [gamesByDate]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const result = await api.importGames(file);
        alert(`Imported ${result.imported} games. ${result.errors.length > 0 ? `Errors: ${result.errors.join(', ')}` : ''}`);
        refetch();
      } catch {
        alert('Failed to import games');
      }
    };
    input.click();
  };

  const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>Manage games and schedules</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.importButton} onPress={handleImportCSV}>
            <Text style={styles.importButtonText}>Import CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Week</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedLeague && styles.filterChipActive]}
            onPress={() => setSelectedLeague('')}
          >
            <Text style={[styles.filterChipText, !selectedLeague && styles.filterChipTextActive]}>All Leagues</Text>
          </TouchableOpacity>
          {leagues.map((league: League) => (
            <TouchableOpacity
              key={league.id}
              style={[styles.filterChip, selectedLeague === league.id && styles.filterChipActive]}
              onPress={() => setSelectedLeague(selectedLeague === league.id ? '' : league.id)}
            >
              <Text style={[styles.filterChipText, selectedLeague === league.id && styles.filterChipTextActive]}>
                {league.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !statusFilter && styles.filterChipActive]}
            onPress={() => setStatusFilter('')}
          >
            <Text style={[styles.filterChipText, !statusFilter && styles.filterChipTextActive]}>All Status</Text>
          </TouchableOpacity>
          {statuses.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
              onPress={() => setStatusFilter(statusFilter === s ? '' : s)}
            >
              <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>
                {s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load games</Text>
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
          {viewMode === 'week' ? (
            <View>
              <View style={styles.weekNav}>
                <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
                  <Text style={styles.weekNavButton}>← Prev</Text>
                </TouchableOpacity>
                <Text style={styles.weekNavTitle}>
                  {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                  {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
                  <Text style={styles.weekNavButton}>Next →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weekGrid}>
                {weekDates.map((date) => {
                  const key = formatDateKey(date);
                  const dayGames = gamesByDate[key] ?? [];
                  const isToday = formatDateKey(new Date()) === key;
                  return (
                    <View key={key} style={[styles.dayColumn, isToday && styles.dayColumnToday]}>
                      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>
                        {date.getDate()}
                      </Text>
                      {dayGames.length === 0 ? (
                        <Text style={styles.noGames}>—</Text>
                      ) : (
                        dayGames.map((game) => <GameCard key={game.id} game={game} />)
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <>
              {games.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📅</Text>
                  <Text style={styles.emptyTitle}>No games found</Text>
                  <Text style={styles.emptyText}>Adjust your filters or import a schedule</Text>
                </View>
              ) : (
                sortedDateKeys.map((dateKey) => (
                  <View key={dateKey} style={styles.dateGroup}>
                    <Text style={styles.dateGroupTitle}>
                      {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </Text>
                    {gamesByDate[dateKey].map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  importButton: {
    backgroundColor: COLORS.surface, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  importButtonText: { color: COLORS.text, fontSize: FONT_SIZES.md, fontWeight: '600' },
  filtersContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.sm },
  viewToggle: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, alignSelf: 'flex-start',
  },
  toggleButton: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  toggleButtonActive: { backgroundColor: COLORS.primary, borderRadius: 7 },
  toggleText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.textLight },
  filterScroll: { flexGrow: 0 },
  filterChip: {
    backgroundColor: COLORS.surface, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 20, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: COLORS.textLight },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: { fontSize: FONT_SIZES.md, color: COLORS.error, marginBottom: SPACING.md },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: 8 },
  retryButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
  listContainer: { flex: 1, paddingHorizontal: SPACING.lg },
  weekNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.md, marginBottom: SPACING.md,
  },
  weekNavButton: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600' },
  weekNavTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  weekGrid: { flexDirection: 'row', gap: SPACING.sm },
  dayColumn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, padding: SPACING.sm,
    minHeight: 200, borderWidth: 1, borderColor: COLORS.border,
  },
  dayColumnToday: { borderColor: COLORS.primary, borderWidth: 2 },
  dayLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '500' },
  dayLabelToday: { color: COLORS.primary },
  dayDate: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  dayDateToday: { color: COLORS.primary },
  noGames: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md },
  dateGroup: { marginBottom: SPACING.lg },
  dateGroupTitle: {
    fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text,
    marginBottom: SPACING.sm, paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  gameCard: {
    backgroundColor: COLORS.surface, borderRadius: 8, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  gameCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  gameTeams: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.sm },
  teamName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  vsText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  typeBadge: { paddingVertical: 2, paddingHorizontal: SPACING.sm, borderRadius: 4 },
  typeBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  gameCardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  gameTime: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  gameFacility: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  gameStatus: { fontSize: FONT_SIZES.xs, fontWeight: '500', textTransform: 'capitalize' },
  scoreRow: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  scoreText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl * 2 },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 300 },
});
