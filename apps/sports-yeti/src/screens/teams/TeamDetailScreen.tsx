import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  FlatList,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, EXPERIENCE_LEVELS } from '../../constants';
import type { Team, Player } from '../../types';

interface TeamDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

const TEAM_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Approval',
  approved: 'Active',
  rejected: 'Rejected',
  inactive: 'Inactive',
};

const TEAM_STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning,
  approved: COLORS.success,
  rejected: COLORS.error,
  inactive: COLORS.textSecondary,
};

export function TeamDetailScreen({ route, navigation }: TeamDetailScreenProps) {
  const { id } = route.params;
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeam = async () => {
    try {
      setError(null);
      const data = await api.getTeam(id);
      setTeam(data);
    } catch (err) {
      console.error('Failed to load team:', err);
      setError('Failed to load team details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [id]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadTeam();
  };

  const handleOpenChat = () => {
    navigation.navigate('Chat', { chatId: `team-${id}`, title: `${team?.name || 'Team'} Chat` });
  };

  const getTeamStats = () => {
    if (!team?.stats) {
      return { wins: 0, losses: 0, ties: 0, points: 0 };
    }
    const stats = team.stats as Record<string, number>;
    return {
      wins: stats.wins || 0,
      losses: stats.losses || 0,
      ties: stats.ties || 0,
      points: stats.points || 0,
    };
  };

  const getWinPercentage = () => {
    const stats = getTeamStats();
    const totalGames = stats.wins + stats.losses + stats.ties;
    if (totalGames === 0) return 0;
    return ((stats.wins / totalGames) * 100).toFixed(1);
  };

  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerAvatar}>
        {item.user?.avatar_url ? (
          <Image
            source={{ uri: item.user.avatar_url }}
            style={styles.playerAvatarImage}
          />
        ) : (
          <Text style={styles.playerAvatarText}>
            {item.user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        )}
        {team?.captain_id === item.id && (
          <View style={styles.captainBadge}>
            <Text style={styles.captainBadgeText}>C</Text>
          </View>
        )}
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.user?.name || 'Unknown Player'}</Text>
        <View style={styles.playerDetails}>
          {item.position && (
            <Text style={styles.playerPosition}>{item.position}</Text>
          )}
          <Text style={styles.playerLevel}>
            {EXPERIENCE_LEVELS[item.experience_level as keyof typeof EXPERIENCE_LEVELS] ||
              item.experience_level}
          </Text>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.errorEmoji}>😞</Text>
        <Text style={styles.errorText}>{error || 'Team not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTeam}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = getTeamStats();
  const statusColor = TEAM_STATUS_COLORS[team.status] || COLORS.textSecondary;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Team Header */}
      <View style={styles.header}>
        <View style={styles.teamLogoContainer}>
          {team.logo_url ? (
            <Image
              source={{ uri: team.logo_url }}
              style={styles.teamLogo}
            />
          ) : (
            <View style={styles.teamLogoPlaceholder}>
              <Text style={styles.teamLogoText}>
                {team.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.teamName}>{team.name}</Text>
        {team.league && (
          <Text style={styles.leagueName}>{team.league.name}</Text>
        )}
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {TEAM_STATUS_LABELS[team.status] || team.status}
          </Text>
        </View>
      </View>

      {/* Description */}
      {team.description && (
        <View style={styles.section}>
          <Text style={styles.description}>{team.description}</Text>
        </View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.losses}</Text>
            <Text style={styles.statLabel}>Losses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.ties}</Text>
            <Text style={styles.statLabel}>Ties</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getWinPercentage()}%</Text>
            <Text style={styles.statLabel}>Win %</Text>
          </View>
        </View>
      </View>

      {/* Record Summary */}
      <View style={styles.section}>
        <View style={styles.recordCard}>
          <View style={styles.recordRow}>
            <Text style={styles.recordLabel}>Season Record</Text>
            <Text style={styles.recordValue}>
              {stats.wins}-{stats.losses}-{stats.ties}
            </Text>
          </View>
          <View style={styles.recordDivider} />
          <View style={styles.recordRow}>
            <Text style={styles.recordLabel}>Total Points</Text>
            <Text style={styles.recordValue}>{stats.points}</Text>
          </View>
          <View style={styles.recordDivider} />
          <View style={styles.recordRow}>
            <Text style={styles.recordLabel}>Roster Size</Text>
            <Text style={styles.recordValue}>
              {team.players?.length || team.players_count || 0} / {team.max_roster_size}
            </Text>
          </View>
        </View>
      </View>

      {/* Roster Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Roster ({team.players?.length || team.players_count || 0})
          </Text>
        </View>

        {team.players && team.players.length > 0 ? (
          <View style={styles.rosterList}>
            {team.players.map((player) => (
              <View key={player.id}>
                {renderPlayer({ item: player })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyRoster}>
            <Text style={styles.emptyRosterIcon}>👥</Text>
            <Text style={styles.emptyRosterText}>No players on roster</Text>
          </View>
        )}
      </View>

      {/* Captain Info */}
      {team.captain && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Captain</Text>
          <View style={styles.captainCard}>
            <View style={styles.captainAvatar}>
              {team.captain.user?.avatar_url ? (
                <Image
                  source={{ uri: team.captain.user.avatar_url }}
                  style={styles.captainAvatarImage}
                />
              ) : (
                <Text style={styles.captainAvatarText}>
                  {team.captain.user?.name?.charAt(0).toUpperCase() || 'C'}
                </Text>
              )}
            </View>
            <View style={styles.captainInfo}>
              <Text style={styles.captainName}>
                {team.captain.user?.name || 'Unknown'}
              </Text>
              <Text style={styles.captainRole}>Captain</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
          <Text style={styles.chatButtonIcon}>💬</Text>
          <Text style={styles.chatButtonText}>Team Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => navigation.navigate('TeamPayment', { teamId: team.id })}
        >
          <Text style={styles.paymentButtonIcon}>💳</Text>
          <Text style={styles.paymentButtonText}>View Team Payment</Text>
        </TouchableOpacity>
      </View>

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
    padding: SPACING.lg,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  teamLogoContainer: {
    marginBottom: SPACING.md,
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  teamLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  teamLogoText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  teamName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  leagueName: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    gap: SPACING.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
  },
  statsSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  recordCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  recordLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  recordValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  recordDivider: {
    height: 1,
    backgroundColor: COLORS.background,
  },
  rosterList: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  playerAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  playerAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  captainBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  captainBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  playerDetails: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  playerPosition: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  playerLevel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyRoster: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyRosterIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyRosterText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  captainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  captainAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  captainAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  captainAvatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.primary,
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
  captainRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
  },
  actionsSection: {
    padding: SPACING.md,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  chatButtonIcon: {
    fontSize: 20,
  },
  chatButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  paymentButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  paymentButtonIcon: {
    fontSize: 20,
  },
  paymentButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});
