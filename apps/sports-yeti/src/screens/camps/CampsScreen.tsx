import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import type { Camp } from '../../types';

interface CampsScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

export function CampsScreen({ navigation }: CampsScreenProps) {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCamps = async () => {
    try {
      const response = await api.getCamps();
      setCamps(response.data);
    } catch (error) {
      console.error('Failed to load camps:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadCamps();
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getAgeRange = (camp: Camp) => {
    if (camp.min_age && camp.max_age) {
      return `Ages ${camp.min_age}-${camp.max_age}`;
    }
    if (camp.min_age) {
      return `Ages ${camp.min_age}+`;
    }
    return 'All ages';
  };

  const renderCamp = ({ item }: { item: Camp }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CampDetails', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.campIcon}>
          <Text style={styles.campEmoji}>⛺</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>
            {item.league?.name || 'Sports Camp'}
          </Text>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            ${item.price?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>
            {item.start_date && item.end_date
              ? formatDateRange(item.start_date, item.end_date)
              : 'Dates TBD'}
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailIcon}>👤</Text>
          <Text style={styles.detailText}>{getAgeRange(item)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.capacityContainer}>
          <Text style={styles.capacityText}>
            {item.registered_count || 0}/{item.capacity || '∞'} spots filled
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(((item.registered_count || 0) / (item.capacity || 1)) * 100, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Register</Text>
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
      <FlatList
        data={camps}
        renderItem={renderCamp}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⛺</Text>
            <Text style={styles.emptyText}>No camps available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for upcoming camps
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
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.md,
    padding: SPACING.md,
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
  },
  campIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  campEmoji: {
    fontSize: 22,
  },
  headerContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  priceTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  priceText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  capacityContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  capacityText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  registerButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
