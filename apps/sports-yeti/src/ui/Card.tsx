import React from 'react';
import {
  View,
  StyleSheet,
  type ViewProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

interface CardProps extends ViewProps {
  glow?: boolean;
  padded?: boolean;
  radius?: 'lg' | 'card' | 'cardLg';
  style?: StyleProp<ViewStyle>;
}

export function Card({
  glow = false,
  padded = true,
  radius = 'cardLg',
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        { borderRadius: radii[radius] },
        padded && styles.padded,
        shadows.card,
        style,
      ]}
    >
      {glow ? <View pointerEvents="none" style={styles.glow} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface.card,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.xl,
  },
  glow: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(63,177,250,0.2)',
  },
});
