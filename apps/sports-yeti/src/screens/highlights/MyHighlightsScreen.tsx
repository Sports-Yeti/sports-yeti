import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useHighlightStore } from '../../stores/highlightStore';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import type { HighlightSummary } from '../../types';

interface MyHighlightsScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Pending', color: COLORS.warning },
  processing: { label: 'Processing', color: COLORS.primary },
  completed: { label: 'Ready', color: COLORS.success },
  failed: { label: 'Failed', color: COLORS.error },
};

function HighlightCard({
  item,
  onPress,
}: {
  item: HighlightSummary;
  onPress: () => void;
}) {
  const badge = STATUS_BADGES[item.status] || STATUS_BADGES.processing;
  const date = new Date(item.created_at).toLocaleDateString();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
        <Text style={styles.cardDate}>{date}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardIcon}>🎬</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>
            {item.status === 'completed'
              ? `${item.clips_count} Highlight${item.clips_count !== 1 ? 's' : ''}`
              : 'Highlight Generation'}
          </Text>
          {item.source_video_duration ? (
            <Text style={styles.cardMeta}>
              Source: {Math.round(item.source_video_duration)}s video
            </Text>
          ) : null}
          {item.status === 'processing' ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.processingText}>Analyzing video...</Text>
            </View>
          ) : null}
          {item.status === 'failed' && item.error_message ? (
            <Text style={styles.errorText} numberOfLines={1}>
              {item.error_message}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function MyHighlightsScreen({ navigation }: MyHighlightsScreenProps) {
  const { highlights, isLoading, fetchHighlights } = useHighlightStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchHighlights();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchHighlights();
    setIsRefreshing(false);
  };

  const handlePress = (item: HighlightSummary) => {
    if (item.status === 'completed') {
      navigation.navigate('HighlightDetail', { id: item.id });
    }
  };

  if (isLoading && highlights.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={highlights}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HighlightCard item={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={
          highlights.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎥</Text>
            <Text style={styles.emptyTitle}>No Highlights Yet</Text>
            <Text style={styles.emptyText}>
              Upload a game video and let AI find the best moments for you.
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('HighlightUpload')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+ New Highlight</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.md },
  emptyContainer: { flexGrow: 1 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  cardDate: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  cardBody: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 36, marginRight: SPACING.md },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  processingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
