import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme';
import { Text } from './Text';

export type TagTone = 'neutral' | 'brand' | 'live' | 'success' | 'warning' | 'info';
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
};

const TONE_FG: Record<TagTone, string> = {
  neutral: colors.text.secondary,
  brand: colors.brand.deep,
  live: colors.status.live,
  success: '#2E7D32',
  warning: '#B26200',
  info: colors.brand.deep,
};

const TONE_DOT: Record<TagTone, string> = {
  neutral: colors.text.muted,
  brand: colors.brand.primary,
  live: colors.status.live,
  success: '#2E7D32',
  warning: '#B26200',
  info: colors.brand.primary,
};

export function Tag({
  label,
  tone = 'neutral',
  size = 'md',
  leadingDot = false,
  icon,
  style,
}: TagProps) {
  const sizing = SIZE_STYLES[size];

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.base,
        sizing.container,
        { backgroundColor: TONE_BG[tone] },
        style,
      ]}
    >
      {leadingDot ? (
        <View style={[styles.dot, { backgroundColor: TONE_DOT[tone] }]} />
      ) : null}
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text variant={size === 'sm' ? 'caption' : 'button'} color={TONE_FG[tone]}>
        {label}
      </Text>
    </View>
  );
}

const SIZE_STYLES: Record<TagSize, { container: ViewStyle }> = {
  sm: {
    container: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radii.sm,
    },
  },
  md: {
    container: {
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: radii.pill,
    },
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
