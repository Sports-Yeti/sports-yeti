import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadows } from '../theme';
import { Text } from './Text';

type Variant = 'gradient' | 'solid' | 'ghost' | 'soft';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingHorizontal: 16, paddingVertical: 8 },
  md: { paddingHorizontal: 20, paddingVertical: 12 },
  lg: { paddingHorizontal: 24, paddingVertical: 16 },
};

export function Button({
  label,
  onPress,
  variant = 'gradient',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  style,
  disabled = false,
}: ButtonProps) {
  const labelColor =
    variant === 'gradient' || variant === 'solid'
      ? colors.text.inverse
      : variant === 'soft'
      ? colors.brand.deep
      : colors.brand.primary;

  const inner = (
    <View style={styles.contentRow}>
      {leadingIcon}
      <Text variant="button" color={labelColor} align="center">
        {label}
      </Text>
      {trailingIcon}
    </View>
  );

  const containerStyle: StyleProp<ViewStyle> = [
    styles.base,
    sizeStyles[size],
    fullWidth ? styles.fullWidth : null,
    disabled ? styles.disabled : null,
    style,
  ];

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <LinearGradient
          colors={[...colors.gradient.cta]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[containerStyle, shadows.soft]}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  const variantBg: ViewStyle =
    variant === 'solid'
      ? { backgroundColor: colors.brand.primary }
      : variant === 'soft'
      ? { backgroundColor: colors.brand.soft }
      : { backgroundColor: 'transparent' };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <View
        style={[
          containerStyle,
          variantBg,
          variant !== 'ghost' ? shadows.soft : null,
        ]}
      >
        {inner}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
