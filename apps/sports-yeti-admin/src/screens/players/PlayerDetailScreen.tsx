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
import type { Team } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'PlayerDetail'>;

type TabId = 'overview' | 'teams';

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

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
  isLast?: boolean;
}

function InfoRow({ label, value, isLast }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? 'Not set'}</Text>
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
    <TouchableOpacity style={styles.teamRow} onPress={onPress}>
      <View style={styles.teamRowLeft}>
        <View style={styles.teamAvatar}>
          <Text style={styles.teamAvatarText}>
            {team.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamLeague}>{team.league?.name ?? 'No League'}</Text>
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

export function PlayerDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { id } = route.params;
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: player, isLoading, error } = useQuery({
    queryKey: ['player', id],
    queryFn: () => api.getPlayer(id),
  });

  const teams = player?.teams ?? [];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLeaguePress = () => {
    if (player?.league_id) {
      navigation.navigate('LeagueDetail', { id: player.league_id });
    }
  };

  const handleTeamPress = (team: Team) => {
    navigation.navigate('TeamDetail', { id: team.id });
  };

  const experienceColors: Record<string, string> = {
    beginner: COLORS.success,
    intermediate: COLORS.primary,
    advanced: COLORS.warning,
    pro: COLORS.error,
  };

  const availabilityColors: Record<string, string> = {
    available: COLORS.success,
    looking_for_team: COLORS.warning,
    unavailable: COLORS.textMuted,
  };

  const availabilityLabels: Record<string, string> = {
    available: 'Available',
    looking_for_team: 'Looking for Team',
    unavailable: 'Unavailable',
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !player) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load player</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatHeight = (inches: number | null): string => {
    if (!inches) return 'Not set';
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backLink} onPress={handleBack}>
            <Text style={styles.backLinkText}>← Players</Text>
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <View style={styles.playerAvatarLarge}>
              <Text style={styles.playerAvatarLargeText}>
                {player.user?.name?.charAt(0).toUpperCase() ?? 'P'}
              </Text>
              {player.is_private && (
                <View style={styles.privateBadgeLarge}>
                  <Text style={styles.privateBadgeLargeText}>🔒</Text>
                </View>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{player.user?.name ?? 'Unknown'}</Text>
              <Text style={styles.email}>{player.user?.email ?? 'No email'}</Text>
              <View style={styles.headerMeta}>
                <View
                  style={[
                    styles.experienceBadge,
                    {
                      backgroundColor:
                        (experienceColors[player.experience_level] || COLORS.textMuted) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.experienceBadgeText,
                      {
                        color:
                          experienceColors[player.experience_level] || COLORS.textMuted,
                      },
                    ]}
                  >
                    {player.experience_level}
                  </Text>
                </View>
                <View
                  style={[
                    styles.availabilityBadge,
                    {
                      backgroundColor:
                        (availabilityColors[player.availability_status] || COLORS.textMuted) +
                        '20',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.availabilityDot,
                      {
                        backgroundColor:
                          availabilityColors[player.availability_status] ||
                          COLORS.textMuted,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.availabilityBadgeText,
                      {
                        color:
                          availabilityColors[player.availability_status] ||
                          COLORS.textMuted,
                      },
                    ]}
                  >
                    {availabilityLabels[player.availability_status] ||
                      player.availability_status}
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
          id="teams"
          label="Teams"
          count={teams.length}
          isActive={activeTab === 'teams'}
          onPress={() => setActiveTab('teams')}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View>
            {/* Bio */}
            {player.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bio</Text>
                <View style={styles.bioCard}>
                  <Text style={styles.bioText}>{player.bio}</Text>
                </View>
              </View>
            )}

            {/* Player Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Player Information</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Position" value={player.position} />
                <InfoRow label="Experience Level" value={player.experience_level} />
                <InfoRow
                  label="Availability"
                  value={availabilityLabels[player.availability_status]}
                />
                <InfoRow
                  label="League"
                  value={player.league?.name}
                />
                <InfoRow label="Teams" value={`${teams.length} team(s)`} isLast />
              </View>
            </View>

            {/* Physical Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Physical Stats</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Height" value={formatHeight(player.height_inches)} />
                <InfoRow
                  label="Weight"
                  value={player.weight_lbs ? `${player.weight_lbs} lbs` : null}
                />
                <InfoRow
                  label="Date of Birth"
                  value={formatDate(player.date_of_birth)}
                  isLast
                />
              </View>
            </View>

            {/* Account Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Email" value={player.user?.email} />
                <InfoRow label="Phone" value={player.user?.phone} />
                <InfoRow label="Timezone" value={player.user?.timezone} />
                <InfoRow
                  label="Profile Visibility"
                  value={player.is_private ? 'Private' : 'Public'}
                  isLast
                />
              </View>
            </View>

            {/* League Card */}
            {player.league && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>League</Text>
                <TouchableOpacity style={styles.leagueCard} onPress={handleLeaguePress}>
                  <View style={styles.leagueIconContainer}>
                    <Text style={styles.leagueIcon}>🏆</Text>
                  </View>
                  <View style={styles.leagueInfo}>
                    <Text style={styles.leagueName}>{player.league.name}</Text>
                    <Text style={styles.leagueMeta}>
                      {player.league.sport_type} • {player.league.location ?? 'No location'}
                    </Text>
                  </View>
                  <Text style={styles.leagueArrow}>→</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'teams' && (
          <View style={styles.teamsContainer}>
            <View style={styles.teamsHeader}>
              <Text style={styles.teamsTitle}>Teams ({teams.length})</Text>
            </View>

            {teams.length === 0 ? (
              <View style={styles.emptyTabContainer}>
                <Text style={styles.emptyTabIcon}>👥</Text>
                <Text style={styles.emptyTabTitle}>No teams yet</Text>
                <Text style={styles.emptyTabText}>
                  This player hasn't joined any teams
                </Text>
              </View>
            ) : (
              <View style={styles.teamList}>
                {teams.map((team) => (
                  <TeamRow
                    key={team.id}
                    team={team}
                    onPress={() => handleTeamPress(team)}
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
  playerAvatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    position: 'relative',
  },
  playerAvatarLargeText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  privateBadgeLarge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  privateBadgeLargeText: {
    fontSize: 14,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  email: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
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
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  availabilityBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  bioCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  bioText: {
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
  leagueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  leagueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  leagueIcon: {
    fontSize: 24,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  leagueMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  leagueArrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
  teamsContainer: {
    flex: 1,
  },
  teamsHeader: {
    marginBottom: SPACING.md,
  },
  teamsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  teamList: {
    gap: SPACING.sm,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
  },
  teamRowLeft: {
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
  teamName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  teamLeague: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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
