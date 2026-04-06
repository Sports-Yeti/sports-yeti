import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';

function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
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

export function RefereeEarningsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: earnings, isLoading, refetch } = useQuery({
    queryKey: ['referee-earnings'],
    queryFn: () => api.getRefereeEarnings(),
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Earned</Text>
        <Text style={styles.heroAmount}>${(earnings?.total_earned ?? 0).toFixed(2)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statAmount}>${(earnings?.pending_payouts ?? 0).toFixed(2)}</Text>
          <Text style={styles.statLabel}>Pending Payouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statAmount}>{earnings?.completed_games ?? 0}</Text>
          <Text style={styles.statLabel}>Games Completed</Text>
        </View>
      </View>

      <View style={styles.ratingCard}>
        <Text style={styles.ratingLabel}>Average Rating</Text>
        <View style={styles.ratingDisplay}>
          <StarRating rating={earnings?.average_rating ?? 0} />
          <Text style={styles.ratingValue}>{(earnings?.average_rating ?? 0).toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Earnings</Text>
        {!earnings?.recent_earnings?.length ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No earnings yet</Text>
          </View>
        ) : (
          earnings.recent_earnings.map((item) => (
            <View key={item.id} style={styles.earningRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.earningGame}>
                  {item.game?.team1?.name ?? 'Team 1'} vs {item.game?.team2?.name ?? 'Team 2'}
                </Text>
                <Text style={styles.earningDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.earningAmount}>+${item.amount.toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  ratingCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ratingValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptySection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  earningRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  earningGame: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  earningDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  earningAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.success,
  },
});
