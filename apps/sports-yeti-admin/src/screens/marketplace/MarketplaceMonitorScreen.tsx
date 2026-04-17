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
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Game, Facility } from '../../types';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: color + '15' }]}>
        <Text style={styles.summaryIconText}>{icon}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
  );
}

export function MarketplaceMonitorScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectingBidId, setSelectingBidId] = useState<string | null>(null);

  const { data: gamesData, isLoading: isLoadingGames, refetch: refetchGames } = useQuery({
    queryKey: ['marketplace-games'],
    queryFn: () => api.getGames({ status: 'scheduled', per_page: 20 }),
  });

  const { data: facilitiesData, isLoading: isLoadingFacilities, refetch: refetchFacilities } = useQuery({
    queryKey: ['marketplace-facilities'],
    queryFn: () => api.getFacilities({ per_page: 20 }),
  });

  const { data: assignmentsData, isLoading: isLoadingAssignments, refetch: refetchAssignments } = useQuery({
    queryKey: ['marketplace-referee-assignments'],
    queryFn: () => api.getRefereeAssignments({ status: 'pending', per_page: 20 }),
  });

  const games = gamesData?.data ?? [];
  const facilities = facilitiesData?.data ?? [];
  const assignments = assignmentsData?.data ?? [];

  const activeGames = games.length;
  const pendingBids = assignments.filter((a) => a.is_bidding).length;
  const totalSlots = facilities.reduce((sum, f: Facility) => sum + (f.spaces_count ?? 0), 0);
  const fillRate = totalSlots > 0 ? Math.round((activeGames / Math.max(totalSlots, 1)) * 100) : 0;

  const isLoading = isLoadingGames && isLoadingFacilities && isLoadingAssignments && !refreshing;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchGames(), refetchFacilities(), refetchAssignments()]);
    setRefreshing(false);
  }, [refetchGames, refetchFacilities, refetchAssignments]);

  const handleSelectBid = useCallback(
    async (assignmentId: string) => {
      setSelectingBidId(assignmentId);
      try {
        await api.selectBid(assignmentId);
        await Promise.all([refetchGames(), refetchAssignments()]);
      } catch (e) {
        alert((e as Error).message ?? 'Failed to select bid');
      } finally {
        setSelectingBidId(null);
      }
    },
    [refetchGames, refetchAssignments]
  );

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
        <Text style={styles.title}>Marketplace Monitor</Text>
        <Text style={styles.subtitle}>Open slots, games, and referee activity</Text>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard title="Total Open Slots" value={String(totalSlots)} icon="🏟️" color={COLORS.primary} />
        <SummaryCard title="Active Games" value={String(activeGames)} icon="🏀" color={COLORS.success} />
        <SummaryCard title="Pending Bids" value={String(pendingBids)} icon="🏁" color={COLORS.warning} />
        <SummaryCard title="Fill Rate" value={`${fillRate}%`} icon="📊" color={COLORS.secondary} />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Open Slots by Facility</Text>
        <View style={styles.sectionCard}>
          {facilities.length === 0 ? (
            <Text style={styles.emptyText}>No facilities available</Text>
          ) : (
            facilities.map((facility: Facility) => (
              <View key={facility.id} style={styles.listRow}>
                <View style={styles.listRowInfo}>
                  <Text style={styles.listRowName}>{facility.name}</Text>
                  <Text style={styles.listRowSub}>
                    {facility.city}, {facility.state} · {facility.spaces_count ?? 0} spaces
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: COLORS.primary + '20' }]}>
                  <Text style={[styles.badgeText, { color: COLORS.primary }]}>
                    {facility.spaces_count ?? 0} slots
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Open Games</Text>
        <View style={styles.sectionCard}>
          {games.length === 0 ? (
            <Text style={styles.emptyText}>No open games</Text>
          ) : (
            games.map((game: Game) => (
              <View key={game.id} style={styles.listRow}>
                <View style={styles.listRowInfo}>
                  <Text style={styles.listRowName}>
                    {game.team1?.name ?? 'TBD'} vs {game.team2?.name ?? 'TBD'}
                  </Text>
                  <Text style={styles.listRowSub}>
                    {new Date(game.scheduled_at).toLocaleDateString()} · {game.league?.name ?? 'League'}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: COLORS.success + '20' }]}>
                  <Text style={[styles.badgeText, { color: COLORS.success }]}>{game.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Referee Bid Activity</Text>
        <View style={styles.sectionCard}>
          {assignments.length === 0 ? (
            <Text style={styles.emptyText}>No pending referee bids</Text>
          ) : (
            assignments.map((assignment) => {
              const isPending = assignment.status === 'pending';
              const isSelecting = selectingBidId === assignment.id;
              return (
                <View key={assignment.id} style={styles.listRow}>
                  <View style={styles.listRowInfo}>
                    <Text style={styles.listRowName}>
                      {assignment.referee?.user?.name ?? 'Referee'}
                    </Text>
                    <Text style={styles.listRowSub}>
                      {assignment.is_bidding
                        ? `Bid: $${Number(assignment.bid_amount ?? 0).toFixed(2)}`
                        : `Rate: $${Number(assignment.assigned_rate ?? 0).toFixed(2)}`}
                      {' · '}{assignment.status}
                    </Text>
                  </View>
                  <View style={styles.bidActions}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: (assignment.is_bidding ? COLORS.warning : COLORS.primary) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: assignment.is_bidding ? COLORS.warning : COLORS.primary },
                        ]}
                      >
                        {assignment.is_bidding ? 'Bidding' : 'Assigned'}
                      </Text>
                    </View>
                    {isPending && (
                      <TouchableOpacity
                        style={[styles.selectBidButton, isSelecting && styles.selectBidButtonDisabled]}
                        onPress={() => handleSelectBid(assignment.id)}
                        disabled={isSelecting}
                      >
                        {isSelecting ? (
                          <ActivityIndicator size="small" color={COLORS.textLight} />
                        ) : (
                          <Text style={styles.selectBidButtonText}>Select Bid</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: SPACING.lg, paddingBottom: SPACING.md },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  summaryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg, gap: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg,
    flex: 1, minWidth: 200, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  summaryIcon: {
    width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  summaryIconText: { fontSize: 24 },
  summaryValue: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  summaryTitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  sectionContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  sectionCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SPACING.xl },
  listRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  listRowInfo: { flex: 1, marginRight: SPACING.md },
  listRowName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  listRowSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  badge: { paddingVertical: 4, paddingHorizontal: SPACING.sm, borderRadius: 6 },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600', textTransform: 'capitalize' },
  bidActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  selectBidButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  selectBidButtonDisabled: { opacity: 0.5 },
  selectBidButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.xs, fontWeight: '600' },
  bottomPadding: { height: SPACING.xxl },
});
