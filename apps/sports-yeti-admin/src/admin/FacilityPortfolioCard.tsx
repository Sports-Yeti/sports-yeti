import React from 'react';
import { type WebPressableState } from '../lib/pressable';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Activity,
  Dumbbell,
  Hexagon,
  MapPin,
  MoreHorizontal,
  Plus,
  Snowflake,
  Trees,
  Volleyball,
  Waves,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Avatar, Tag, Text } from '../ui';
import {
  type Facility,
  type FacilitySpace,
  SPACE_STATUS_LABEL,
  SPACE_STATUS_TONE,
} from '../mocks/facilities';
import type { SportKey } from '../mocks/leagues';
import { formatCurrency } from '../lib/format';

interface FacilityPortfolioCardProps {
  facility: Facility;
  onPress?: () => void;
  onMore?: () => void;
  onAddSpace?: () => void;
  onSpacePress?: (space: FacilitySpace) => void;
}

/**
 * Glacier "Facilities Portfolio" card — the per-venue surface that
 * stacks vertically inside FacilityListScreen. Drawn from the Stitch
 * reference: hub label + spaces count, kebab menu, three space rows
 * with status pills, manager avatar stack, "Add Space" link.
 */
export function FacilityPortfolioCard({
  facility,
  onPress,
  onMore,
  onAddSpace,
  onSpacePress,
}: FacilityPortfolioCardProps) {
  const showSpaces = facility.spaces.slice(0, 4);
  const overflowSpaces = Math.max(0, facility.spaces.length - showSpaces.length);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${facility.name} portfolio card`}
      style={({ hovered, pressed }: WebPressableState) => [
        styles.card,
        hovered ? styles.cardHover : null,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerBody}>
          <View style={styles.titleRow}>
            <Tag
              size="sm"
              tone={facility.isActive ? 'success' : 'neutral'}
              leadingDot
              label={facility.isActive ? 'ACTIVE' : 'INACTIVE'}
            />
            <View style={styles.spacesPill}>
              <MapPin
                size={12}
                color={colors.text.muted}
                strokeWidth={2.25}
              />
              <Text variant="caption" color={colors.text.muted}>
                {facility.spaces.length}{' '}
                {facility.spaces.length === 1 ? 'space' : 'spaces'}
              </Text>
            </View>
          </View>
          <Text variant="h2" color={colors.text.primary}>
            {facility.name}
          </Text>
          <View style={styles.metaRow}>
            <MapPin
              size={12}
              color={colors.text.muted}
              strokeWidth={2.25}
            />
            <Text variant="caption" color={colors.text.muted}>
              {facility.address}
            </Text>
          </View>
          {facility.hubLabel ? (
            <Text variant="caption" color={colors.brand.primary}>
              {facility.hubLabel} · {facility.utilizationToday}% utilized today
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={(e) => {
            e?.stopPropagation?.();
            onMore?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={`More options for ${facility.name}`}
          hitSlop={6}
          style={({ hovered }: WebPressableState) => [
            styles.moreBtn,
            hovered ? styles.moreBtnHover : null,
          ]}
        >
          <MoreHorizontal
            size={16}
            color={colors.text.muted}
            strokeWidth={2.25}
          />
        </Pressable>
      </View>

      <View style={styles.spaceList}>
        {showSpaces.map((space) => (
          <SpaceRow
            key={space.id}
            space={space}
            onPress={() => onSpacePress?.(space)}
          />
        ))}
        {overflowSpaces > 0 ? (
          <Text
            variant="caption"
            color={colors.text.muted}
            style={styles.overflowLabel}
          >
            +{overflowSpaces} more {overflowSpaces === 1 ? 'space' : 'spaces'}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.avatarStack}>
          {facility.managerAvatars.slice(0, 3).map((uri, idx) => (
            <View
              key={`${facility.id}-mgr-${idx}`}
              style={[
                styles.avatarShellWrap,
                idx > 0 ? { marginLeft: -8 } : null,
              ]}
            >
              <Avatar uri={uri} size={24} />
            </View>
          ))}
          {facility.managerOverflow > 0 ? (
            <View
              style={[styles.avatarOverflow, { marginLeft: -8 }]}
              accessibilityRole="text"
              accessibilityLabel={`+${facility.managerOverflow} more managers`}
            >
              <Text variant="caption" color={colors.text.muted}>
                +{facility.managerOverflow}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={(e) => {
            e?.stopPropagation?.();
            onAddSpace?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Add a space to ${facility.name}`}
          hitSlop={6}
          style={({ hovered }: WebPressableState) => [
            styles.addSpaceBtn,
            hovered ? styles.addSpaceBtnHover : null,
          ]}
        >
          <Text variant="button" color={colors.brand.primary}>
            Add Space
          </Text>
          <Plus
            size={14}
            color={colors.brand.primary}
            strokeWidth={2.5}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

interface SpaceRowProps {
  space: FacilitySpace;
  onPress?: () => void;
}

function SpaceRow({ space, onPress }: SpaceRowProps) {
  const Icon = iconForSport(space.sportKeys[0]);
  const tone = SPACE_STATUS_TONE[space.status];
  return (
    <Pressable
      onPress={(e) => {
        e?.stopPropagation?.();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${space.name} — ${SPACE_STATUS_LABEL[space.status]}`}
      style={({ hovered }: WebPressableState) => [
        styles.spaceRow,
        hovered ? styles.spaceRowHover : null,
      ]}
    >
      <View style={styles.spaceIcon}>
        <Icon size={16} color={colors.brand.deep} strokeWidth={2.25} />
      </View>
      <View style={styles.spaceBody}>
        <Text variant="bodySm" color={colors.text.primary} weight="600">
          {space.name}
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          {space.surface}
          {space.statusDetail ? ` · ${space.statusDetail}` : ''}
        </Text>
      </View>
      <View style={styles.spaceTrailing}>
        {space.hourlyRateCents > 0 ? (
          <Text variant="caption" color={colors.text.secondary}>
            {formatCurrency(space.hourlyRateCents)}/hr
          </Text>
        ) : null}
        <Tag
          size="sm"
          tone={tone}
          leadingDot
          label={SPACE_STATUS_LABEL[space.status]}
        />
      </View>
    </Pressable>
  );
}

function iconForSport(sport: SportKey | undefined) {
  switch (sport) {
    case 'soccer':
      return Hexagon;
    case 'basketball':
      return Activity;
    case 'volleyball':
      return Volleyball;
    case 'tennis':
      return Trees;
    case 'baseball':
      return Dumbbell;
    case 'hockey':
      return Snowflake;
    default:
      return Waves;
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.cardLg,
    padding: spacing.xl,
    gap: spacing.lg,
    overflow: 'hidden',
    ...shadows.glow,
  },
  cardHover: {
    transform: [{ translateY: -2 }],
  },
  cardPressed: {
    opacity: 0.94,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerBody: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spacesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.containerHigh,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtnHover: {
    backgroundColor: colors.surface.containerHigh,
  },
  spaceList: {
    gap: spacing.sm,
  },
  overflowLabel: {
    paddingTop: spacing['2xs'],
    paddingHorizontal: spacing.md,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.containerLow,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    minHeight: 56,
  },
  spaceRowHover: {
    backgroundColor: colors.surface.containerHigh,
  },
  spaceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  spaceTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarShellWrap: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.surface.card,
  },
  avatarOverflow: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 2,
    borderColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSpaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  addSpaceBtnHover: {
    backgroundColor: colors.brand.soft,
  },
});
