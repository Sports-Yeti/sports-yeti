import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Game } from '../../types';

interface PlayerStat {
  player_id: string;
  player_name: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
}

interface HighlightItem {
  id: string;
  player_name: string;
  team_name: string;
  stat_type: string;
  value: number;
}

const TABS = ['Game Stats', 'Highlights'] as const;
type Tab = (typeof TABS)[number];

const LEADERBOARD_CATEGORIES = ['points', 'assists', 'rebounds', 'steals', 'blocks'] as const;

function TabBar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StatInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (v: string) => void }) {
  return (
    <View style={styles.statInputContainer}>
      <Text style={styles.statInputLabel}>{label}</Text>
      <TextInput
        style={styles.statInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}

export function StatsScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('Game Stats');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [leaderboardCategory, setLeaderboardCategory] = useState<string>('points');

  const { data: gamesData, isLoading: isLoadingGames, refetch: refetchGames } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.getGames({ per_page: 50 }),
  });

  const games = gamesData?.data ?? [];

  const { data: gameStats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['game-stats', selectedGameId],
    queryFn: () => api.getGameStats(selectedGameId!),
    enabled: !!selectedGameId,
  });

  const { data: highlights, isLoading: isLoadingHighlights, refetch: refetchHighlights } = useQuery({
    queryKey: ['highlights'],
    queryFn: () => api.getHighlights(),
  });

  const saveMutation = useMutation({
    mutationFn: () => api.saveGameStats(selectedGameId!, playerStats.map((s) => ({
      player_id: s.player_id,
      points: s.points,
      rebounds: s.rebounds,
      assists: s.assists,
      steals: s.steals,
      blocks: s.blocks,
    }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-stats', selectedGameId] });
      alert('Stats saved successfully');
    },
    onError: () => alert('Failed to save stats'),
  });

  React.useEffect(() => {
    if (gameStats && Array.isArray(gameStats)) {
      setPlayerStats(gameStats.map((s: Record<string, unknown>) => ({
        player_id: String(s.player_id ?? ''),
        player_name: String(s.player_name ?? 'Player'),
        points: Number(s.points ?? 0),
        rebounds: Number(s.rebounds ?? 0),
        assists: Number(s.assists ?? 0),
        steals: Number(s.steals ?? 0),
        blocks: Number(s.blocks ?? 0),
      })));
    }
  }, [gameStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchGames(), refetchHighlights()]);
    if (selectedGameId) await refetchStats();
    setRefreshing(false);
  }, [refetchGames, refetchHighlights, refetchStats, selectedGameId]);

  const updatePlayerStat = (idx: number, field: keyof PlayerStat, value: string) => {
    setPlayerStats((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: Number(value) || 0 };
      return next;
    });
  };

  const selectGame = (game: Game) => {
    setSelectedGameId(game.id);
  };

  const highlightItems: HighlightItem[] = Array.isArray(highlights?.data)
    ? highlights.data.map((h: Record<string, unknown>) => ({
        id: String(h.id ?? ''),
        player_name: String(h.player_name ?? 'Player'),
        team_name: String(h.team_name ?? 'Team'),
        stat_type: String(h.stat_type ?? ''),
        value: Number(h.value ?? 0),
      }))
    : [];

  const leaderboardData = [...highlightItems]
    .filter((h) => h.stat_type === leaderboardCategory)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const isLoading = isLoadingGames && !refreshing;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Stats & Highlights</Text>
          <Text style={styles.subtitle}>Manage game statistics and player highlights</Text>
        </View>
      </View>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'Game Stats' && (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Game</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gameSelector}>
              {games.map((game: Game) => (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.gameChip, selectedGameId === game.id && styles.gameChipActive]}
                  onPress={() => selectGame(game)}
                >
                  <Text style={[styles.gameChipText, selectedGameId === game.id && styles.gameChipTextActive]}>
                    {game.team1?.name ?? 'Team 1'} vs {game.team2?.name ?? 'Team 2'}
                  </Text>
                  <Text style={[styles.gameChipDate, selectedGameId === game.id && styles.gameChipDateActive]}>
                    {new Date(game.scheduled_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
              {games.length === 0 && <Text style={styles.emptyText}>No games available</Text>}
            </ScrollView>
          </View>

          {selectedGameId && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Player Stats</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.importButton} onPress={() => alert('Import feature coming soon')}>
                    <Text style={styles.importButtonText}>Import Stats</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <ActivityIndicator size="small" color={COLORS.surface} />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Stats</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {isLoadingStats ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : playerStats.length === 0 ? (
                <Text style={styles.emptyText}>No player stats for this game yet</Text>
              ) : (
                <View style={styles.statsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.playerNameCol]}>Player</Text>
                    <Text style={styles.tableHeaderCell}>PTS</Text>
                    <Text style={styles.tableHeaderCell}>REB</Text>
                    <Text style={styles.tableHeaderCell}>AST</Text>
                    <Text style={styles.tableHeaderCell}>STL</Text>
                    <Text style={styles.tableHeaderCell}>BLK</Text>
                  </View>
                  {playerStats.map((stat, idx) => (
                    <View key={stat.player_id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.playerNameCol]} numberOfLines={1}>{stat.player_name}</Text>
                      <StatInput label="" value={String(stat.points)} onChangeText={(v) => updatePlayerStat(idx, 'points', v)} />
                      <StatInput label="" value={String(stat.rebounds)} onChangeText={(v) => updatePlayerStat(idx, 'rebounds', v)} />
                      <StatInput label="" value={String(stat.assists)} onChangeText={(v) => updatePlayerStat(idx, 'assists', v)} />
                      <StatInput label="" value={String(stat.steals)} onChangeText={(v) => updatePlayerStat(idx, 'steals', v)} />
                      <StatInput label="" value={String(stat.blocks)} onChangeText={(v) => updatePlayerStat(idx, 'blocks', v)} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {activeTab === 'Highlights' && (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            {isLoadingHighlights ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : highlightItems.length === 0 ? (
              <Text style={styles.emptyText}>No highlights available yet</Text>
            ) : (
              highlightItems.map((h) => (
                <View key={h.id} style={styles.highlightRow}>
                  <View style={styles.highlightInfo}>
                    <Text style={styles.highlightPlayer}>{h.player_name}</Text>
                    <Text style={styles.highlightTeam}>{h.team_name}</Text>
                  </View>
                  <View style={styles.highlightStat}>
                    <Text style={styles.highlightValue}>{h.value}</Text>
                    <Text style={styles.highlightType}>{h.stat_type}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
              {LEADERBOARD_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, leaderboardCategory === cat && styles.categoryChipActive]}
                  onPress={() => setLeaderboardCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, leaderboardCategory === cat && styles.categoryChipTextActive]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {leaderboardData.length === 0 ? (
              <Text style={styles.emptyText}>No leaderboard data for {leaderboardCategory}</Text>
            ) : (
              leaderboardData.map((item, idx) => (
                <View key={item.id} style={styles.leaderRow}>
                  <View style={styles.leaderRank}>
                    <Text style={styles.leaderRankText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={styles.leaderName}>{item.player_name}</Text>
                    <Text style={styles.leaderTeam}>{item.team_name}</Text>
                  </View>
                  <Text style={styles.leaderValue}>{item.value}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  tabBar: {
    flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: SPACING.sm + 2, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.surface },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  section: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SPACING.xl },
  gameSelector: { marginBottom: SPACING.sm },
  gameChip: {
    backgroundColor: COLORS.background, borderRadius: 8, padding: SPACING.md,
    marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, minWidth: 180,
  },
  gameChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  gameChipText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  gameChipTextActive: { color: COLORS.surface },
  gameChipDate: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 4 },
  gameChipDateActive: { color: 'rgba(255,255,255,0.8)' },
  actionButtons: { flexDirection: 'row', gap: SPACING.sm },
  importButton: {
    backgroundColor: COLORS.surface, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  importButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  saveButton: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 8, minWidth: 100, alignItems: 'center',
  },
  saveButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.surface },
  statsTable: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row', backgroundColor: COLORS.background, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
  },
  tableHeaderCell: { flex: 1, fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
  playerNameCol: { flex: 2, textAlign: 'left' },
  tableRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  tableCell: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, textAlign: 'center' },
  statInputContainer: { flex: 1 },
  statInputLabel: { display: 'none' },
  statInput: {
    backgroundColor: COLORS.background, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 6,
    fontSize: FONT_SIZES.sm, color: COLORS.text, textAlign: 'center', borderWidth: 1, borderColor: COLORS.border,
    marginHorizontal: 2,
  },
  highlightRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  highlightInfo: { flex: 1 },
  highlightPlayer: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  highlightTeam: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  highlightStat: { alignItems: 'flex-end' },
  highlightValue: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.primary },
  highlightType: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textTransform: 'capitalize' },
  categorySelector: { marginBottom: SPACING.md },
  categoryChip: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: 20,
    backgroundColor: COLORS.background, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.textSecondary },
  categoryChipTextActive: { color: COLORS.surface },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  leaderRank: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  leaderRankText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  leaderTeam: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  leaderValue: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.primary },
});
