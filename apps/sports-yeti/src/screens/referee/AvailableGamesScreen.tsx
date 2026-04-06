import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Game } from '../../types';

const SPORT_FILTERS = ['all', 'basketball', 'soccer', 'football', 'baseball', 'volleyball'];

interface BidModalProps {
  visible: boolean;
  game: Game | null;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

function BidModal({ visible, game, onClose, onSubmit }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('');

  const handleSubmit = () => {
    const amount = parseFloat(bidAmount);
    if (amount > 0) {
      onSubmit(amount);
      setBidAmount('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={bidStyles.overlay}>
        <View style={bidStyles.container}>
          <Text style={bidStyles.title}>Submit Bid</Text>
          {game && (
            <Text style={bidStyles.gameInfo}>
              {game.team1?.name ?? 'Team 1'} vs {game.team2?.name ?? 'Team 2'}
            </Text>
          )}
          <Text style={bidStyles.label}>Your Bid Amount ($)</Text>
          <TextInput
            style={bidStyles.input}
            value={bidAmount}
            onChangeText={setBidAmount}
            placeholder="Enter amount..."
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
          />
          <View style={bidStyles.actions}>
            <TouchableOpacity style={bidStyles.cancelButton} onPress={onClose}>
              <Text style={bidStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[bidStyles.submitButton, !bidAmount && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={!bidAmount}
            >
              <Text style={bidStyles.submitText}>Submit Bid</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function AvailableGamesScreen() {
  const queryClient = useQueryClient();
  const [sportFilter, setSportFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [bidGame, setBidGame] = useState<Game | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['available-referee-games', sportFilter],
    queryFn: () => {
      const params: Record<string, unknown> = { per_page: 20 };
      if (sportFilter !== 'all') params.sport_type = sportFilter;
      return api.getAvailableRefereeGames(params);
    },
  });

  const games = data?.data ?? [];

  const acceptMutation = useMutation({
    mutationFn: (gameId: string) => api.submitRefereeBid(gameId, { bid_amount: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-referee-games'] });
    },
  });

  const bidMutation = useMutation({
    mutationFn: ({ gameId, amount }: { gameId: string; amount: number }) =>
      api.submitRefereeBid(gameId, { bid_amount: amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-referee-games'] });
      setBidGame(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderGame = ({ item }: { item: Game }) => (
    <View style={styles.card}>
      <View style={styles.teamsRow}>
        <Text style={styles.teamName}>{item.team1?.name ?? 'Team 1'}</Text>
        <Text style={styles.vsText}>VS</Text>
        <Text style={styles.teamName}>{item.team2?.name ?? 'Team 2'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.dateText}>
          {new Date(item.scheduled_at).toLocaleDateString()} at{' '}
          {new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <View style={styles.gameTypeBadge}>
          <Text style={styles.gameTypeText}>{item.game_type}</Text>
        </View>
      </View>

      {item.facility && (
        <Text style={styles.venueText}>📍 {item.facility.name}</Text>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => acceptMutation.mutate(item.id)}
          disabled={acceptMutation.isPending}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bidButton}
          onPress={() => setBidGame(item)}
        >
          <Text style={styles.bidButtonText}>Submit Bid</Text>
        </TouchableOpacity>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {SPORT_FILTERS.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[styles.filterChip, sportFilter === sport && styles.filterChipActive]}
            onPress={() => setSportFilter(sport)}
          >
            <Text style={[styles.filterChipText, sportFilter === sport && styles.filterChipTextActive]}>
              {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={games}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏁</Text>
            <Text style={styles.emptyTitle}>No games available</Text>
            <Text style={styles.emptyText}>Check back later for new referee opportunities</Text>
          </View>
        }
      />

      <BidModal
        visible={!!bidGame}
        game={bidGame}
        onClose={() => setBidGame(null)}
        onSubmit={(amount) => {
          if (bidGame) bidMutation.mutate({ gameId: bidGame.id, amount });
        }}
      />
    </View>
  );
}

const bidStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
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
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  filterScroll: {
    flexGrow: 0,
    paddingVertical: SPACING.sm,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
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
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.textLight,
  },
  listContent: {
    padding: SPACING.md,
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
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  vsText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  gameTypeBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  gameTypeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  venueText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  bidButton: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  bidButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  emptyContainer: {
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
  },
});
