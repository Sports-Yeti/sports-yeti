import React from 'react';
import { type WebPressableState } from '../lib/pressable';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Text } from '../ui';

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  changePct?: number;
  onPress?: () => void;
  icon?: React.ReactNode;
  tone?: StatTone;
  /** Render a "Steady" pill instead of a trend arrow when changePct = 0. */
  steadyLabel?: string;
  style?: StyleProp<ViewStyle>;
}

type StatTone = 'brand' | 'success' | 'warning' | 'live' | 'alpine';

interface ToneStyles {
  bubbleBg: string;
  bubbleFg: string;
  blob: string;
}

// Tonal recipes — pair of muted background tints used for the icon
// bubble + the decorative atmospheric blob in the corner.
const TONE_STYLES: Record<StatTone, ToneStyles> = {
  brand: {
    bubbleBg: colors.brand.soft,
    bubbleFg: colors.brand.deep,
    blob: 'rgba(63,177,250,0.18)',
  },
  alpine: {
    bubbleBg: colors.brand.alpineSoft,
    bubbleFg: colors.brand.alpine,
    blob: 'rgba(255,135,102,0.20)',
  },
  success: {
    bubbleBg: '#E2F4E4',
    bubbleFg: colors.status.success,
    blob: 'rgba(46,125,50,0.16)',
  },
  warning: {
    bubbleBg: '#FFF1DC',
    bubbleFg: colors.status.warning,
    blob: 'rgba(178,98,0,0.18)',
  },
  live: {
    bubbleBg: '#FDE7E2',
    bubbleFg: colors.status.live,
    blob: 'rgba(171,53,18,0.18)',
  },
};

export function StatCard({
  label,
  value,
  helper,
  changePct,
  onPress,
  icon,
  tone = 'brand',
  steadyLabel,
  style,
}: StatCardProps) {
  const toneStyles = TONE_STYLES[tone];
  const isSteady = typeof changePct === 'number' && changePct === 0;
  const isUp =
    typeof changePct === 'number' && !isSteady ? changePct > 0 : null;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  const trendBg = isUp
    ? 'rgba(46,125,50,0.12)'
    : isUp === false
    ? 'rgba(171,53,18,0.12)'
    : 'transparent';
  const trendFg = isUp
    ? colors.status.success
    : isUp === false
    ? colors.status.live
    : colors.text.secondary;

  const inner = (
    <View style={[styles.card, style]}>
      {/* Atmospheric "frosty" blob in the corner — Glacier ethos §2. */}
      <View
        style={[styles.blob, { backgroundColor: toneStyles.blob }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />

      <View style={styles.headerRow}>
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
        <View style={styles.spacer} />
        {typeof changePct === 'number' ? (
          isSteady ? (
            <View style={styles.steadyPill}>
              <Text variant="caption" color={colors.text.secondary}>
                {steadyLabel ?? 'Steady'}
              </Text>
            </View>
          ) : (
            <View style={[styles.trendPill, { backgroundColor: trendBg }]}>
              <Arrow size={12} color={trendFg} strokeWidth={2.5} />
              <Text variant="caption" color={trendFg}>
                {`${isUp ? '+' : '-'}${Math.abs(changePct).toFixed(1)}%`}
              </Text>
            </View>
          )
        ) : null}
      </View>

      <View style={styles.body}>
        <Text variant="caption" color={colors.text.muted}>
          {label}
        </Text>
        <Text variant="display" color={colors.text.primary} style={styles.value}>
          {value}
        </Text>
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
    gap: spacing.lg,
    minHeight: 140,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.glow,
  },
  blob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  steadyPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.containerHigh,
  },
  body: {
    gap: spacing['2xs'],
  },
  value: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
});
