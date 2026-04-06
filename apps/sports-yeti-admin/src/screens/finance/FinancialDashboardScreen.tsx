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
import type { Payment } from '../../types';

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

export function FinancialDashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: dashStats, isLoading: isLoadingDash, refetch: refetchDash } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => api.getAnalyticsDashboard(),
  });

  const { data: revenueData, isLoading: isLoadingRevenue, refetch: refetchRevenue } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: () => api.getRevenueAnalytics(),
  });

  const { data: paymentsData, isLoading: isLoadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['payments', { per_page: 10 }],
    queryFn: () => api.getPayments({ per_page: 10 }),
  });

  const payments = paymentsData?.data ?? [];
  const leagueRevenue = revenueData?.leagues ?? [];

  const isLoading = isLoadingDash || isLoadingRevenue || isLoadingPayments;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDash(), refetchRevenue(), refetchPayments()]);
    setRefreshing(false);
  }, [refetchDash, refetchRevenue, refetchPayments]);

  const totalRevenue = leagueRevenue.reduce((sum, l) => sum + l.revenue, 0);
  const outstandingPayments = payments.filter((p: Payment) => p.status === 'pending' || p.status === 'processing');
  const outstandingBalance = outstandingPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
  const refunds = payments.filter((p: Payment) => p.status === 'refunded' || p.status === 'partially_refunded');
  const refundTotal = refunds.reduce((sum: number, p: Payment) => sum + (p.refund_amount ?? 0), 0);

  const statusColors: Record<string, string> = {
    completed: COLORS.success,
    pending: COLORS.warning,
    processing: COLORS.primary,
    failed: COLORS.error,
    refunded: COLORS.textMuted,
    partially_refunded: COLORS.textMuted,
  };

  if (isLoading && !refreshing) {
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
          <Text style={styles.title}>Finance</Text>
          <Text style={styles.subtitle}>Revenue and payment overview</Text>
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={() => alert('Export coming soon')}>
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon="💰"
          color={COLORS.success}
        />
        <SummaryCard
          title="Outstanding"
          value={`$${outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon="⏳"
          color={COLORS.warning}
        />
        <SummaryCard
          title="This Month"
          value={`$${(dashStats?.revenue_this_month ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon="📈"
          color={COLORS.primary}
        />
        <SummaryCard
          title="Refunds"
          value={`$${refundTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon="↩️"
          color={COLORS.error}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue by League</Text>
        {leagueRevenue.length === 0 ? (
          <Text style={styles.emptyText}>No revenue data available</Text>
        ) : (
          <View style={styles.leagueList}>
            {leagueRevenue.map((item) => {
              const pct = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
              return (
                <View key={item.league_id} style={styles.leagueRow}>
                  <View style={styles.leagueInfo}>
                    <Text style={styles.leagueName}>{item.league_name}</Text>
                    <Text style={styles.leagueAmount}>
                      ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.leagueBarTrack}>
                    <View style={[styles.leagueBarFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {payments.length === 0 ? (
          <Text style={styles.emptyText}>No recent transactions</Text>
        ) : (
          payments.map((payment: Payment) => {
            const pStatusColor = statusColors[payment.status] || COLORS.textMuted;
            return (
              <View key={payment.id} style={styles.transactionRow}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionUser}>{payment.user?.name ?? 'Unknown'}</Text>
                  <Text style={styles.transactionType}>{payment.type.replace(/_/g, ' ')}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>
                    ${Number(payment.amount).toFixed(2)}
                  </Text>
                  <View style={[styles.transactionStatus, { backgroundColor: pStatusColor + '20' }]}>
                    <Text style={[styles.transactionStatusText, { color: pStatusColor }]}>
                      {payment.status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
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
  exportButton: {
    backgroundColor: COLORS.surface, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  exportButtonText: { color: COLORS.text, fontSize: FONT_SIZES.md, fontWeight: '600' },
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
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SPACING.xl },
  leagueList: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  leagueRow: { marginBottom: SPACING.md },
  leagueInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  leagueName: { fontSize: FONT_SIZES.md, fontWeight: '500', color: COLORS.text },
  leagueAmount: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  leagueBarTrack: {
    height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden',
  },
  leagueBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  transactionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 8, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  transactionInfo: { flex: 1 },
  transactionUser: { fontSize: FONT_SIZES.md, fontWeight: '500', color: COLORS.text },
  transactionType: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  transactionStatus: { paddingVertical: 2, paddingHorizontal: SPACING.sm, borderRadius: 4 },
  transactionStatusText: { fontSize: FONT_SIZES.xs, fontWeight: '600', textTransform: 'capitalize' },
});
