import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { Button, Card, IconBadge, Text } from '../ui';
import type { Squad, TeamLevel } from '../mocks/teams';

const LEVEL_LABEL: Record<TeamLevel, string> = {
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  RECREATIONAL: 'RECREATIONAL',
};

const LEVEL_TONE: Record<
  TeamLevel,
  { bg: string; fg: string }
> = {
  INTERMEDIATE: { bg: '#FEF3C7', fg: '#92400E' },
  ADVANCED: { bg: '#DCFCE7', fg: '#166534' },
  RECREATIONAL: { bg: '#E0F2FE', fg: '#075985' },
};

interface SquadCardProps {
  squad: Squad;
  onPress?: () => void;
  onApply?: () => void;
}

export function SquadCard({ squad, onPress, onApply }: SquadCardProps) {
  const Icon = squad.Icon;
  const tone = LEVEL_TONE[squad.level];

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <IconBadge size={48}>
              <Icon size={22} color={colors.brand.primary} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.titleColumn}>
              <Text variant="h2" color={colors.text.primary}>
                {squad.name}
              </Text>
              <View style={styles.metaRow}>
                <MapPin
                  size={14}
                  color={colors.text.secondary}
                  strokeWidth={2.25}
                />
                <Text variant="bodySm" color={colors.text.secondary}>
                  {squad.location}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[styles.levelChip, { backgroundColor: tone.bg }]}
          >
            <Text variant="eyebrow" color={tone.fg}>
              {LEVEL_LABEL[squad.level]}
            </Text>
          </View>
        </View>

        <View style={styles.sportRow}>
          <Text variant="bodySm" color={colors.brand.primary}>
            {squad.sport}
          </Text>
        </View>

        <View style={styles.needsBlock}>
          <Text variant="eyebrow" color={colors.text.muted}>
            Needs
          </Text>
          {squad.needs.map((need) => (
            <View style={styles.needRow} key={need.label}>
              <View style={styles.needDot} />
              <Text variant="bodySm" color={colors.text.primary}>
                {need.label}
                {need.urgent ? (
                  <Text variant="bodySm" color={colors.status.live}>
                    {'  (Urgent)'}
                  </Text>
                ) : null}
              </Text>
            </View>
          ))}
          {squad.helper ? (
            <Text variant="caption" color={colors.text.secondary}>
              {squad.helper}
            </Text>
          ) : null}
        </View>

        <Button
          label="Apply to Team"
          variant="gradient"
          fullWidth
          size="md"
          onPress={onApply}
          trailingIcon={
            <ChevronRight
              size={16}
              color={colors.text.inverse}
              strokeWidth={2.5}
            />
          }
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  sportRow: {
    paddingTop: 0,
  },
  needsBlock: {
    backgroundColor: colors.surface.bg,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 6,
  },
  needRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  needDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.accent,
  },
});
