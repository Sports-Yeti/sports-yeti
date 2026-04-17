import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  EXPERIENCE_LEVELS,
  AVAILABILITY_STATUS,
} from '../../constants';
import type { Player, Team } from '../../types';

const SKILL_FILTERS = ['All', 'beginner', 'intermediate', 'advanced', 'pro'] as const;
const AVAILABILITY_FILTERS = ['All', 'available', 'looking_for_team', 'unavailable'] as const;

export function PlayerDirectoryScreen() {
  const { user } = useAuthStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [captainTeams, setCaptainTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [pendingInvitePlayer, setPendingInvitePlayer] = useState<Player | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');

  const loadPlayers = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { per_page: 50, include: 'user' };
      if (skillFilter !== 'All') params.experience_level = skillFilter;
      if (availabilityFilter !== 'All') params.availability_status = availabilityFilter;
      const response = await api.getPlayers(params);
      setPlayers(response.data);
    } catch {
      Alert.alert('Error', 'Failed to load players');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [skillFilter, availabilityFilter]);

  const loadCaptainTeams = useCallback(async () => {
    if (!user?.player) return;
    try {
      const response = await api.getTeams({ captain_id: user.player.id, per_page: 50 });
      setCaptainTeams(response.data);
    } catch {
      // Captain team loading failure is non-critical for browsing
    }
  }, [user?.player]);

  useEffect(() => {
    setIsLoading(true);
    loadPlayers();
  }, [loadPlayers]);

  useEffect(() => {
    loadCaptainTeams();
  }, [loadCaptainTeams]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadPlayers();
  }, [loadPlayers]);

  const isCaptain = captainTeams.length > 0;

  const handleInviteTap = (player: Player) => {
    if (!isCaptain) {
      Alert.alert(
        'Captain Required',
        'You must be a team captain to invite players.'
      );
      return;
    }
    setPendingInvitePlayer(player);
    setInviteMessage('');
  };

  const handleInviteToTeam = async (teamId: string) => {
    if (!pendingInvitePlayer) return;
    setInvitingId(pendingInvitePlayer.id);
    try {
      await api.invitePlayer(
        teamId,
        pendingInvitePlayer.id,
        inviteMessage.trim() || undefined
      );
      Alert.alert(
        'Invitation Sent',
        `Invited ${pendingInvitePlayer.user?.name ?? 'player'} to the team.`
      );
      setPendingInvitePlayer(null);
      setInviteMessage('');
    } catch {
      Alert.alert(
        'Error',
        'Failed to send invitation. They may already be invited.'
      );
    } finally {
      setInvitingId(null);
    }
  };

  const filteredPlayers = players.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.user?.name?.toLowerCase().includes(q) ||
      p.position?.toLowerCase().includes(q)
    );
  });

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return COLORS.success;
      case 'looking_for_team':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.user?.name ?? 'Unknown'}</Text>
          <View style={styles.metaRow}>
            {item.position && (
              <Text style={styles.metaText}>{item.position}</Text>
            )}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>
                {EXPERIENCE_LEVELS[item.experience_level] ?? item.experience_level}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getAvailabilityColor(item.availability_status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getAvailabilityColor(item.availability_status) },
              ]}
            >
              {AVAILABILITY_STATUS[item.availability_status] ??
                item.availability_status}
            </Text>
            {item.availability_status === 'looking_for_team' && (
              <View style={styles.lftBadge}>
                <Text style={styles.lftBadgeText}>LFT</Text>
              </View>
            )}
          </View>
        </View>
        {isCaptain && (
          <TouchableOpacity
            style={[
              styles.inviteButton,
              invitingId === item.id && styles.inviteButtonDisabled,
            ]}
            onPress={() => handleInviteTap(item)}
            disabled={invitingId === item.id}
          >
            {invitingId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.surface} />
            ) : (
              <Text style={styles.inviteButtonText}>Invite</Text>
            )}
          </TouchableOpacity>
        )}
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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or position..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        {SKILL_FILTERS.map((level) => (
          <TouchableOpacity
            key={`skill-${level}`}
            style={[styles.filterChip, skillFilter === level && styles.filterChipActive]}
            onPress={() => setSkillFilter(level)}
          >
            <Text
              style={[
                styles.filterChipText,
                skillFilter === level && styles.filterChipTextActive,
              ]}
            >
              {level === 'All'
                ? 'All Skills'
                : EXPERIENCE_LEVELS[level as keyof typeof EXPERIENCE_LEVELS] ?? level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterContainer}>
        {AVAILABILITY_FILTERS.map((status) => (
          <TouchableOpacity
            key={`avail-${status}`}
            style={[
              styles.filterChip,
              availabilityFilter === status && styles.filterChipActive,
            ]}
            onPress={() => setAvailabilityFilter(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                availabilityFilter === status && styles.filterChipTextActive,
              ]}
            >
              {status === 'All'
                ? 'Any'
                : AVAILABILITY_STATUS[status as keyof typeof AVAILABILITY_STATUS] ??
                  status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No Players Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      <Modal
        visible={!!pendingInvitePlayer}
        transparent
        animationType="slide"
        onRequestClose={() => setPendingInvitePlayer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite to Team</Text>
            <Text style={styles.modalSubtitle}>
              {pendingInvitePlayer?.user?.name ?? 'Player'} — pick a team
            </Text>

            <Text style={styles.modalLabel}>Message (optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Add a personal message..."
              placeholderTextColor={COLORS.textSecondary}
              value={inviteMessage}
              onChangeText={setInviteMessage}
              multiline
            />

            <Text style={styles.modalLabel}>Select Team</Text>
            {captainTeams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamPickRow}
                onPress={() => handleInviteToTeam(team.id)}
                disabled={invitingId === pendingInvitePlayer?.id}
              >
                <Text style={styles.teamPickName}>{team.name}</Text>
                {team.league && (
                  <Text style={styles.teamPickLeague}>{team.league.name}</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setPendingInvitePlayer(null)}
              disabled={invitingId === pendingInvitePlayer?.id}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.surface,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  levelBadge: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  lftBadge: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: 4,
  },
  lftBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.warning,
  },
  inviteButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  inviteButtonDisabled: {
    opacity: 0.6,
  },
  inviteButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  modalTextArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  teamPickRow: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  teamPickName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  teamPickLeague: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalCancelButton: {
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  modalCancelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
