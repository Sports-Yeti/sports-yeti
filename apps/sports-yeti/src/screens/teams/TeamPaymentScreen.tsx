import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface TeamPaymentScreenProps {
  route: {
    params: {
      teamId: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

interface PaymentMember {
  id: string;
  player_id: string;
  name: string;
  avatar_url: string | null;
  payment_status: string;
  role: string;
}

interface PaymentSummary {
  team_id: string;
  team_name: string;
  league_name: string;
  total_fee: number;
  per_player_share: number;
  roster_count: number;
  paid_count: number;
  pending_count: number;
  is_complete: boolean;
  members: PaymentMember[];
}

export function TeamPaymentScreen({ route }: TeamPaymentScreenProps) {
  const { teamId } = route.params;
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      const data = await api.getTeamPaymentSummary(teamId);
      setSummary(data);
    } catch {
      Alert.alert('Error', 'Failed to load payment summary');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadSummary();
  }, [loadSummary]);

  const handlePayMyShare = async () => {
    setIsPaying(true);
    try {
      const result = await api.createTeamPaymentIntent(teamId);
      Alert.alert(
        'Payment Created',
        `Amount: $${(Number(result.amount) / 100).toFixed(2)}\n` +
          `Currency: ${(result.currency ?? 'usd').toUpperCase()}\n\n` +
          'In production, this would open the Stripe PaymentSheet.',
        [{ text: 'OK', onPress: () => loadSummary() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to create payment. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Payment summary not available</Text>
      </View>
    );
  }

  const totalFee = Number(summary.total_fee);
  const perShare = Number(summary.per_player_share);
  const currentPlayer = user?.player;
  const myMembership = currentPlayer
    ? summary.members.find((m) => m.player_id === currentPlayer.id)
    : null;
  const isUnpaid = myMembership ? myMembership.payment_status !== 'paid' : true;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.teamHeader}>
        <View style={styles.teamAvatar}>
          <Text style={styles.teamAvatarText}>
            {summary.team_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.teamName}>{summary.team_name}</Text>
        <Text style={styles.leagueName}>{summary.league_name}</Text>
        {summary.is_complete && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeBadgeText}>✓ Fully Paid</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fee Breakdown</Text>
        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Total Team Fee</Text>
            <Text style={styles.feeValue}>${totalFee.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Roster Size</Text>
            <Text style={styles.feeValue}>{summary.roster_count}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.feeRow}>
            <Text style={styles.feeLabelBold}>Per Player Share</Text>
            <Text style={styles.feeValueBold}>${perShare.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.paid_count}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              {summary.pending_count}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Team Members ({summary.members.length})
        </Text>
        {summary.members.map((member) => {
          const isPaid = member.payment_status === 'paid';
          return (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.name?.charAt(0).toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                {member.role !== 'member' && (
                  <Text style={styles.memberRole}>{member.role}</Text>
                )}
              </View>
              <View
                style={[
                  styles.paymentBadge,
                  isPaid ? styles.paidBadge : styles.pendingBadge,
                ]}
              >
                <Text
                  style={[
                    styles.paymentBadgeText,
                    isPaid ? styles.paidBadgeText : styles.pendingBadgeText,
                  ]}
                >
                  {isPaid ? 'Paid' : 'Pending'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {isUnpaid && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.payButton, isPaying && styles.payButtonDisabled]}
            onPress={handlePayMyShare}
            disabled={isPaying}
          >
            {isPaying ? (
              <ActivityIndicator size="small" color={COLORS.surface} />
            ) : (
              <Text style={styles.payButtonText}>
                Pay My Share — ${perShare.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomPadding} />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  teamHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teamAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamAvatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  teamName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  leagueName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  completeBadge: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  completeBadgeText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  feeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  feeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  feeValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  feeLabelBold: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  feeValueBold: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.success,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  memberRole: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  paymentBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  paidBadge: {
    backgroundColor: COLORS.success + '20',
  },
  pendingBadge: {
    backgroundColor: COLORS.warning + '20',
  },
  paymentBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  paidBadgeText: {
    color: COLORS.success,
  },
  pendingBadgeText: {
    color: COLORS.warning,
  },
  payButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
