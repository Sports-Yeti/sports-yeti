import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface SubRequestItem {
  id: string;
  game_id: string;
  team_id: string;
  position: string | null;
  message: string | null;
  status: string;
  created_at: string;
  game?: {
    id: string;
    scheduled_at: string;
    facility?: { name: string; city?: string; state?: string } | null;
    league?: { name: string; sport_type: string } | null;
  };
  team?: {
    id: string;
    name: string;
  };
  captain?: {
    name: string;
  };
}

interface SubRequestsScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

export function SubRequestsScreen({ navigation }: SubRequestsScreenProps) {
  const [requests, setRequests] = useState<SubRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const response = await api.getAvailableSubRequests();
      setRequests(response.data as unknown as SubRequestItem[]);
    } catch {
      Alert.alert('Error', 'Failed to load sub requests');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadRequests();
  }, [loadRequests]);

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      await api.acceptSubRequest(id);
      Alert.alert('Success', 'You accepted the sub request!');
      loadRequests();
    } catch {
      Alert.alert('Error', 'Failed to accept sub request.');
    } finally {
      setAcceptingId(null);
    }
  };

  const renderItem = ({ item }: { item: SubRequestItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        item.game_id && navigation.navigate('GameDetails', { id: item.game_id })
      }
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>
            {item.game?.league?.sport_type ?? 'Game'}
          </Text>
        </View>
        {item.position && (
          <View style={styles.positionBadge}>
            <Text style={styles.positionBadgeText}>{item.position}</Text>
          </View>
        )}
      </View>

      <Text style={styles.teamText}>{item.team?.name ?? 'Team'}</Text>

      {item.game?.scheduled_at && (
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>
            {new Date(item.game.scheduled_at).toLocaleDateString()} at{' '}
            {new Date(item.game.scheduled_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}

      {item.game?.facility && (
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{item.game.facility.name}</Text>
        </View>
      )}

      {item.message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>"{item.message}"</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.acceptButton, acceptingId === item.id && styles.acceptButtonDisabled]}
        onPress={() => handleAccept(item.id)}
        disabled={acceptingId === item.id}
      >
        {acceptingId === item.id ? (
          <ActivityIndicator size="small" color={COLORS.surface} />
        ) : (
          <Text style={styles.acceptButtonText}>Accept Sub Request</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={requests}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔄</Text>
          <Text style={styles.emptyTitle}>No Sub Requests</Text>
          <Text style={styles.emptyText}>
            Check back later for available sub opportunities.
          </Text>
        </View>
      }
    />
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
  positionBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  positionBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  teamText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailIcon: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.sm,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  messageBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  messageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  acceptButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
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
});
