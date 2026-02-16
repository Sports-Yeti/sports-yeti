import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Facility, MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export function FacilityListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const loadFacilities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getFacilities();
      setFacilities(response.data);
      setFilteredFacilities(response.data);
    } catch (error) {
      console.error('Failed to load facilities:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  // Filter facilities when search or status changes
  useEffect(() => {
    let filtered = facilities;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.city.toLowerCase().includes(query) ||
          f.state.toLowerCase().includes(query) ||
          f.address.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((f) =>
        statusFilter === 'active' ? f.is_active : !f.is_active
      );
    }

    setFilteredFacilities(filtered);
  }, [facilities, searchQuery, statusFilter]);

  function handleFacilityPress(facility: Facility) {
    navigation.navigate('FacilityDetail', { id: facility.id });
  }

  function handleAddFacility() {
    navigation.navigate('FacilityForm', {});
  }

  function renderFacilityCard({ item }: { item: Facility }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleFacilityPress(item)}
      >
        <View style={styles.cardImageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardImagePlaceholderText}>🏟️</Text>
            </View>
          )}
          <View
            style={[
              styles.statusIndicator,
              item.is_active ? styles.statusActive : styles.statusInactive,
            ]}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View
              style={[
                styles.statusBadge,
                item.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  item.is_active
                    ? styles.statusBadgeTextActive
                    : styles.statusBadgeTextInactive,
                ]}
              >
                {item.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          <Text style={styles.cardAddress}>
            {item.address}, {item.city}, {item.state} {item.zip_code}
          </Text>

          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.spaces_count || 0}</Text>
              <Text style={styles.statLabel}>Spaces</Text>
            </View>
            {item.phone && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>📞</Text>
                <Text style={styles.statLabel}>{item.phone}</Text>
              </View>
            )}
            {item.email && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>✉️</Text>
                <Text style={styles.statLabel}>{item.email}</Text>
              </View>
            )}
          </View>

          {item.amenities && item.amenities.length > 0 && (
            <View style={styles.amenitiesRow}>
              {item.amenities.slice(0, 4).map((amenity, index) => (
                <View key={index} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
              {item.amenities.length > 4 && (
                <Text style={styles.moreAmenities}>
                  +{item.amenities.length - 4} more
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.cardArrow}>
          <Text style={styles.cardArrowText}>›</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Facilities</Text>
          <Text style={styles.subtitle}>
            {filteredFacilities.length} of {facilities.length} facilities
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFacility}>
          <Text style={styles.addButtonText}>+ Add Facility</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search facilities..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusFilters}>
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilterButton,
                statusFilter === status && styles.statusFilterButtonActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  statusFilter === status && styles.statusFilterTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredFacilities}
        renderItem={renderFacilityCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={loadFacilities}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏟️</Text>
            <Text style={styles.emptyTitle}>No facilities found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Add your first facility to get started'}
            </Text>
          </View>
        }
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  filters: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  clearSearch: {
    fontSize: 20,
    color: COLORS.textMuted,
    padding: SPACING.xs,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statusFilterButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  statusFilterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  statusFilterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusFilterTextActive: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: 120,
    height: '100%',
    minHeight: 140,
  },
  cardImagePlaceholder: {
    width: 120,
    height: '100%',
    minHeight: 140,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImagePlaceholderText: {
    fontSize: 40,
  },
  statusIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  statusActive: {
    backgroundColor: COLORS.success,
  },
  statusInactive: {
    backgroundColor: COLORS.error,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: SPACING.sm,
  },
  statusBadgeActive: {
    backgroundColor: COLORS.success + '20',
  },
  statusBadgeInactive: {
    backgroundColor: COLORS.error + '20',
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  statusBadgeTextActive: {
    color: COLORS.success,
  },
  statusBadgeTextInactive: {
    color: COLORS.error,
  },
  cardAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  cardStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  amenityTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  amenityText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  moreAmenities: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  cardArrow: {
    justifyContent: 'center',
    paddingRight: SPACING.md,
  },
  cardArrowText: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
