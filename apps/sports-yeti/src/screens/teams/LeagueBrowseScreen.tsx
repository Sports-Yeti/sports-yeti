import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import type { League } from '../../types';

const DEFAULT_ROSTER_SIZE = 5;

interface LeagueBrowseScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export function LeagueBrowseScreen({ navigation }: LeagueBrowseScreenProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadLeagues = useCallback(async () => {
    try {
      const response = await api.getLeagues({ is_active: true, per_page: 50 });
      setLeagues(response.data);
    } catch {
      Alert.alert('Error', 'Failed to load leagues');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeagues();
  }, [loadLeagues]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadLeagues();
  }, [loadLeagues]);

  const handleApply = (league: League) => {
    setSelectedLeague(league);
    setTeamName('');
    setIsModalVisible(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedLeague || !teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTeam({
        name: teamName.trim(),
        league_id: selectedLeague.id,
        description: null,
      });
      setIsModalVisible(false);
      Alert.alert('Success', `Team "${teamName.trim()}" registered for ${selectedLeague.name}!`);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to register team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMaxTeams = (league: League): number | null => {
    if (!league.settings) return null;
    return (league.settings as Record<string, unknown>).max_teams as number | null;
  };

  const getPerPlayerFee = (league: League): string => {
    const fee = Number(league.registration_fee);
    if (fee <= 0) return 'Free';
    return `$${(fee / DEFAULT_ROSTER_SIZE).toFixed(2)}`;
  };

  const renderLeagueCard = ({ item }: { item: League }) => {
    const maxTeams = getMaxTeams(item);
    const fee = Number(item.registration_fee);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{item.sport_type}</Text>
          </View>
          {item.location && (
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          )}
        </View>

        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {item.teams_count ?? 0}
              {maxTeams ? ` / ${maxTeams}` : ''}
            </Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {fee > 0 ? `$${fee.toFixed(2)}` : 'Free'}
            </Text>
            <Text style={styles.statLabel}>Registration</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{getPerPlayerFee(item)}</Text>
            <Text style={styles.statLabel}>Per Player</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleApply(item)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leagues}
        renderItem={renderLeagueCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>No Open Leagues</Text>
            <Text style={styles.emptyText}>
              Check back later for leagues accepting registrations
            </Text>
          </View>
        }
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register Team</Text>
            {selectedLeague && (
              <Text style={styles.modalSubtitle}>
                Joining {selectedLeague.name}
              </Text>
            )}

            <Text style={styles.inputLabel}>Team Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your team name"
              placeholderTextColor={COLORS.textSecondary}
              value={teamName}
              onChangeText={setTeamName}
              autoFocus
            />

            {selectedLeague && Number(selectedLeague.registration_fee) > 0 && (
              <View style={styles.feeBreakdown}>
                <Text style={styles.feeTitle}>Fee Breakdown</Text>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Registration Fee</Text>
                  <Text style={styles.feeValue}>
                    ${Number(selectedLeague.registration_fee).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>
                    Per Player (est. {DEFAULT_ROSTER_SIZE} players)
                  </Text>
                  <Text style={styles.feeValue}>
                    {getPerPlayerFee(selectedLeague)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmitApplication}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
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
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sportBadge: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  sportBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.secondary,
    textTransform: 'capitalize',
  },
  locationText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
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
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
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
  feeBreakdown: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  feeTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  feeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  feeValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
