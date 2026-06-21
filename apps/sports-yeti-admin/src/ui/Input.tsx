import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { fontFamilies } from '../theme/typography';
import { Text } from './Text';

export type InputVariant = 'text' | 'email' | 'password' | 'number' | 'multiline' | 'search';
export type InputSize = 'sm' | 'md';

export interface InputProps
  extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label?: string;
  helpText?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

const HEIGHTS: Record<InputSize, number> = {
  sm: 32,
  md: 38,
};

function variantDefaults(variant: InputVariant): Partial<TextInputProps> {
  if (variant === 'email')
    return {
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      autoCorrect: false,
      textContentType: 'emailAddress',
    };
  if (variant === 'password')
    return {
      secureTextEntry: true,
      autoCapitalize: 'none',
      autoCorrect: false,
      textContentType: 'password',
    };
  if (variant === 'number') return { keyboardType: 'numeric' };
  if (variant === 'multiline') return { multiline: true, textAlignVertical: 'top' };
  if (variant === 'search') return { autoCapitalize: 'none', autoCorrect: false };
  return {};
}

export const Input = forwardRef<InputRef, InputProps>(function Input(
  {
    label,
    helpText,
    error,
    variant = 'text',
    size = 'md',
    leadingIcon,
    trailingIcon,
    disabled = false,
    containerStyle,
    onFocus,
    onBlur,
    accessibilityLabel,
    accessibilityHint,
    placeholder,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
  }));

  const variantProps = variantDefaults(variant);
  const isPassword = variant === 'password';
  const isMultiline = variant === 'multiline';

  const borderColor = error
    ? colors.status.error
    : focused
    ? colors.brand.primary
    : colors.border.strong;

  const computedTrailing = isPassword ? (
    <Pressable
      onPress={() => setShowPassword((v) => !v)}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <EyeOff size={16} color={colors.text.secondary} strokeWidth={2.25} />
      ) : (
        <Eye size={16} color={colors.text.secondary} strokeWidth={2.25} />
      )}
    </Pressable>
  ) : (
    trailingIcon
  );

  const minHeight = isMultiline ? HEIGHTS[size] * 2.4 : HEIGHTS[size];

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text variant="caption" color={colors.text.secondary} style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          { borderColor, minHeight },
          isMultiline ? styles.fieldMultiline : null,
          disabled ? styles.fieldDisabled : null,
        ]}
      >
        {leadingIcon ? <View style={styles.iconSlot}>{leadingIcon}</View> : null}

        <TextInput
          ref={inputRef}
          {...variantProps}
          {...rest}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          secureTextEntry={isPassword && !showPassword}
          style={[styles.input, isMultiline ? styles.inputMultiline : null]}
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
          accessibilityHint={accessibilityHint ?? helpText}
          accessibilityState={{ disabled }}
        />

        {computedTrailing ? <View style={styles.iconSlot}>{computedTrailing}</View> : null}
      </View>

      {error ? (
        <Text
          variant="caption"
          color={colors.status.error}
          style={styles.helpText}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : helpText ? (
        <Text variant="caption" color={colors.text.muted} style={styles.helpText}>
          {helpText}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs,
  },
  label: {
    marginBottom: spacing['2xs'],
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  fieldMultiline: {
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  fieldDisabled: {
    backgroundColor: colors.surface.chipMuted,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: fontFamilies.body,
    fontSize: 14,
    paddingVertical: 0,
    // remove default web outline; focus state handled via container border
    outlineStyle: 'none' as never,
  },
  inputMultiline: {
    paddingTop: 4,
    minHeight: 72,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    marginTop: spacing['2xs'],
  },
});
