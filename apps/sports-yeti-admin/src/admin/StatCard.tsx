import React from 'react';
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
  tone?: 'brand' | 'success' | 'warning' | 'live';
  style?: StyleProp<ViewStyle>;
}

const TONE_BG = {
  brand: colors.brand.soft,
  success: '#E2F4E4',
  warning: '#FFF1DC',
  live: '#FDE7E2',
} as const;

export function StatCard({
  label,
  value,
  helper,
  changePct,
  onPress,
  icon,
  tone = 'brand',
  style,
}: StatCardProps) {
  const isUp = typeof changePct === 'number' ? changePct >= 0 : null;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  const changeColor =
    isUp === null
      ? colors.text.muted
      : isUp
      ? colors.status.success
      : colors.status.live;

  const inner = (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text variant="caption" color={colors.text.muted}>
          {label}
        </Text>
        {icon ? (
          <View style={[styles.iconBubble, { backgroundColor: TONE_BG[tone] }]}>
            {icon}
          </View>
        ) : null}
      </View>
      <Text variant="display" color={colors.text.primary} style={styles.value}>
        {value}
      </Text>
      <View style={styles.footerRow}>
        {typeof changePct === 'number' ? (
          <View style={styles.changeRow}>
            <Arrow size={12} color={changeColor} strokeWidth={2.5} />
            <Text variant="caption" color={changeColor}>
              {Math.abs(changePct).toFixed(1)}%
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
        style={({ hovered }) => [
          styles.pressable,
          // @ts-expect-error rn-web hovered
          hovered ? styles.pressableHover : null,
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
    borderRadius: radii.card,
  },
  pressableHover: {
    opacity: 0.92,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    padding: spacing.lg,
    gap: spacing.sm,
    minHeight: 120,
    ...shadows.soft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
