import React, { useState, useCallback } from 'react';
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

export function AnalyticsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: dashStats, isLoading: isLoadingDash, refetch: refetchDash } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => api.getAnalyticsDashboard(),
  });

  const { data: registrationData, isLoading: isLoadingReg, refetch: refetchReg } = useQuery({
    queryKey: ['analytics-registrations'],
    queryFn: () => api.getRegistrationAnalytics(),
  });

  const { data: facilityData, isLoading: isLoadingFacility, refetch: refetchFacility } = useQuery({
    queryKey: ['analytics-facility-utilization'],
    queryFn: () => api.getFacilityUtilization(),
  });

  const { data: revenueData, isLoading: isLoadingRevenue, refetch: refetchRevenue } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: () => api.getRevenueAnalytics(),
  });

  const isLoading = isLoadingDash && isLoadingReg && isLoadingFacility && isLoadingRevenue && !refreshing;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDash(), refetchReg(), refetchFacility(), refetchRevenue()]);
    setRefreshing(false);
  }, [refetchDash, refetchReg, refetchFacility, refetchRevenue]);

  const registrations = registrationData?.leagues ?? [];
  const facilities = facilityData?.facilities ?? [];
  const leagueRevenue = revenueData?.leagues ?? [];

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
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Organization-wide metrics and insights</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard
          title="Total Players"
          value={String(dashStats?.total_players ?? 0)}
          icon="🏃"
          color={COLORS.primary}
        />
        <SummaryCard
          title="Total Teams"
          value={String(dashStats?.total_teams ?? 0)}
          icon="👥"
          color={COLORS.success}
        />
        <SummaryCard
          title="Total Revenue"
          value={`$${Number(dashStats?.total_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon="💰"
          color={COLORS.warning}
        />
        <SummaryCard
          title="Active Leagues"
          value={String(dashStats?.active_leagues ?? 0)}
          icon="🏆"
          color={COLORS.secondary}
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Registration Trends</Text>
        <View style={styles.sectionCard}>
          {isLoadingReg ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : registrations.length === 0 ? (
            <Text style={styles.emptyText}>No registration data available</Text>
          ) : (
            registrations.map((item) => {
              const maxReg = Math.max(...registrations.map((r) => r.registrations), 1);
              const pct = (item.registrations / maxReg) * 100;
              return (
                <View key={item.league_id} style={styles.dataRow}>
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataName}>{item.league_name}</Text>
                    <Text style={styles.dataValue}>{item.registrations} registrations</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: COLORS.primary }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Facility Utilization</Text>
        <View style={styles.sectionCard}>
          {isLoadingFacility ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : facilities.length === 0 ? (
            <Text style={styles.emptyText}>No facility data available</Text>
          ) : (
            facilities.map((item) => {
              const utilizationColor =
                item.utilization_percent >= 80 ? COLORS.success :
                item.utilization_percent >= 50 ? COLORS.warning : COLORS.error;
              return (
                <View key={item.facility_id} style={styles.dataRow}>
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataName}>{item.facility_name}</Text>
                    <Text style={styles.dataValue}>
                      {item.total_bookings} bookings · {item.utilization_percent}%
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[styles.barFill, { width: `${item.utilization_percent}%`, backgroundColor: utilizationColor }]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Revenue by League</Text>
        <View style={styles.sectionCard}>
          {isLoadingRevenue ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : leagueRevenue.length === 0 ? (
            <Text style={styles.emptyText}>No revenue data available</Text>
          ) : (
            leagueRevenue.map((item) => {
              const maxRevenue = Math.max(...leagueRevenue.map((r) => r.revenue), 1);
              const pct = (item.revenue / maxRevenue) * 100;
              return (
                <View key={item.league_id} style={styles.dataRow}>
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataName}>{item.league_name}</Text>
                    <Text style={styles.dataValue}>
                      ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: COLORS.success }]} />
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.lg, paddingBottom: SPACING.md,
  },
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
  dataRow: { marginBottom: SPACING.md },
  dataInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  dataName: { fontSize: FONT_SIZES.md, fontWeight: '500', color: COLORS.text },
  dataValue: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  barTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  bottomPadding: { height: SPACING.xxl },
});
