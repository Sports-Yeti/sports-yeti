import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import {
  AvatarStack,
  Button,
  Card,
  IconBadge,
  Text,
} from '../ui';
import type { DiscoverGame } from '../mocks/games';

interface EventCardProps {
  game: DiscoverGame;
  onPress?: () => void;
  onJoinPress?: () => void;
}

export function EventCard({ game, onPress, onJoinPress }: EventCardProps) {
  const Icon = game.Icon;
  const eyebrowColor = game.isLive ? colors.status.live : colors.brand.primary;
  const spotsColor =
    game.spotsLeftTone === 'warning' ? colors.status.live : colors.brand.primary;

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
              <Text variant="eyebrow" color={eyebrowColor}>
                {game.status}
              </Text>
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
          <AvatarStack
            uris={game.attendees}
            totalCount={game.attendeeTotal}
            size={32}
          />
          <View style={styles.bottomActions}>
            <Text variant="button" color={spotsColor}>
              {`${game.spotsLeft} spots left`}
            </Text>
            <Button label="Join" onPress={onJoinPress} size="sm" />
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
    gap: spacing.md,
  },
});
