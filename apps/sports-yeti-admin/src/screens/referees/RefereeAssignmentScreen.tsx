import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Game, Referee, RefereeAssignment, MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface AssignModalProps {
  visible: boolean;
  game: Game | null;
  onClose: () => void;
  onAssign: (refereeId: string, rate: number, isBidding: boolean) => void;
}

function AssignModal({ visible, game, onClose, onAssign }: AssignModalProps) {
  const [selectedRefereeId, setSelectedRefereeId] = useState('');
  const [rate, setRate] = useState('');
  const [isBidding, setIsBidding] = useState(false);

  const { data: refereesData } = useQuery({
    queryKey: ['referees', { is_available: true, per_page: 50 }],
    queryFn: () => api.getReferees({ is_available: true, per_page: 50 }),
    enabled: visible,
  });

  const referees = refereesData?.data ?? [];

  const handleAssign = () => {
    if (!selectedRefereeId || !rate) return;
    onAssign(selectedRefereeId, parseFloat(rate), isBidding);
    setSelectedRefereeId('');
    setRate('');
    setIsBidding(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>Assign Referee</Text>
          {game && (
            <Text style={modalStyles.gameInfo}>
              {game.team1?.name ?? 'Team 1'} vs {game.team2?.name ?? 'Team 2'}
            </Text>
          )}

          <Text style={modalStyles.label}>Select Referee</Text>
          <ScrollView style={modalStyles.refereeList} nestedScrollEnabled>
            {referees.map((ref: Referee) => (
              <TouchableOpacity
                key={ref.id}
                style={[
                  modalStyles.refereeOption,
                  selectedRefereeId === ref.id && modalStyles.refereeOptionActive,
                ]}
                onPress={() => setSelectedRefereeId(ref.id)}
              >
                <Text style={[
                  modalStyles.refereeName,
                  selectedRefereeId === ref.id && modalStyles.refereeNameActive,
                ]}>
                  {ref.user?.name ?? 'Unknown'}
                </Text>
                <Text style={modalStyles.refereeRate}>
                  ${ref.hourly_rate}/hr · ★ {Number(ref.rating).toFixed(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={modalStyles.label}>Rate ($)</Text>
          <TextInput
            style={modalStyles.input}
            value={rate}
            onChangeText={setRate}
            placeholder="Enter rate..."
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={modalStyles.toggleRow}
            onPress={() => setIsBidding(!isBidding)}
          >
            <View style={[modalStyles.checkbox, isBidding && modalStyles.checkboxActive]}>
              {isBidding && <Text style={modalStyles.checkmark}>✓</Text>}
            </View>
            <Text style={modalStyles.toggleLabel}>Enable bidding</Text>
          </TouchableOpacity>

          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
              <Text style={modalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.assignButton, (!selectedRefereeId || !rate) && { opacity: 0.5 }]}
              onPress={handleAssign}
              disabled={!selectedRefereeId || !rate}
            >
              <Text style={modalStyles.assignButtonText}>Assign</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function RefereeAssignmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [assignModalGame, setAssignModalGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState<'unassigned' | 'assigned'>('unassigned');

  const { data: gamesData, isLoading: gamesLoading, refetch: refetchGames } = useQuery({
    queryKey: ['referee-available-games'],
    queryFn: () => api.getAvailableGamesForReferees({ per_page: 50 }),
  });

  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery({
    queryKey: ['all-referee-assignments'],
    queryFn: () => api.getRefereeAssignments({ per_page: 50 }),
  });

  const games = gamesData?.data ?? [];
  const allAssignments = assignmentsData?.data ?? [];

  const assignMutation = useMutation({
    mutationFn: ({ gameId, data }: { gameId: string; data: { referee_id: string; rate: number; is_bidding?: boolean } }) =>
      api.assignReferee(gameId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referee-available-games'] });
      queryClient.invalidateQueries({ queryKey: ['all-referee-assignments'] });
      setAssignModalGame(null);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-referee-assignments'] });
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchGames(), refetchAssignments()]);
    setRefreshing(false);
  }, [refetchGames, refetchAssignments]);

  const handleAssign = (refereeId: string, rate: number, isBidding: boolean) => {
    if (!assignModalGame) return;
    assignMutation.mutate({
      gameId: assignModalGame.id,
      data: { referee_id: refereeId, rate, is_bidding: isBidding },
    });
  };

  const isLoading = gamesLoading || assignmentsLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to Referees</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Referee Assignments</Text>
        <Text style={styles.subtitle}>Assign referees to games and manage bids</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unassigned' && styles.tabActive]}
          onPress={() => setActiveTab('unassigned')}
        >
          <Text style={[styles.tabText, activeTab === 'unassigned' && styles.tabTextActive]}>
            Games Needing Refs ({games.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.tabActive]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.tabTextActive]}>
            Assignments ({allAssignments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {activeTab === 'unassigned' ? (
            games.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyTitle}>All games covered</Text>
                <Text style={styles.emptyText}>No games currently need referees</Text>
              </View>
            ) : (
              games.map((game: Game) => (
                <View key={game.id} style={styles.gameCard}>
                  <View style={styles.gameHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gameTeams}>
                        {game.team1?.name ?? 'Team 1'} vs {game.team2?.name ?? 'Team 2'}
                      </Text>
                      <Text style={styles.gameDate}>
                        {new Date(game.scheduled_at).toLocaleDateString()} at{' '}
                        {new Date(game.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {game.facility && (
                        <Text style={styles.gameVenue}>📍 {game.facility.name}</Text>
                      )}
                    </View>
                    <View style={[styles.unassignedBadge]}>
                      <Text style={styles.unassignedText}>Unassigned</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.assignButton}
                    onPress={() => setAssignModalGame(game)}
                  >
                    <Text style={styles.assignButtonText}>Assign Referee</Text>
                  </TouchableOpacity>
                </View>
              ))
            )
          ) : (
            allAssignments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No assignments yet</Text>
                <Text style={styles.emptyText}>Assign referees to games to see them here</Text>
              </View>
            ) : (
              allAssignments.map((assignment: RefereeAssignment) => (
                <View key={assignment.id} style={styles.gameCard}>
                  <View style={styles.gameHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gameTeams}>
                        {assignment.game?.team1?.name ?? 'Team 1'} vs {assignment.game?.team2?.name ?? 'Team 2'}
                      </Text>
                      <Text style={styles.gameDate}>
                        Referee: {assignment.referee?.user?.name ?? 'Unknown'}
                      </Text>
                      <Text style={styles.gameVenue}>
                        Rate: ${assignment.assigned_rate}
                        {assignment.is_bidding ? ' (Bidding)' : ' (Fixed)'}
                        {assignment.bid_amount ? ` · Bid: $${assignment.bid_amount}` : ''}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: (
                            assignment.status === 'accepted' ? COLORS.success
                            : assignment.status === 'completed' ? COLORS.primary
                            : assignment.status === 'rejected' ? COLORS.error
                            : COLORS.warning
                          ) + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color:
                              assignment.status === 'accepted' ? COLORS.success
                              : assignment.status === 'completed' ? COLORS.primary
                              : assignment.status === 'rejected' ? COLORS.error
                              : COLORS.warning,
                          },
                        ]}
                      >
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  {assignment.status === 'pending' && !assignment.admin_approved && (
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => approveMutation.mutate(assignment.id)}
                    >
                      <Text style={styles.approveButtonText}>Approve Assignment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )
          )}
        </ScrollView>
      )}

      <AssignModal
        visible={!!assignModalGame}
        game={assignModalGame}
        onClose={() => setAssignModalGame(null)}
        onAssign={handleAssign}
      />
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    width: '90%',
    maxWidth: 480,
    maxHeight: '80%',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  gameInfo: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  refereeList: {
    maxHeight: 200,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  refereeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  refereeOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  refereeName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  refereeNameActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  refereeRate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  toggleLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  assignButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backLink: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  backLinkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  gameCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  gameTeams: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  gameDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  gameVenue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  unassignedBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  unassignedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.warning,
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
  assignButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  assignButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  approveButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});
