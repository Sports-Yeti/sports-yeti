import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarDays, MapPin } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { Card, IconBadge, Tag, Text } from '../ui';
import { formatCurrency } from '../lib/format';
import type { DiscoverTournament } from '../mocks/tournaments';

interface TournamentCardProps {
  tournament: DiscoverTournament;
  onPress?: () => void;
}

export function TournamentCard({ tournament, onPress }: TournamentCardProps) {
  const Icon = tournament.Icon;
  const spotsLeft = Math.max(0, tournament.maxTeams - tournament.registeredTeams);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${tournament.name}, ${tournament.sport}, ${tournament.dateLabel}, ${spotsLeft} of ${tournament.maxTeams} team spots open`}
      accessibilityHint="Opens tournament details"
    >
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <IconBadge size={48} tone="brand">
              <Icon size={22} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.titleColumn}>
              <View style={styles.eyebrowRow}>
                <Text variant="eyebrow" color={colors.brand.primary}>
                  TOURNAMENT
                </Text>
                <Tag tone="info" size="sm" leadingDot label={tournament.formatLabel} />
              </View>
              <Text variant="h2" color={colors.text.primary}>
                {tournament.name}
              </Text>
            </View>
          </View>
          <View style={styles.priceColumn}>
            <Text variant="h2" color={colors.brand.primary} align="right">
              {tournament.feeCents === 0 ? 'Free' : formatCurrency(tournament.feeCents)}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary} align="right">
              per team
            </Text>
          </View>
        </View>

        <Text variant="bodySm" color={colors.text.secondary}>
          {tournament.sport} · {tournament.hostLeagueName}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarDays size={16} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary} numberOfLines={1}>
              {tournament.dateLabel} · {tournament.registrationCloses}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={16} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary} numberOfLines={1}>
              {tournament.city}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <Tag
            tone={tournament.spotsTone}
            leadingDot
            size="sm"
            label={
              spotsLeft === 0
                ? 'Registration full'
                : `${spotsLeft} of ${tournament.maxTeams} team spots`
            }
          />
          {tournament.prizeLabel ? (
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {tournament.prizeLabel}
            </Text>
          ) : null}
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
