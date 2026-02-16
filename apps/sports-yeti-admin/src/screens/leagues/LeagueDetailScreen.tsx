import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Team, Player } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'LeagueDetail'>;

type TabId = 'overview' | 'teams' | 'players';

interface TabButtonProps {
  id: TabId;
  label: string;
  count?: number;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ label, count, isActive, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {label}
        {count !== undefined && (
          <Text style={styles.tabCount}> ({count})</Text>
        )}
      </Text>
    </TouchableOpacity>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
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
}

interface TeamRowProps {
  team: Team;
  onPress: () => void;
}

function TeamRow({ team, onPress }: TeamRowProps) {
  const statusColors: Record<string, string> = {
    approved: COLORS.success,
    pending: COLORS.warning,
    rejected: COLORS.error,
    inactive: COLORS.textMuted,
  };

  return (
    <TouchableOpacity style={styles.listRow} onPress={onPress}>
      <View style={styles.listRowLeft}>
        <View style={styles.teamAvatar}>
          <Text style={styles.teamAvatarText}>
            {team.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.listRowTitle}>{team.name}</Text>
          <Text style={styles.listRowSubtitle}>
            {team.players_count ?? 0} players
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: (statusColors[team.status] || COLORS.textMuted) + '20' },
        ]}
      >
        <Text
          style={[
            styles.statusBadgeText,
            { color: statusColors[team.status] || COLORS.textMuted },
          ]}
        >
          {team.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface PlayerRowProps {
  player: Player;
  onPress: () => void;
}

function PlayerRow({ player, onPress }: PlayerRowProps) {
  const experienceColors: Record<string, string> = {
    beginner: COLORS.success,
    intermediate: COLORS.primary,
    advanced: COLORS.warning,
    pro: COLORS.error,
  };

  return (
    <TouchableOpacity style={styles.listRow} onPress={onPress}>
      <View style={styles.listRowLeft}>
        <View style={styles.playerAvatar}>
          <Text style={styles.playerAvatarText}>
            {player.user?.name?.charAt(0).toUpperCase() ?? 'P'}
          </Text>
        </View>
        <View>
          <Text style={styles.listRowTitle}>{player.user?.name ?? 'Unknown'}</Text>
          <Text style={styles.listRowSubtitle}>
            {player.position ?? 'No position'} • {player.experience_level}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.experienceBadge,
          { backgroundColor: (experienceColors[player.experience_level] || COLORS.textMuted) + '20' },
        ]}
      >
        <Text
          style={[
            styles.experienceBadgeText,
            { color: experienceColors[player.experience_level] || COLORS.textMuted },
          ]}
        >
          {player.experience_level}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function LeagueDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { id } = route.params;
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: league, isLoading, error } = useQuery({
    queryKey: ['league', id],
    queryFn: () => api.getLeague(id),
  });

  const { data: teamsData } = useQuery({
    queryKey: ['teams', { league_id: id }],
    queryFn: () => api.getTeams({ league_id: id, per_page: 50 }),
    enabled: !!id,
  });

  const { data: playersData } = useQuery({
    queryKey: ['players', { league_id: id }],
    queryFn: () => api.getPlayers({ league_id: id, per_page: 50 }),
    enabled: !!id,
  });

  const teams = teamsData?.data ?? [];
  const players = playersData?.data ?? [];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    navigation.navigate('LeagueForm', { id });
  };

  const handleTeamPress = (team: Team) => {
    navigation.navigate('TeamDetail', { id: team.id });
  };

  const handlePlayerPress = (player: Player) => {
    navigation.navigate('PlayerDetail', { id: player.id });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !league) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load league</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backLink} onPress={handleBack}>
            <Text style={styles.backLinkText}>← Leagues</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{league.name}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{league.sport_type}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: league.is_active
                    ? COLORS.success + '20'
                    : COLORS.error + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: league.is_active ? COLORS.success : COLORS.error },
                ]}
              >
                {league.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
            {league.location && (
              <Text style={styles.locationText}>📍 {league.location}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit League</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          id="overview"
          label="Overview"
          isActive={activeTab === 'overview'}
          onPress={() => setActiveTab('overview')}
        />
        <TabButton
          id="teams"
          label="Teams"
          count={teams.length}
          isActive={activeTab === 'teams'}
          onPress={() => setActiveTab('teams')}
        />
        <TabButton
          id="players"
          label="Players"
          count={players.length}
          isActive={activeTab === 'players'}
          onPress={() => setActiveTab('players')}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Teams"
                value={league.teams_count ?? teams.length}
                icon="👥"
                color={COLORS.primary}
              />
              <StatCard
                title="Total Players"
                value={league.players_count ?? players.length}
                icon="🏃"
                color={COLORS.success}
              />
              <StatCard
                title="Registration Fee"
                value={`$${league.registration_fee?.toFixed(2) ?? '0.00'}`}
                icon="💰"
                color={COLORS.warning}
              />
              <StatCard
                title="Timezone"
                value={league.timezone || 'UTC'}
                icon="🌍"
                color={COLORS.secondary}
              />
            </View>

            {/* Description */}
            {league.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.descriptionCard}>
                  <Text style={styles.descriptionText}>{league.description}</Text>
                </View>
              </View>
            )}

            {/* League Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>League Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created</Text>
                  <Text style={styles.infoValue}>
                    {new Date(league.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Admin</Text>
                  <Text style={styles.infoValue}>
                    {league.admin?.name ?? 'Unknown'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Sport Type</Text>
                  <Text style={styles.infoValue}>{league.sport_type}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{league.location ?? 'Not set'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'teams' && (
          <View style={styles.listContainer}>
            {teams.length === 0 ? (
              <View style={styles.emptyTabContainer}>
                <Text style={styles.emptyTabIcon}>👥</Text>
                <Text style={styles.emptyTabTitle}>No teams yet</Text>
                <Text style={styles.emptyTabText}>
                  Teams that join this league will appear here
                </Text>
              </View>
            ) : (
              teams.map((team) => (
                <TeamRow
                  key={team.id}
                  team={team}
                  onPress={() => handleTeamPress(team)}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'players' && (
          <View style={styles.listContainer}>
            {players.length === 0 ? (
              <View style={styles.emptyTabContainer}>
                <Text style={styles.emptyTabIcon}>🏃</Text>
                <Text style={styles.emptyTabTitle}>No players yet</Text>
                <Text style={styles.emptyTabText}>
                  Players that join this league will appear here
                </Text>
              </View>
            ) : (
              players.map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  onPress={() => handlePlayerPress(player)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
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
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
  },
  backLink: {
    marginBottom: SPACING.sm,
  },
  backLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  sportBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  sportBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  editButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabCount: {
    color: COLORS.textMuted,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    margin: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    flex: 1,
    maxWidth: '48%',
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
  descriptionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  listContainer: {
    gap: SPACING.sm,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
  },
  listRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  teamAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  playerAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  listRowTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  listRowSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  experienceBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  experienceBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyTabContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTabIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTabTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptyTabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
