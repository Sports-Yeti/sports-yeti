import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme';
import { type WebPressableState } from '../lib/pressable';
import { Text } from './Text';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'destructive' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  sm: 32,
  md: 38,
  lg: 44,
};

const SIZE_PAD: Record<ButtonSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

const VARIANT_BG: Record<ButtonVariant, string> = {
  solid: colors.brand.primary,
  outline: 'transparent',
  ghost: 'transparent',
  destructive: colors.status.error,
  subtle: colors.brand.soft,
};

const VARIANT_FG: Record<ButtonVariant, string> = {
  solid: colors.text.inverse,
  outline: colors.brand.primary,
  ghost: colors.brand.primary,
  destructive: colors.text.inverse,
  subtle: colors.brand.deep,
};

const VARIANT_BORDER: Record<ButtonVariant, string> = {
  solid: colors.brand.primary,
  outline: colors.border.strong,
  ghost: 'transparent',
  destructive: colors.status.error,
  subtle: colors.brand.soft,
};

export function Button({
  label,
  onPress,
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const fg = VARIANT_FG[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed, hovered }: WebPressableState) => [
        styles.base,
        {
          height: SIZE_HEIGHT[size],
          paddingHorizontal: SIZE_PAD[size],
          backgroundColor: VARIANT_BG[variant],
          borderColor: VARIANT_BORDER[variant],
        },
        fullWidth ? styles.fullWidth : null,
        hovered && !isDisabled ? styles.hovered : null,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <View style={styles.row}>
          {leadingIcon ? <View style={styles.iconSlot}>{leadingIcon}</View> : null}
          <Text variant="button" color={fg}>
            {label}
          </Text>
          {trailingIcon ? <View style={styles.iconSlot}>{trailingIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  hovered: {
    opacity: 0.92,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
