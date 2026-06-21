import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ControlShell, useControlDims, type ControlSize } from './control-shell';

export type InputVariant =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'search';

export type { ControlSize as InputSize };

export interface InputProps
  extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  /** Optional standalone label. Ignored when wrapped in <FormField>. */
  label?: string;
  /** Optional standalone help text. Ignored when wrapped in <FormField>. */
  helpText?: string;
  /** Optional standalone error. Ignored when wrapped in <FormField>. */
  error?: string;
  /** Keyboard / autofill defaults: text/email/phone/url/search. For
   *  password, use <PasswordInput>. For numbers, use <NumberInput>.
   *  For multiline, use <TextArea>. */
  variant?: InputVariant;
  size?: ControlSize;
  /** Leading icon node OR a short text addon (e.g. "https://"). */
  leftAddon?: React.ReactNode;
  /** Trailing icon node OR a short text addon (e.g. ".com", "$"). */
  rightAddon?: React.ReactNode;
  /** Show an X clear-button when value is non-empty. */
  clearable?: boolean;
  /** Show a `<n>/<max>` counter under the field (right-aligned).
   *  Has no effect unless `maxLength` is also set. */
  showCounter?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

function variantDefaults(variant: InputVariant): Partial<TextInputProps> {
  if (variant === 'email')
    return {
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      autoCorrect: false,
      textContentType: 'emailAddress',
    };
  if (variant === 'phone')
    return {
      keyboardType: 'phone-pad',
      textContentType: 'telephoneNumber',
    };
  if (variant === 'url')
    return {
      keyboardType: 'url',
      autoCapitalize: 'none',
      autoCorrect: false,
      textContentType: 'URL',
    };
  if (variant === 'search')
    return {
      autoCapitalize: 'none',
      autoCorrect: false,
      returnKeyType: 'search',
    };
  return {};
}

/**
 * Single-line text input. Composes with <FormField> for label / error /
 * accessibility wiring; works standalone via `label`/`error` props too.
 *
 * For passwords use <PasswordInput>. For numbers use <NumberInput>.
 * For multiline use <TextArea>.
 */
export const Input = forwardRef<InputRef, InputProps>(function Input(
  {
    label,
    helpText,
    error,
    variant = 'text',
    size = 'md',
    leftAddon,
    rightAddon,
    clearable = false,
    showCounter = false,
    disabled = false,
    containerStyle,
    onFocus,
    onBlur,
    onChangeText,
    accessibilityLabel,
    accessibilityHint,
    placeholder,
    value,
    maxLength,
    ...rest
  },
  ref,
) {
  const { colors, spacing, typography } = useTheme();
  const fieldCtx = useFormFieldContext();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const dims = useControlDims(size);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      inputRef.current?.clear();
      onChangeText?.('');
    },
  }));

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const variantProps = useMemo(() => variantDefaults(variant), [variant]);

  // Resolved state — context wins over local props when both exist.
  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const resolvedError = fieldCtx?.errorMessage ?? error;
  const resolvedLabel = fieldCtx?.hasLabel ? undefined : label;
  const resolvedHelp = fieldCtx?.hasError
    ? undefined
    : fieldCtx?.hasDescription
    ? undefined
    : helpText;
  const isInvalid = fieldCtx?.isInvalid ?? !!error;

  const showClear = clearable && !!value && !resolvedDisabled;

  const counter =
    showCounter && typeof maxLength === 'number'
      ? `${(value ?? '').length}/${maxLength}`
      : null;

  const renderedTrailing = (
    <View style={[styles.trailing, { gap: spacing.xs }]}>
      {showClear ? (
        <Pressable
          onPress={() => {
            inputRef.current?.clear();
            onChangeText?.('');
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear input"
          style={styles.clearBtn}
        >
          <X size={16} color={colors.text.secondary} strokeWidth={2.25} />
        </Pressable>
      ) : null}
      {rightAddon ? <View>{renderAddon(rightAddon, typography.bodySm, colors.text.muted)}</View> : null}
    </View>
  );

  const inputFontStyle: TextStyle = {
    fontSize: dims.fontSize,
    color: colors.text.primary,
    fontFamily: typography.body.fontFamily,
    fontWeight: typography.body.fontWeight,
  };

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {/* Standalone label — only rendered when there's no FormField parent. */}
      {resolvedLabel ? (
        <UIText
          variant="eyebrow"
          color={colors.text.secondary}
          style={[styles.standaloneLabel, { marginBottom: spacing.xs }]}
        >
          {resolvedLabel}
        </UIText>
      ) : null}

      <ControlShell
        size={size}
        focused={focused}
        disabled={resolvedDisabled}
        invalid={isInvalid}
        leadingSlot={
          leftAddon
            ? renderAddon(leftAddon, typography.bodySm, colors.text.muted)
            : undefined
        }
        trailingSlot={
          showClear || rightAddon ? renderedTrailing : undefined
        }
      >
        <TextInput
          ref={inputRef}
          {...variantProps}
          {...rest}
          editable={!resolvedDisabled}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          // RN-Web ignores `outline-style: none` so we kill it via inline web style.
          style={[styles.input, inputFontStyle, webNoOutline]}
          nativeID={fieldCtx?.controlId}
          accessibilityLabel={
            accessibilityLabel ??
            (fieldCtx?.hasLabel ? undefined : label ?? placeholder)
          }
          accessibilityHint={
            accessibilityHint ?? (fieldCtx?.hasDescription ? undefined : helpText)
          }
          accessibilityLabelledBy={fieldCtx?.hasLabel ? fieldCtx.labelId : undefined}
          accessibilityState={{ disabled: resolvedDisabled }}
          aria-invalid={isInvalid || undefined}
          aria-describedby={
            fieldCtx?.hasError
              ? fieldCtx.errorId
              : fieldCtx?.hasDescription
              ? fieldCtx.descriptionId
              : undefined
          }
          aria-required={fieldCtx?.isRequired || undefined}
        />
      </ControlShell>

      {/* Counter row (right-aligned) and standalone help/error. */}
      {(counter || (resolvedHelp && !fieldCtx) || (resolvedError && !fieldCtx)) ? (
        <View style={[styles.helperRow, { marginTop: spacing.xs }]}>
          <View style={styles.helperLeft}>
            {!fieldCtx && resolvedError ? (
              <UIText
                variant="caption"
                color={colors.status.error}
                accessibilityLiveRegion="polite"
              >
                {resolvedError}
              </UIText>
            ) : !fieldCtx && resolvedHelp ? (
              <UIText variant="caption" color={colors.text.secondary}>
                {resolvedHelp}
              </UIText>
            ) : null}
          </View>
          {counter ? (
            <UIText variant="caption" color={colors.text.muted}>
              {counter}
            </UIText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

function renderAddon(
  addon: React.ReactNode,
  textStyle: TextStyle,
  color: string,
): React.ReactNode {
  if (typeof addon === 'string' || typeof addon === 'number') {
    return (
      <UIText variant="bodySm" color={color}>
        {addon}
      </UIText>
    );
  }
  return addon;
}

// Inline cast lets us pass web-only style keys through StyleSheet without
// upsetting the RN type system. RN ignores unknown style keys at runtime.
const webNoOutline = { outlineStyle: 'none' } as unknown as TextStyle;

const styles = StyleSheet.create({
  standaloneLabel: {},
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  helperLeft: {
    flex: 1,
  },
});
