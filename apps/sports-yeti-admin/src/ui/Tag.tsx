import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme';
import { Text } from './Text';

export type TagTone =
  | 'neutral'
  | 'brand'
  | 'live'
  | 'success'
  | 'warning'
  | 'info'
  | 'error'
  | 'alpine';

export type TagSize = 'sm' | 'md';

export interface TagProps {
  label: string;
  tone?: TagTone;
  size?: TagSize;
  leadingDot?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const TONE_BG: Record<TagTone, string> = {
  neutral: colors.surface.chip,
  brand: colors.brand.soft,
  live: '#FDE7E2',
  success: '#E2F4E4',
  warning: '#FFF1DC',
  info: '#E0F2FE',
  error: '#FDE7E2',
  alpine: colors.brand.alpineSoft,
};

const TONE_FG: Record<TagTone, string> = {
  neutral: colors.text.secondary,
  brand: colors.brand.deep,
  live: colors.status.live,
  success: colors.status.success,
  warning: colors.status.warning,
  info: colors.brand.deep,
  error: colors.status.error,
  alpine: colors.brand.alpine,
};

const TONE_DOT: Record<TagTone, string> = {
  neutral: colors.text.muted,
  brand: colors.brand.primary,
  live: colors.status.live,
  success: colors.status.success,
  warning: colors.status.warning,
  info: colors.brand.primary,
  error: colors.status.error,
  alpine: colors.brand.alpine,
};

const SIZE: Record<
  TagSize,
  { paddingX: number; paddingY: number; variant: 'caption' | 'button' }
> = {
  sm: { paddingX: spacing.sm, paddingY: 2, variant: 'caption' },
  md: { paddingX: spacing.md, paddingY: 4, variant: 'button' },
};

export function Tag({
  label,
  tone = 'neutral',
  size = 'sm',
  leadingDot = false,
  icon,
  style,
}: TagProps) {
  const sz = SIZE[size];
  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.base,
        {
          backgroundColor: TONE_BG[tone],
          paddingHorizontal: sz.paddingX,
          paddingVertical: sz.paddingY,
        },
        style,
      ]}
    >
      {leadingDot ? (
        <View style={[styles.dot, { backgroundColor: TONE_DOT[tone] }]} />
      ) : null}
      {icon ? <View>{icon}</View> : null}
      <Text variant={sz.variant} color={TONE_FG[tone]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: radii.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
