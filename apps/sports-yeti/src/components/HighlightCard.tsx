import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Text } from '../ui/Text';
import type { HighlightReel } from '../mocks/highlights';

interface HighlightCardProps {
  reel: HighlightReel;
  /** Fixed width for horizontal rails. Defaults to a compact 200. */
  width?: number;
  onPress?: () => void;
}

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Compact highlight-reel poster used on the Discover feed rail. Tapping opens
 * the full-screen Highlights feed focused on this reel.
 */
export function HighlightCard({ reel, width = 200, onPress }: HighlightCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Play highlight by ${reel.username}, ${reel.team}`}
      accessibilityHint="Opens the highlights feed"
      style={[styles.card, { width }]}
    >
      <View style={styles.media}>
        <Image
          source={{ uri: reel.poster }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          accessibilityLabel="Highlight thumbnail"
        />
        <View style={styles.playOverlay} pointerEvents="none">
          <View style={styles.playBubble}>
            <Play
              size={16}
              color={colors.text.inverse}
              strokeWidth={2.5}
              fill={colors.text.inverse}
            />
          </View>
        </View>
        <View style={styles.durationBadge} pointerEvents="none">
          <Text variant="caption" color={colors.text.inverse}>
            {formatDuration(reel.durationSeconds)}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text variant="button" color={colors.text.primary} numberOfLines={1}>
          {reel.username}
        </Text>
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {reel.team}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface.card,
    overflow: 'hidden',
    ...shadows.soft,
  },
  media: {
    width: '100%',
    height: 132,
    backgroundColor: colors.surface.chip,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(8,32,48,0.7)',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: 2,
  },
});
