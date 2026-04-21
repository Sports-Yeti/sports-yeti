import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Lock,
  MapPin,
  Users,
} from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { Button, Card, IconBadge, Tag, Text } from '../ui';
import { formatCurrency } from '../lib/format';
import type { Membership, Squad, TeamLevel } from '../mocks/teams';

const LEVEL_LABEL: Record<TeamLevel, string> = {
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  RECREATIONAL: 'RECREATIONAL',
};

const LEVEL_TONE: Record<TeamLevel, { bg: string; fg: string }> = {
  INTERMEDIATE: { bg: '#FEF3C7', fg: '#92400E' },
  ADVANCED: { bg: '#DCFCE7', fg: '#166534' },
  RECREATIONAL: { bg: '#E0F2FE', fg: '#075985' },
};

const MEMBERSHIP_TAG: Record<
  Exclude<Membership, 'none'>,
  { tone: 'brand' | 'success' | 'warning'; label: string; Icon: typeof Crown }
> = {
  captain: { tone: 'brand', label: 'You captain', Icon: Crown },
  member: { tone: 'success', label: 'Joined', Icon: CheckCircle2 },
  pending: { tone: 'warning', label: 'Application pending', Icon: Clock },
};

interface SquadCardProps {
  squad: Squad;
  /** Visual + CTA emphasis. `mine` removes the apply button and surfaces role. */
  variant?: 'discover' | 'mine';
  /** Show a small lock icon when the user must pay before chatting. */
  chatLocked?: boolean;
  onPress?: () => void;
  onApply?: () => void;
}

function CostTag({ squad }: { squad: Squad }) {
  if (squad.costMode === 'free') {
    return <Tag tone="success" size="sm" label="Free" />;
  }
  return (
    <Tag
      tone="info"
      size="sm"
      label={`${formatCurrency(squad.perPlayerCents)} / player`}
    />
  );
}

export function SquadCard({
  squad,
  variant = 'discover',
  chatLocked,
  onPress,
  onApply,
}: SquadCardProps) {
  const Icon = squad.Icon;
  const tone = LEVEL_TONE[squad.level];
  const isMine = variant === 'mine';
  const membershipTag =
    squad.membership !== 'none' ? MEMBERSHIP_TAG[squad.membership] : null;
  const rosterPct = Math.min(1, squad.rosterCount / squad.rosterMax);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${squad.name}, ${squad.sport}, ${squad.location}`}
    >
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <IconBadge size={48}>
              <Icon size={22} color={colors.brand.primary} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.titleColumn}>
              <View style={styles.titleLine}>
                <Text variant="h2" color={colors.text.primary} style={styles.titleText}>
                  {squad.name}
                </Text>
                {chatLocked ? (
                  <Lock size={14} color={colors.text.muted} strokeWidth={2.25} />
                ) : null}
              </View>
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
          <View style={[styles.levelChip, { backgroundColor: tone.bg }]}>
            <Text variant="eyebrow" color={tone.fg}>
              {LEVEL_LABEL[squad.level]}
            </Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          <Text variant="bodySm" color={colors.brand.primary} style={styles.sportText}>
            {squad.sport}
          </Text>
          <CostTag squad={squad} />
          {membershipTag ? (
            <Tag tone={membershipTag.tone} size="sm" label={membershipTag.label} />
          ) : null}
        </View>

        <View style={styles.rosterRow}>
          <Users size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {squad.rosterCount} / {squad.rosterMax} on roster
          </Text>
          <View style={styles.rosterBar}>
            <View style={[styles.rosterFill, { width: `${rosterPct * 100}%` }]} />
          </View>
        </View>

        {!isMine && squad.needs.length > 0 ? (
          <View style={styles.needsBlock}>
            <Text variant="eyebrow" color={colors.text.muted}>
              Open positions
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
          </View>
        ) : null}

        {isMine ? (
          <Button
            label="Open team"
            variant="soft"
            fullWidth
            size="md"
            onPress={onPress}
            trailingIcon={
              <ChevronRight
                size={16}
                color={colors.brand.deep}
                strokeWidth={2.5}
              />
            }
          />
        ) : (
          <Button
            label={
              squad.membership === 'pending'
                ? 'Application pending'
                : 'Apply to Team'
            }
            variant={squad.membership === 'pending' ? 'soft' : 'gradient'}
            fullWidth
            size="md"
            disabled={squad.membership === 'pending'}
            onPress={onApply}
            trailingIcon={
              squad.membership === 'pending' ? undefined : (
                <ChevronRight
                  size={16}
                  color={colors.text.inverse}
                  strokeWidth={2.5}
                />
              )
            }
          />
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
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
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  titleText: {
    flexShrink: 1,
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
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sportText: {
    marginRight: spacing.xs,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rosterBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface.chip,
    overflow: 'hidden',
  },
  rosterFill: {
    height: '100%',
    backgroundColor: colors.brand.accent,
    borderRadius: 3,
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
