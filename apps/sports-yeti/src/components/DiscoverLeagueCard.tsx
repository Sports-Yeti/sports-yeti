import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarDays, MapPin, Share2 } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { Button, Card, IconBadge, Tag, Text } from '../ui';
import { formatCurrency } from '../lib/format';
import type { OpenLeague } from '../mocks/teams';

interface DiscoverLeagueCardProps {
  league: OpenLeague;
  onPress?: () => void;
  onSharePress?: () => void;
}

export function DiscoverLeagueCard({
  league,
  onPress,
  onSharePress,
}: DiscoverLeagueCardProps) {
  const Icon = league.Icon;
  const spotsLeft = Math.max(0, league.maxTeams - league.registeredTeams);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <IconBadge size={48} tone="brand">
              <Icon size={22} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.titleColumn}>
              <View style={styles.eyebrowRow}>
                <Text variant="eyebrow" color={colors.brand.primary}>
                  LEAGUE
                </Text>
                <Tag tone="info" size="sm" leadingDot label={league.level} />
              </View>
              <Text variant="h2" color={colors.text.primary}>
                {league.name}
              </Text>
            </View>
          </View>
          <View style={styles.priceColumn}>
            <Text variant="h2" color={colors.brand.primary} align="right">
              {league.feeCents === 0 ? 'Free' : formatCurrency(league.feeCents)}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary} align="right">
              per team
            </Text>
          </View>
        </View>

        <Text variant="bodySm" color={colors.text.secondary}>
          {league.sport}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarDays size={16} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary} numberOfLines={1}>
              {league.startDate.replace('Starts ', '')} · {league.registrationCloses}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={16} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary} numberOfLines={1}>
              {league.city}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <Tag
            tone={league.spotsTone}
            leadingDot
            size="sm"
            label={`${spotsLeft} of ${league.maxTeams} team spots`}
          />
          <Button
            label="Share with team"
            onPress={onSharePress}
            size="sm"
            variant="gradient"
            leadingIcon={
              <Share2 size={15} color={colors.text.inverse} strokeWidth={2.5} />
            }
          />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
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
    flexWrap: 'wrap',
  },
});
