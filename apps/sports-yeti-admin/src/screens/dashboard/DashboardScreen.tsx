import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onPress?: () => void;
}

function StatCard({ title, value, icon, color, onPress }: StatCardProps) {
  const content = (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.statCardWrapper}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.statCardWrapper}>{content}</View>;
}

interface QuickActionProps {
  icon: string;
  title: string;
  onPress: () => void;
}

function QuickAction({ icon, title, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();

  // Fetch dashboard stats from API
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.getDashboardStats(),
    staleTime: 60000, // 1 minute
  });

  // Also fetch recent counts for fallback
  const { data: leaguesData } = useQuery({
    queryKey: ['leagues', { per_page: 1 }],
    queryFn: () => api.getLeagues({ per_page: 1 }),
    staleTime: 60000,
  });

  const { data: teamsData } = useQuery({
    queryKey: ['teams', { per_page: 1 }],
    queryFn: () => api.getTeams({ per_page: 1 }),
    staleTime: 60000,
  });

  const { data: playersData } = useQuery({
    queryKey: ['players', { per_page: 1 }],
    queryFn: () => api.getPlayers({ per_page: 1 }),
    staleTime: 60000,
  });

  const { data: pendingTeamsData } = useQuery({
    queryKey: ['teams', { status: 'pending', per_page: 1 }],
    queryFn: () => api.getTeams({ status: 'pending', per_page: 1 }),
    staleTime: 60000,
  });

  const { data: pendingBookingsData } = useQuery({
    queryKey: ['bookings', { status: 'pending', per_page: 1 }],
    queryFn: () => api.getBookings({ status: 'pending', per_page: 1 }),
    staleTime: 60000,
  });

  const { data: facilitiesSummary } = useQuery({
    queryKey: ['facilities', { per_page: 100 }],
    queryFn: () => api.getFacilities({ per_page: 100 }),
    staleTime: 60000,
  });

  const { data: waiversSummary } = useQuery({
    queryKey: ['waivers', { per_page: 100 }],
    queryFn: () => api.getWaivers({ per_page: 100 }),
    staleTime: 60000,
  });

  // Use API stats if available, fall back to pagination meta
  const totalLeagues = stats?.total_leagues ?? leaguesData?.meta?.total ?? 0;
  const totalTeams = stats?.total_teams ?? teamsData?.meta?.total ?? 0;
  const totalPlayers = stats?.total_players ?? playersData?.meta?.total ?? 0;
  const totalGames = stats?.total_games ?? 0;
  const totalRevenue = stats?.total_revenue ?? 0;
  const upcomingGames = stats?.upcoming_games ?? 0;
  const pendingTeams = pendingTeamsData?.meta?.total ?? 0;
  const pendingBookings = pendingBookingsData?.meta?.total ?? 0;
  const totalSpaces =
    facilitiesSummary?.data.reduce(
      (acc, facility) => acc + Number(facility.spaces_count ?? 0),
      0
    ) ?? 0;

  const waivers = waiversSummary?.data ?? [];
  const waiverSignedSum = waivers.reduce(
    (acc, w) => acc + Number(w.signatures_count ?? 0),
    0
  );
  const waiverCompletionRate =
    waivers.length > 0
      ? Math.round((waiverSignedSum / Math.max(waivers.length * Math.max(totalPlayers, 1), 1)) * 100)
      : 0;

  const formatCurrency = (amount: number): string => {
    const num = Number(amount) || 0;
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}k`;
    }
    return `$${num.toFixed(0)}`;
  };

  const dashboardStats = [
    {
      title: 'Total Leagues',
      value: isLoading ? '...' : totalLeagues,
      icon: '🏆',
      color: COLORS.primary,
      onPress: () => navigation.navigate('Leagues'),
    },
    {
      title: 'Active Teams',
      value: isLoading ? '...' : totalTeams,
      icon: '👥',
      color: COLORS.success,
      onPress: () => navigation.navigate('Teams'),
    },
    {
      title: 'Players',
      value: isLoading ? '...' : totalPlayers,
      icon: '🏃',
      color: COLORS.secondary,
      onPress: () => navigation.navigate('Players'),
    },
    {
      title: 'Total Games',
      value: isLoading ? '...' : totalGames,
      icon: '🎮',
      color: COLORS.warning,
      onPress: () => navigation.navigate('Schedule'),
    },
    {
      title: 'Revenue',
      value: isLoading ? '...' : formatCurrency(Number(totalRevenue)),
      icon: '💰',
      color: COLORS.accent,
      onPress: () => navigation.navigate('Finance'),
    },
    {
      title: 'Upcoming Games',
      value: isLoading ? '...' : upcomingGames,
      icon: '📅',
      color: COLORS.error,
    },
  ];

  const operationsWidgets = [
    {
      title: 'Pending Team Applications',
      value: pendingTeams,
      icon: '🛡️',
      color: COLORS.warning,
      onPress: () => navigation.navigate('Teams'),
    },
    {
      title: 'Open Facility Slots',
      value: totalSpaces,
      icon: '🏟️',
      color: COLORS.primary,
      onPress: () => navigation.navigate('Facilities'),
    },
    {
      title: 'Pending Bookings',
      value: pendingBookings,
      icon: '📆',
      color: COLORS.accent,
      onPress: () => navigation.navigate('Bookings'),
    },
    {
      title: 'Waiver Completion Rate',
      value: `${waiverCompletionRate}%`,
      icon: '📝',
      color: COLORS.success,
      onPress: () => navigation.navigate('Waivers'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to Sports Yeti Admin</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            Unable to load some stats. Showing available data.
          </Text>
        </View>
      ) : null}

      <View style={styles.statsGrid}>
        {dashboardStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            onPress={stat.onPress}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Operations</Text>
        <View style={styles.statsGrid}>
          {operationsWidgets.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              onPress={stat.onPress}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="➕"
            title="Create League"
            onPress={() => navigation.navigate('LeagueForm', {})}
          />
          <QuickAction
            icon="👥"
            title="View Teams"
            onPress={() => navigation.navigate('Teams')}
          />
          <QuickAction
            icon="🏟️"
            title="Facilities"
            onPress={() => navigation.navigate('Facilities')}
          />
          <QuickAction
            icon="📋"
            title="Audit Logs"
            onPress={() => navigation.navigate('AuditLogs')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => navigation.navigate('Leagues')}
          >
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>
              {totalLeagues} leagues active across the platform
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => navigation.navigate('Teams')}
          >
            <View style={[styles.activityDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.activityText}>
              {totalTeams} teams registered and competing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => navigation.navigate('Players')}
          >
            <View style={[styles.activityDot, { backgroundColor: COLORS.secondary }]} />
            <Text style={styles.activityText}>
              {totalPlayers} players in the system
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
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
  errorBanner: {
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCardWrapper: {
    minWidth: 200,
    flex: 1,
    maxWidth: '31%',
    margin: SPACING.sm,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statIcon: {
    fontSize: 24,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    margin: SPACING.sm,
    alignItems: 'center',
    minWidth: 140,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activityList: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.md,
  },
  activityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
