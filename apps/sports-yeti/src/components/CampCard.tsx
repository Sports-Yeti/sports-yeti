import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarDays, MapPin, Users } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { Avatar, Button, Card, IconBadge, Tag, Text } from '../ui';
import { SKILL_LABELS, sportLabel } from '../mocks/games';
import { formatCurrency } from '../lib/format';
import type { DiscoverCamp } from '../mocks/camps';

interface CampCardProps {
  camp: DiscoverCamp;
  onPress?: () => void;
  onRegisterPress?: () => void;
}

export function CampCard({ camp, onPress, onRegisterPress }: CampCardProps) {
  const Icon = camp.Icon;
  const sport = sportLabel(camp.sport);
  const isClosed = camp.status === 'closed';
  const spotsLeft = Math.max(0, camp.capacity - camp.registered);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <IconBadge size={48}>
              <Icon size={22} color={colors.brand.primary} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.titleColumn}>
              <View style={styles.eyebrowRow}>
                <Tag tone="brand" size="sm" label="Camp" />
                {sport ? (
                  <Tag tone="info" size="sm" leadingDot label={sport} />
                ) : null}
                {isClosed ? (
                  <Tag tone="neutral" size="sm" label="Full" />
                ) : null}
              </View>
              <Text variant="h2" color={colors.text.primary}>
                {camp.title}
              </Text>
            </View>
          </View>
          <View style={styles.priceColumn}>
            <Text variant="h2" color={colors.brand.primary} align="right">
              {camp.feeCents === 0 ? 'Free' : formatCurrency(camp.feeCents)}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary} align="right">
              {camp.ageGroup}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarDays size={16} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary} numberOfLines={1}>
              {camp.dateLabel}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={16} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary} numberOfLines={1}>
              {camp.city}
            </Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          <Tag tone="info" size="sm" label={SKILL_LABELS[camp.skillLevel]} />
          <Tag tone="neutral" size="sm" label={camp.sessionsLabel} />
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View style={styles.organizer}>
            <Avatar uri={camp.organizerAvatar} initials={camp.organizer.charAt(0)} size={28} />
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {camp.organizer}
            </Text>
          </View>
          <View style={styles.bottomActions}>
            <View style={styles.spots}>
              <Users
                size={13}
                color={camp.spotsTone === 'warning' ? colors.status.live : colors.text.muted}
                strokeWidth={2.5}
              />
              <Text
                variant="caption"
                color={camp.spotsTone === 'warning' ? colors.status.live : colors.text.muted}
              >
                {isClosed ? 'Waitlist' : `${spotsLeft} left`}
              </Text>
            </View>
            <Button
              label={isClosed ? 'Join waitlist' : 'Register'}
              onPress={onRegisterPress}
              size="sm"
              variant={isClosed ? 'soft' : 'gradient'}
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
