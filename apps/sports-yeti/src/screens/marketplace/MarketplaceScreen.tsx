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
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import type { Game, Facility, Space } from '../../types';

type ActiveTab = 'games' | 'slots';

interface FacilitySlot {
  facility: Facility;
  space: Space;
}

interface MarketplaceScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

export function MarketplaceScreen({ navigation }: MarketplaceScreenProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [facilitySlots, setFacilitySlots] = useState<FacilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadGames = useCallback(async () => {
    try {
      const response = await api.getGames({
        per_page: 30,
        status: 'scheduled',
      });
      const upcoming = response.data.filter(
        (g) => new Date(g.scheduled_at) > new Date()
      );
      setGames(upcoming);
    } catch (error) {
      console.error('Failed to load open games:', error);
    }
  }, []);

  const loadFacilities = useCallback(async () => {
    try {
      const response = await api.getFacilities({ include: 'spaces' });
      const slots: FacilitySlot[] = [];
      for (const facility of response.data) {
        if (!facility.spaces) continue;
        for (const space of facility.spaces) {
          if (space.is_active) {
            slots.push({ facility, space });
          }
        }
      }
      setFacilitySlots(slots);
    } catch (error) {
      console.error('Failed to load facilities:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadGames(), loadFacilities()]);
    setIsLoading(false);
  }, [loadGames, loadFacilities]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadGames(), loadFacilities()]);
    setIsRefreshing(false);
  }, [loadGames, loadFacilities]);

  const filteredGames = games.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.team1?.name?.toLowerCase().includes(q) ||
      g.team2?.name?.toLowerCase().includes(q) ||
      g.facility?.name?.toLowerCase().includes(q) ||
      g.game_type?.toLowerCase().includes(q)
    );
  });

  const filteredSlots = facilitySlots.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.facility.name.toLowerCase().includes(q) ||
      s.space.name.toLowerCase().includes(q) ||
      s.space.sport_type?.toLowerCase().includes(q)
    );
  });

  const renderGameCard = ({ item }: { item: Game }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('GameDetails', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>
            {item.league?.sport_type || 'Game'}
          </Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.game_type}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>
        {item.team1?.name || 'TBD'} vs {item.team2?.name || 'TBD'}
      </Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>📅</Text>
        <Text style={styles.detailText}>
          {new Date(item.scheduled_at).toLocaleDateString()} at{' '}
          {new Date(item.scheduled_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {item.facility && (
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{item.facility.name}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('GameDetails', { id: item.id })}
      >
        <Text style={styles.actionButtonText}>View Game</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSlotCard = ({ item }: { item: FacilitySlot }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('FacilityDetails', { id: item.facility.id })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>{item.space.sport_type}</Text>
        </View>
        {item.space.is_indoor && (
          <View style={[styles.typeBadge, { backgroundColor: COLORS.primaryLight }]}>
            <Text style={[styles.typeBadgeText, { color: COLORS.primary }]}>Indoor</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle}>{item.facility.name}</Text>
      <Text style={styles.cardSubtitle}>{item.space.name}</Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>📍</Text>
        <Text style={styles.detailText} numberOfLines={1}>
          {item.facility.address}, {item.facility.city}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>👥</Text>
        <Text style={styles.detailText}>Capacity: {item.space.capacity}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceText}>
          ${item.space.hourly_rate.toFixed(2)}/hr
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('FacilityDetails', { id: item.facility.id })
          }
        >
          <Text style={styles.actionButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
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
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'games' && styles.tabActive]}
          onPress={() => setActiveTab('games')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'games' && styles.tabTextActive,
            ]}
          >
            Open Games
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'slots' && styles.tabActive]}
          onPress={() => setActiveTab('slots')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'slots' && styles.tabTextActive,
            ]}
          >
            Available Slots
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={
            activeTab === 'games'
              ? 'Search games by team, venue...'
              : 'Search facilities, sports...'
          }
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {activeTab === 'games' ? (
        <FlatList
          data={filteredGames}
          renderItem={renderGameCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏀</Text>
              <Text style={styles.emptyTitle}>No Open Games</Text>
              <Text style={styles.emptyText}>
                Check back later for upcoming games to join
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredSlots}
          renderItem={renderSlotCard}
          keyExtractor={(item) => `${item.facility.id}-${item.space.id}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏟️</Text>
              <Text style={styles.emptyTitle}>No Available Slots</Text>
              <Text style={styles.emptyText}>
                No facility slots available right now
              </Text>
            </View>
          }
        />
      )}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
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
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
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
  typeBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  priceText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
  },
  actionButtonText: {
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
});
