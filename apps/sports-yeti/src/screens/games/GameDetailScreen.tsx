import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, GAME_STATUS } from '../../constants';
import type { Game } from '../../types';

interface GameDetailScreenProps {
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

export function GameDetailScreen({ route, navigation }: GameDetailScreenProps) {
  const { id } = route.params;
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGame = async () => {
    try {
      setError(null);
      const data = await api.getGame(id);
      setGame(data);
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadGame();
  }, [id]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadGame();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return COLORS.primary;
      case 'in_progress':
        return COLORS.warning;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
      case 'postponed':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleOpenChat = () => {
    navigation.navigate('Chat', { chatId: `game-${id}`, title: 'Game Chat' });
  };

  const handleTeamPress = (teamId: string) => {
    navigation.navigate('TeamDetails', { id: teamId });
  };

  const handleFacilityPress = (facilityId: string) => {
    navigation.navigate('FacilityDetails', { id: facilityId });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😞</Text>
        <Text style={styles.errorText}>{error || 'Game not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadGame}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(game.status) + '20' },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor(game.status) }]}
          />
          <Text style={[styles.statusText, { color: getStatusColor(game.status) }]}>
            {GAME_STATUS[game.status as keyof typeof GAME_STATUS] || game.status}
          </Text>
        </View>
        <View style={styles.gameTypeBadge}>
          <Text style={styles.gameTypeText}>{game.game_type}</Text>
        </View>
      </View>

      {/* Matchup Card */}
      <View style={styles.matchupCard}>
        <TouchableOpacity
          style={styles.teamSection}
          onPress={() => game.team1 && handleTeamPress(game.team1_id)}
          disabled={!game.team1}
        >
          <View style={styles.teamAvatar}>
            <Text style={styles.teamAvatarText}>
              {game.team1?.name?.charAt(0).toUpperCase() || 'T1'}
            </Text>
          </View>
          <Text style={styles.teamName} numberOfLines={2}>
            {game.team1?.name || 'Team 1'}
          </Text>
          {game.status === 'completed' && (
            <Text
              style={[
                styles.scoreText,
                game.winner_team_id === game.team1_id && styles.winningScore,
              ]}
            >
              {game.team1_score ?? '-'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
          {game.status === 'in_progress' && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.teamSection}
          onPress={() => game.team2 && handleTeamPress(game.team2_id)}
          disabled={!game.team2}
        >
          <View style={styles.teamAvatar}>
            <Text style={styles.teamAvatarText}>
              {game.team2?.name?.charAt(0).toUpperCase() || 'T2'}
            </Text>
          </View>
          <Text style={styles.teamName} numberOfLines={2}>
            {game.team2?.name || 'Team 2'}
          </Text>
          {game.status === 'completed' && (
            <Text
              style={[
                styles.scoreText,
                game.winner_team_id === game.team2_id && styles.winningScore,
              ]}
            >
              {game.team2_score ?? '-'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date & Time Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date & Time</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(game.scheduled_at)}</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <View>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{formatTime(game.scheduled_at)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Location Section */}
      {game.facility && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => game.facility && handleFacilityPress(game.facility_id!)}
          >
            <View style={styles.locationContent}>
              <Text style={styles.locationIcon}>🏟️</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{game.facility.name}</Text>
                <Text style={styles.locationAddress}>
                  {game.facility.city}, {game.facility.state}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* League Info */}
      {game.league && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>League</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏆</Text>
              <View>
                <Text style={styles.infoValue}>{game.league.name}</Text>
                <Text style={styles.infoLabel}>{game.league.sport_type}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Chat Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
          <Text style={styles.chatButtonIcon}>💬</Text>
          <Text style={styles.chatButtonText}>Open Game Chat</Text>
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  gameTypeBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  gameTypeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  matchupCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 16,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamAvatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  scoreText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  winningScore: {
    color: COLORS.success,
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  vsText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },
  liveText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.error,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.background,
    marginVertical: SPACING.sm,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textSecondary,
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
  bottomPadding: {
    height: SPACING.xl,
  },
});
