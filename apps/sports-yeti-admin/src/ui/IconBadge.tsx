import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii } from '../theme';

export interface IconBadgeProps {
  size?: number;
  tone?: 'brand' | 'soft' | 'neutral' | 'success' | 'warning' | 'live';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const TONE_BG = {
  brand: colors.brand.primary,
  soft: colors.brand.soft,
  neutral: colors.surface.chip,
  success: '#E2F4E4',
  warning: '#FFF1DC',
  live: '#FDE7E2',
} as const;

export function IconBadge({
  size = 36,
  tone = 'soft',
  style,
  children,
}: IconBadgeProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size <= 24 ? radii.sm : radii.md,
          backgroundColor: TONE_BG[tone],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
