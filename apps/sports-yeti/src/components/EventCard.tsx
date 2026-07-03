import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Clock, Eye, EyeOff, MapPin } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import {
  Button,
  Card,
  IconBadge,
  Tag,
  Text,
  useToast,
} from '../ui';
import {
  EVENT_TYPE_LABEL,
  sportLabel,
  type DiscoverEventType,
  type DiscoverGame,
} from '../mocks/games';
import { useWatchStore } from '../stores';

/** Tag tone per event kind — mirrors the Schedule screen convention. */
const EVENT_TYPE_TONE: Record<DiscoverEventType, 'brand' | 'warning'> = {
  game: 'brand',
  scrimmage: 'warning',
};

interface EventCardProps {
  game: DiscoverGame;
  onPress?: () => void;
  onJoinPress?: () => void;
}

export function EventCard({ game, onPress, onJoinPress }: EventCardProps) {
  const Icon = game.Icon;
  const toast = useToast();
  const watching = useWatchStore((s) => s.watchedIds.has(game.id));
  const toggleWatch = useWatchStore((s) => s.toggle);
  const eyebrowColor = game.isLive ? colors.status.live : colors.brand.primary;
  const spotsColor =
    game.spotsLeftTone === 'warning' ? colors.status.live : colors.brand.primary;
  const sport = sportLabel(game.sport);
  const isClosed = game.openStatus === 'closed';
  const watcherCount = game.watcherCount + (watching ? 1 : 0);

  const handleWatch = useCallback(() => {
    Haptics.selectionAsync();
    const nowWatching = toggleWatch(game.id);
    toast.show({
      variant: nowWatching ? 'success' : 'info',
      title: nowWatching
        ? `Watching ${game.title}`
        : `Stopped watching ${game.title}`,
      description: nowWatching
        ? 'We’ll ping you when spots open or details change.'
        : undefined,
    });
  }, [game.id, game.title, toast, toggleWatch]);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card glow={game.featured} style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <IconBadge size={48}>
              <Icon
                size={22}
                color={colors.brand.primary}
                strokeWidth={2.25}
              />
            </IconBadge>
            <View style={styles.titleColumn}>
              <View style={styles.eyebrowRow}>
                <Text variant="eyebrow" color={eyebrowColor}>
                  {game.status}
                </Text>
                <Tag
                  tone={EVENT_TYPE_TONE[game.eventType]}
                  size="sm"
                  label={EVENT_TYPE_LABEL[game.eventType]}
                />
                {sport ? (
                  <Tag tone="info" size="sm" leadingDot label={sport} />
                ) : null}
                {isClosed ? (
                  <Tag tone="neutral" size="sm" label="Closed" />
                ) : null}
              </View>
              <Text variant="h2" color={colors.text.primary}>
                {game.title}
              </Text>
            </View>
          </View>
          <View style={styles.priceColumn}>
            <Text variant="h2" color={colors.brand.primary} align="right">
              {game.price}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary} align="right">
              {game.distance}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={16} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary}>
              {game.time}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={16} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary} numberOfLines={1}>
              {game.location}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: watching }}
            accessibilityLabel={
              watching
                ? `Stop watching ${game.title}, ${watcherCount} watching`
                : `Watch ${game.title}, ${watcherCount} watching`
            }
            hitSlop={8}
            onPress={handleWatch}
            style={({ pressed }) => [
              styles.watchPill,
              watching ? styles.watchPillOn : null,
              pressed ? styles.pressed : null,
            ]}
          >
            {watching ? (
              <Eye
                size={16}
                color={colors.brand.primary}
                strokeWidth={2.5}
              />
            ) : (
              <EyeOff
                size={16}
                color={colors.text.secondary}
                strokeWidth={2.5}
              />
            )}
            <Text
              variant="button"
              color={watching ? colors.brand.primary : colors.text.secondary}
            >
              {watcherCount}
            </Text>
          </Pressable>
          <View style={styles.bottomActions}>
            <Text variant="button" color={isClosed ? colors.text.muted : spotsColor}>
              {isClosed ? 'No spots' : `${game.spotsLeft} spots left`}
            </Text>
            <Button
              label={isClosed ? 'Closed' : 'Join'}
              onPress={onJoinPress}
              size="sm"
              disabled={isClosed}
              variant={isClosed ? 'ghost' : 'gradient'}
            />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  titleColumn: {
    flex: 1,
    gap: 4,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  priceColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.soft,
    width: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  watchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.chip,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  watchPillOn: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  pressed: {
    opacity: 0.8,
  },
});
