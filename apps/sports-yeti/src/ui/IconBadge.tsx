import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, shadows } from '../theme';

interface IconBadgeProps {
  size?: number;
  children: React.ReactNode;
  tone?: 'soft' | 'brand';
  style?: StyleProp<ViewStyle>;
}

export function IconBadge({
  size = 48,
  children,
  tone = 'soft',
  style,
}: IconBadgeProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radii.chip,
          backgroundColor:
            tone === 'soft' ? colors.surface.bg : colors.brand.soft,
        },
        shadows.soft,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
});
