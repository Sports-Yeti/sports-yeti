import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

export interface CardProps {
  padded?: boolean;
  interactive?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Card({
  padded = true,
  interactive = false,
  onPress,
  style,
  children,
  accessibilityLabel,
}: CardProps) {
  const baseStyle: StyleProp<ViewStyle> = [
    styles.card,
    padded ? styles.padded : null,
    style,
  ];

  if (onPress || interactive) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
        style={({ pressed, hovered }) => [
          baseStyle,
          // @ts-expect-error react-native-web exposes hovered
          hovered ? styles.hovered : null,
          pressed ? styles.pressed : null,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    ...shadows.soft,
  },
  padded: {
    padding: spacing.lg,
  },
  hovered: {
    backgroundColor: '#FAFBFD',
  },
  pressed: {
    opacity: 0.85,
  },
});
