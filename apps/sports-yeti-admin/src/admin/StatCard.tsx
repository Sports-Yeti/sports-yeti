import React from 'react';
import { type WebPressableState } from '../lib/pressable';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Text } from '../ui';

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  changePct?: number;
  /**
   * Render a "Steady" pill instead of a trend arrow when changePct = 0.
   * Optional override of the steady label (default: "Steady").
   */
  steadyLabel?: string;
  /**
   * Free-form trend descriptor that renders below the value
   * (e.g. "+3 from last season", "85% of projected total").
   * Used when changePct is not numeric or when a sparkline is more
   * meaningful than a percentage.
   */
  trendCopy?: string;
  /**
   * Renders a horizontal mini progress bar under the value
   * (0-1). Surfaces "X% to goal" semantically.
   */
  progress?: number;
  onPress?: () => void;
  icon?: React.ReactNode;
  tone?: StatTone;
  /**
   * Adds a left-edge alpine-orange stripe — used for urgent /
   * attention-required cards (Glacier ethos: tertiary container).
   */
  urgent?: boolean;
  style?: StyleProp<ViewStyle>;
}

type StatTone = 'brand' | 'success' | 'warning' | 'live' | 'alpine' | 'neutral';

interface ToneStyles {
  bubbleBg: string;
  bubbleFg: string;
  blobOuter: string;
  blobInner: string;
  valueColor: string;
  progressFg: string;
}

// Tonal recipes — pair of muted background tints used for the icon
// bubble + the decorative atmospheric blob in the corner.
const TONE_STYLES: Record<StatTone, ToneStyles> = {
  brand: {
    bubbleBg: colors.surface.containerLow,
    bubbleFg: colors.brand.primary,
    blobOuter: 'rgba(63,177,250,0.20)',
    blobInner: 'rgba(63,177,250,0.30)',
    valueColor: colors.brand.primary,
    progressFg: colors.brand.primary,
  },
  alpine: {
    bubbleBg: colors.surface.containerLow,
    bubbleFg: colors.brand.alpine,
    blobOuter: 'rgba(255,135,102,0.22)',
    blobInner: 'rgba(255,135,102,0.32)',
    valueColor: colors.brand.alpine,
    progressFg: colors.brand.alpine,
  },
  success: {
    bubbleBg: colors.surface.containerLow,
    bubbleFg: colors.status.success,
    blobOuter: 'rgba(46,125,50,0.16)',
    blobInner: 'rgba(46,125,50,0.24)',
    valueColor: colors.status.success,
    progressFg: colors.status.success,
  },
  warning: {
    bubbleBg: colors.surface.containerLow,
    bubbleFg: colors.status.warning,
    blobOuter: 'rgba(178,98,0,0.18)',
    blobInner: 'rgba(178,98,0,0.26)',
    valueColor: colors.status.warning,
    progressFg: colors.status.warning,
  },
  live: {
    bubbleBg: colors.surface.containerLow,
    bubbleFg: colors.status.live,
    blobOuter: 'rgba(171,53,18,0.18)',
    blobInner: 'rgba(171,53,18,0.26)',
    valueColor: colors.status.live,
    progressFg: colors.status.live,
  },
  neutral: {
    bubbleBg: colors.surface.containerLow,
    bubbleFg: colors.text.primary,
    blobOuter: 'rgba(15,23,42,0.06)',
    blobInner: 'rgba(15,23,42,0.10)',
    valueColor: colors.text.primary,
    progressFg: colors.text.primary,
  },
};

export function StatCard({
  label,
  value,
  helper,
  changePct,
  steadyLabel,
  trendCopy,
  progress,
  onPress,
  icon,
  tone = 'brand',
  urgent = false,
  style,
}: StatCardProps) {
  const toneStyles = TONE_STYLES[tone];
  const isSteady = typeof changePct === 'number' && changePct === 0;
  const isUp = typeof changePct === 'number' && !isSteady ? changePct > 0 : null;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  const trendFg = isUp
    ? colors.status.success
    : isUp === false
    ? colors.status.live
    : colors.text.secondary;

  const inner = (
    <View
      style={[styles.card, urgent ? styles.cardUrgent : null, style]}
    >
      {/*
        Two stacked blobs — outer larger + softer, inner smaller + brighter.
        Approximates CSS `blur-xl` on a single circle. RN ignores `filter`
        so we fake the soft glow with overlapping translucent disks.
      */}
      <View
        style={[styles.blobOuter, { backgroundColor: toneStyles.blobOuter }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <View
        style={[styles.blobInner, { backgroundColor: toneStyles.blobInner }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />

      <View style={styles.headerRow}>
        <View style={styles.labelStack}>
          <Text variant="eyebrow" color={colors.text.secondary}>
            {label}
          </Text>
          <Text
            variant="display"
            color={toneStyles.valueColor}
            style={styles.value}
          >
            {value}
          </Text>
        </View>
        {icon ? (
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: toneStyles.bubbleBg },
            ]}
          >
            {icon}
          </View>
        ) : null}
      </View>

      {typeof progress === 'number' ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(0, Math.min(100, progress * 100))}%`,
                backgroundColor: toneStyles.progressFg,
              },
            ]}
          />
        </View>
      ) : null}

      <View style={styles.footerRow}>
        {typeof changePct === 'number' ? (
          isSteady ? (
            <View style={styles.steadyPill}>
              <Text variant="caption" color={colors.text.secondary}>
                {steadyLabel ?? 'Steady'}
              </Text>
            </View>
          ) : (
            <View style={styles.trendChange}>
              <Arrow size={14} color={trendFg} strokeWidth={2.5} />
              <Text variant="caption" color={trendFg} weight="600">
                {`${isUp ? '+' : '-'}${Math.abs(changePct).toFixed(1)}%`}
              </Text>
            </View>
          )
        ) : trendCopy ? (
          <View style={styles.trendChange}>
            <TrendingUp size={14} color={toneStyles.progressFg} strokeWidth={2.5} />
            <Text variant="caption" color={toneStyles.progressFg} weight="600">
              {trendCopy.split(' ')[0]}
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              {trendCopy.split(' ').slice(1).join(' ')}
            </Text>
          </View>
        ) : null}
        {helper ? (
          <Text variant="caption" color={colors.text.muted}>
            {helper}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ hovered, pressed }: WebPressableState) => [
          styles.pressable,
          hovered ? styles.pressableHover : null,
          pressed ? styles.pressablePressed : null,
        ]}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radii.cardLg,
  },
  pressableHover: {
    transform: [{ translateY: -2 }],
  },
  pressablePressed: {
    opacity: 0.92,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.cardLg,
    padding: spacing.xl,
    gap: spacing.md,
    minHeight: 152,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.glow,
  },
  cardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand.alpine,
  },
  // Outer atmospheric blob — large, soft, faint.
  blobOuter: {
    position: 'absolute',
    top: -56,
    right: -56,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  // Inner blob — slightly smaller, slightly brighter — overlaps to
  // simulate a CSS `blur-xl` halo on web.
  blobInner: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  labelStack: {
    flex: 1,
    gap: spacing['2xs'],
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface.containerHigh,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  steadyPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.containerHigh,
  },
});
