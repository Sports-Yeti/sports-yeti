import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { api } from '../../services/api';
import { useHighlightStore } from '../../stores/highlightStore';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import type { HighlightClip } from '../../types';

interface HighlightDetailScreenProps {
  route: { params: { id: string } };
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

function ClipCard({
  clip,
  highlightId,
  onShare,
}: {
  clip: HighlightClip;
  highlightId: string;
  onShare: (clip: HighlightClip) => void;
}) {
  const duration = (clip.end_time - clip.start_time).toFixed(1);

  return (
    <View style={styles.clipCard}>
      <View style={styles.clipHeader}>
        <View style={styles.clipTitleRow}>
          <Text style={styles.clipTitle}>{clip.title}</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>
              {'⭐'.repeat(Math.min(clip.excitement_score, 5))}
            </Text>
          </View>
        </View>
        <Text style={styles.clipTimestamp}>
          {formatTime(clip.start_time)} - {formatTime(clip.end_time)} ({duration}s)
        </Text>
      </View>
      <Text style={styles.clipDescription}>{clip.description}</Text>
      <View style={styles.clipActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare(clip)}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={async () => {
            try {
              const { download_url } = await api.getClipDownloadUrl(
                highlightId,
                clip.id
              );
              Alert.alert('Download Ready', 'Download URL copied. In production, this would save to your camera roll.');
            } catch {
              Alert.alert('Error', 'Could not generate download link.');
            }
          }}
        >
          <Text style={styles.actionIcon}>⬇️</Text>
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function HighlightDetailScreen({
  route,
  navigation,
}: HighlightDetailScreenProps) {
  const { id } = route.params;
  const { currentHighlight, isLoading, fetchHighlight } = useHighlightStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHighlight(id);
  }, [id]);

  useEffect(() => {
    if (currentHighlight?.status === 'processing') {
      const interval = setInterval(() => fetchHighlight(id), 5000);
      return () => clearInterval(interval);
    }
  }, [currentHighlight?.status, id]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchHighlight(id);
    setIsRefreshing(false);
  }, [id]);

  const handleShareClip = async (clip: HighlightClip) => {
    try {
      await Share.share({
        message: `Check out this highlight: ${clip.title} - ${clip.description}`,
        url: clip.clip_url,
      });
    } catch {
      // User cancelled
    }
  };

  const toggleClipSelection = (clipId: string) => {
    setSelectedClips((prev) => {
      const next = new Set(prev);
      if (next.has(clipId)) next.delete(clipId);
      else next.add(clipId);
      return next;
    });
  };

  const handlePostToFeed = async () => {
    const clipIds =
      selectedClips.size > 0
        ? Array.from(selectedClips)
        : currentHighlight?.clips.map((c) => c.id) || [];

    if (clipIds.length === 0) return;

    try {
      await api.shareHighlightToFeed(id, clipIds);
      Alert.alert('Posted!', 'Your highlights have been shared to the feed.');
      fetchHighlight(id);
    } catch {
      Alert.alert('Error', 'Could not post to feed.');
    }
  };

  if (isLoading && !currentHighlight) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!currentHighlight) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Highlight not found</Text>
      </View>
    );
  }

  if (currentHighlight.status === 'processing') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.processingTitle}>Analyzing Your Video</Text>
        <Text style={styles.processingSubtitle}>
          AI is identifying the best moments. This usually takes 1-3 minutes.
        </Text>
      </View>
    );
  }

  if (currentHighlight.status === 'failed') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.processingTitle}>Generation Failed</Text>
        <Text style={styles.processingSubtitle}>
          {currentHighlight.error_message || 'An unknown error occurred.'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const clips = currentHighlight.clips || [];
  const summary = currentHighlight.analysis?.summary;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {summary ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>AI Summary</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          {clips.length} Clip{clips.length !== 1 ? 's' : ''} Found
        </Text>

        {clips.map((clip) => (
          <TouchableOpacity
            key={clip.id}
            onLongPress={() => toggleClipSelection(clip.id)}
            style={[
              selectedClips.has(clip.id) && styles.selectedClip,
            ]}
          >
            <ClipCard
              clip={clip}
              highlightId={id}
              onShare={handleShareClip}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {currentHighlight.post_id ? (
        <View style={styles.postedBanner}>
          <Text style={styles.postedText}>✅ Shared to Feed</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.postButton}
          onPress={handlePostToFeed}
          activeOpacity={0.8}
        >
          <Text style={styles.postButtonText}>
            {selectedClips.size > 0
              ? `Post ${selectedClips.size} Clip${selectedClips.size > 1 ? 's' : ''} to Feed`
              : 'Post All to Feed'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  scrollContent: { padding: SPACING.md, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  clipCard: {
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
  selectedClip: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 14,
  },
  clipHeader: { marginBottom: SPACING.sm },
  clipTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clipTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  scoreBadge: { marginLeft: SPACING.sm },
  scoreText: { fontSize: 12 },
  clipTimestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  clipDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  clipActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  actionIcon: { fontSize: 16, marginRight: SPACING.xs },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  processingTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorIcon: { fontSize: 48 },
  errorText: { fontSize: FONT_SIZES.md, color: COLORS.error },
  retryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  retryButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  postButton: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  postButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  postedBanner: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  postedText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
