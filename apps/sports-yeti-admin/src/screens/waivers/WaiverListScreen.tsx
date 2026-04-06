import React, { useState, useCallback } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Waiver, League, PaginationMeta, MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface WaiverCardProps {
  waiver: Waiver;
  onPress: () => void;
}

function WaiverCard({ waiver, onPress }: WaiverCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle}>{waiver.title}</Text>
          <Text style={styles.leagueName}>{waiver.league?.name ?? 'All Leagues'}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: waiver.is_required ? COLORS.error + '20' : COLORS.success + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: waiver.is_required ? COLORS.error : COLORS.success },
            ]}
          >
            {waiver.is_required ? 'Required' : 'Optional'}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {waiver.content}
      </Text>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{waiver.signatures_count ?? 0}</Text>
          <Text style={styles.statLabel}>Signatures</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {new Date(waiver.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.statLabel}>Created</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={(e) => { e.stopPropagation(); onPress(); }}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export function WaiverListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { data: leaguesData } = useQuery({
    queryKey: ['leagues', { per_page: 100 }],
    queryFn: () => api.getLeagues({ per_page: 100 }),
  });
  const leagues = leaguesData?.data ?? [];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['waivers', { league_id: selectedLeague, page }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, per_page: 15 };
      if (selectedLeague) params.league_id = selectedLeague;
      return api.getWaivers(params);
    },
  });

  const waivers = data?.data ?? [];
  const meta: PaginationMeta | undefined = data?.meta;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Waivers</Text>
          <Text style={styles.subtitle}>Manage waivers and track signatures</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('WaiverForm', {})}
        >
          <Text style={styles.createButtonText}>+ Create Waiver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedLeague && styles.filterChipActive]}
            onPress={() => { setSelectedLeague(''); setPage(1); }}
          >
            <Text style={[styles.filterChipText, !selectedLeague && styles.filterChipTextActive]}>
              All Leagues
            </Text>
          </TouchableOpacity>
          {leagues.map((league: League) => (
            <TouchableOpacity
              key={league.id}
              style={[styles.filterChip, selectedLeague === league.id && styles.filterChipActive]}
              onPress={() => { setSelectedLeague(selectedLeague === league.id ? '' : league.id); setPage(1); }}
            >
              <Text style={[styles.filterChipText, selectedLeague === league.id && styles.filterChipTextActive]}>
                {league.name}
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
          <Text style={styles.errorText}>Failed to load waivers</Text>
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
          {waivers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No waivers found</Text>
              <Text style={styles.emptyText}>
                {selectedLeague ? 'Try a different league filter' : 'Create your first waiver to get started'}
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {waivers.map((waiver) => (
                <WaiverCard
                  key={waiver.id}
                  waiver={waiver}
                  onPress={() => navigation.navigate('WaiverDetail', { id: waiver.id })}
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
              <Text style={styles.pageInfo}>Page {meta.current_page} of {meta.last_page}</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  createButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg, borderRadius: 8 },
  createButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
  filtersContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
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
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.sm },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg, margin: SPACING.sm,
    minWidth: 320, maxWidth: '48%', flex: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  cardTitleSection: { flex: 1, marginRight: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  leagueName: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  statusBadge: { paddingVertical: 4, paddingHorizontal: SPACING.sm, borderRadius: 4 },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  cardDescription: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 20 },
  cardStats: {
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: SPACING.md,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: { flex: 1, paddingVertical: SPACING.sm, borderRadius: 6, alignItems: 'center' },
  viewButton: { backgroundColor: COLORS.primaryLight },
  viewButtonText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl * 2 },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 300 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.lg },
  pageButton: {
    backgroundColor: COLORS.surface, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  pageButtonDisabled: { opacity: 0.5 },
  pageButtonText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  pageInfo: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
});
