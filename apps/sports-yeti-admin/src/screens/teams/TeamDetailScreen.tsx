import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Player } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'TeamDetail'>;

type TabId = 'overview' | 'roster';

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

interface PlayerRowProps {
  player: Player;
  isCaptain: boolean;
  onPress: () => void;
  onRemove: () => void;
}

function PlayerRow({ player, isCaptain, onPress, onRemove }: PlayerRowProps) {
  const experienceColors: Record<string, string> = {
    beginner: COLORS.success,
    intermediate: COLORS.primary,
    advanced: COLORS.warning,
    pro: COLORS.error,
  };

  return (
    <TouchableOpacity style={styles.playerRow} onPress={onPress}>
      <View style={styles.playerRowLeft}>
        <View style={styles.playerAvatar}>
          <Text style={styles.playerAvatarText}>
            {player.user?.name?.charAt(0).toUpperCase() ?? 'P'}
          </Text>
        </View>
        <View style={styles.playerInfo}>
          <View style={styles.playerNameRow}>
            <Text style={styles.playerName}>{player.user?.name ?? 'Unknown'}</Text>
            {isCaptain && (
              <View style={styles.captainBadge}>
                <Text style={styles.captainBadgeText}>Captain</Text>
              </View>
            )}
          </View>
          <Text style={styles.playerMeta}>
            {player.position ?? 'No position'} • {player.experience_level}
          </Text>
        </View>
      </View>
      <View style={styles.playerRowRight}>
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
        {!isCaptain && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function TeamDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const queryClient = useQueryClient();
  const { id } = route.params;
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', id],
    queryFn: () => api.getTeam(id),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (playerId: string) =>
      // Using the deleteTeam endpoint pattern for member removal
      fetch(`/api/v1/teams/${id}/members/${playerId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
  });

  const players = team?.players ?? [];
  const captainId = team?.captain_id;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLeaguePress = () => {
    if (team?.league_id) {
      navigation.navigate('LeagueDetail', { id: team.league_id });
    }
  };

  const handlePlayerPress = (player: Player) => {
    navigation.navigate('PlayerDetail', { id: player.id });
  };

  const handleRemovePlayer = async (player: Player) => {
    if (confirm(`Remove ${player.user?.name ?? 'this player'} from the team?`)) {
      await removeMemberMutation.mutateAsync(player.id);
    }
  };

  const statusColors: Record<string, string> = {
    approved: COLORS.success,
    pending: COLORS.warning,
    rejected: COLORS.error,
    inactive: COLORS.textMuted,
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load team</Text>
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
            <Text style={styles.backLinkText}>← Teams</Text>
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <View style={styles.teamAvatarLarge}>
              <Text style={styles.teamAvatarLargeText}>
                {team.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.title}>{team.name}</Text>
              <View style={styles.headerMeta}>
                <TouchableOpacity onPress={handleLeaguePress}>
                  <Text style={styles.leagueLink}>
                    🏆 {team.league?.name ?? 'No League'}
                  </Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        (statusColors[team.status] || COLORS.textMuted) + '20',
                    },
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
              </View>
            </View>
          </View>
        </View>
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
          id="roster"
          label="Roster"
          count={players.length}
          isActive={activeTab === 'roster'}
          onPress={() => setActiveTab('roster')}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Roster Size"
                value={`${players.length}/${team.max_roster_size}`}
                icon="👥"
                color={COLORS.primary}
              />
              <StatCard
                title="Status"
                value={team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                icon="📊"
                color={statusColors[team.status] || COLORS.textMuted}
              />
              <StatCard
                title="Max Roster"
                value={team.max_roster_size}
                icon="📋"
                color={COLORS.secondary}
              />
              <StatCard
                title="League"
                value={team.league?.name?.split(' ')[0] ?? 'None'}
                icon="🏆"
                color={COLORS.warning}
              />
            </View>

            {/* Description */}
            {team.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.descriptionCard}>
                  <Text style={styles.descriptionText}>{team.description}</Text>
                </View>
              </View>
            )}

            {/* Team Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Team Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Captain</Text>
                  <Text style={styles.infoValue}>
                    {team.captain?.user?.name ?? 'Unknown'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>League</Text>
                  <TouchableOpacity onPress={handleLeaguePress}>
                    <Text style={[styles.infoValue, styles.infoLink]}>
                      {team.league?.name ?? 'No League'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={styles.infoValue}>{team.status}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Roster Capacity</Text>
                  <Text style={styles.infoValue}>
                    {players.length} / {team.max_roster_size}
                  </Text>
                </View>
              </View>
            </View>

            {/* Captain Card */}
            {team.captain && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Team Captain</Text>
                <TouchableOpacity
                  style={styles.captainCard}
                  onPress={() => handlePlayerPress(team.captain!)}
                >
                  <View style={styles.captainAvatar}>
                    <Text style={styles.captainAvatarText}>
                      {team.captain.user?.name?.charAt(0).toUpperCase() ?? 'C'}
                    </Text>
                  </View>
                  <View style={styles.captainInfo}>
                    <Text style={styles.captainName}>
                      {team.captain.user?.name ?? 'Unknown'}
                    </Text>
                    <Text style={styles.captainMeta}>
                      {team.captain.position ?? 'No position'} •{' '}
                      {team.captain.experience_level}
                    </Text>
                  </View>
                  <Text style={styles.captainArrow}>→</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'roster' && (
          <View style={styles.rosterContainer}>
            <View style={styles.rosterHeader}>
              <Text style={styles.rosterTitle}>
                Team Roster ({players.length}/{team.max_roster_size})
              </Text>
            </View>

            {players.length === 0 ? (
              <View style={styles.emptyTabContainer}>
                <Text style={styles.emptyTabIcon}>👥</Text>
                <Text style={styles.emptyTabTitle}>No players yet</Text>
                <Text style={styles.emptyTabText}>
                  Players who join this team will appear here
                </Text>
              </View>
            ) : (
              <View style={styles.playerList}>
                {players.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    isCaptain={player.id === captainId}
                    onPress={() => handlePlayerPress(player)}
                    onRemove={() => handleRemovePlayer(player)}
                  />
                ))}
              </View>
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
    marginBottom: SPACING.md,
  },
  backLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  teamAvatarLargeText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  leagueLink: {
    fontSize: FONT_SIZES.sm,
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
  infoLink: {
    color: COLORS.primary,
  },
  captainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.warning + '40',
  },
  captainAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  captainAvatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  captainInfo: {
    flex: 1,
  },
  captainName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  captainMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  captainArrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
  rosterContainer: {
    flex: 1,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rosterTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  playerList: {
    gap: SPACING.sm,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
  },
  playerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  captainBadge: {
    backgroundColor: COLORS.warning + '30',
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs,
    borderRadius: 4,
  },
  captainBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontWeight: '600',
  },
  playerMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  playerRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
  removeButton: {
    backgroundColor: COLORS.error + '15',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: '600',
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
