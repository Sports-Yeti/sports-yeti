import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ControlShell, useControlDims, type ControlSize } from './control-shell';
import type { InputRef } from './input';

export interface TextAreaProps
  extends Omit<TextInputProps, 'style' | 'placeholderTextColor' | 'multiline'> {
  label?: string;
  helpText?: string;
  error?: string;
  size?: ControlSize;
  /** Minimum number of visible rows. Defaults to 3. */
  minRows?: number;
  /** Maximum number of visible rows before scrolling kicks in. */
  maxRows?: number;
  /** Show a `<n>/<max>` counter under the field. Requires maxLength. */
  showCounter?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Multiline text field. Auto-grows on web; on native, RN handles auto-grow
 * via numberOfLines + multiline. Wrapped by ControlShell + FormField.
 */
export const TextArea = forwardRef<InputRef, TextAreaProps>(function TextArea(
  {
    label,
    helpText,
    error,
    size = 'md',
    minRows = 3,
    maxRows,
    showCounter = false,
    disabled = false,
    containerStyle,
    onFocus,
    onBlur,
    onChangeText,
    placeholder,
    value,
    maxLength,
    accessibilityLabel,
    accessibilityHint,
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

  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const resolvedError = fieldCtx?.errorMessage ?? error;
  const isInvalid = fieldCtx?.isInvalid ?? !!error;
  const standaloneLabel = fieldCtx?.hasLabel ? undefined : label;
  const standaloneHelp = fieldCtx ? undefined : helpText;
  const standaloneError = fieldCtx ? undefined : resolvedError;

  const counter =
    showCounter && typeof maxLength === 'number'
      ? `${(value ?? '').length}/${maxLength}`
      : null;

  // Approximate row → height mapping using line-height of body variant.
  const lineHeight =
    typeof typography.body.lineHeight === 'number'
      ? typography.body.lineHeight
      : 20;
  const minHeight = lineHeight * minRows + 16;
  const maxHeight = maxRows ? lineHeight * maxRows + 16 : undefined;

  const inputFontStyle: TextStyle = {
    fontSize: dims.fontSize,
    color: colors.text.primary,
    fontFamily: typography.body.fontFamily,
    fontWeight: typography.body.fontWeight,
  };

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {standaloneLabel ? (
        <UIText
          variant="eyebrow"
          color={colors.text.secondary}
          style={{ marginBottom: spacing.xs }}
        >
          {standaloneLabel}
        </UIText>
      ) : null}

      <ControlShell
        size={size}
        multiline
        focused={focused}
        disabled={resolvedDisabled}
        invalid={isInvalid}
        style={{ minHeight, maxHeight } as ViewStyle}
      >
        <TextInput
          ref={inputRef}
          {...rest}
          editable={!resolvedDisabled}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          style={[styles.input, inputFontStyle, webNoOutline]}
          nativeID={fieldCtx?.controlId}
          accessibilityLabel={
            accessibilityLabel ??
            (fieldCtx?.hasLabel ? undefined : label ?? placeholder)
          }
          accessibilityHint={accessibilityHint ?? helpText}
          accessibilityLabelledBy={
            fieldCtx?.hasLabel ? fieldCtx.labelId : undefined
          }
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

      {(counter || standaloneHelp || standaloneError) ? (
        <View style={[styles.helperRow, { marginTop: spacing.xs }]}>
          <View style={styles.helperLeft}>
            {standaloneError ? (
              <UIText
                variant="caption"
                color={colors.status.error}
                accessibilityLiveRegion="polite"
              >
                {standaloneError}
              </UIText>
            ) : standaloneHelp ? (
              <UIText variant="caption" color={colors.text.secondary}>
                {standaloneHelp}
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

const webNoOutline = { outlineStyle: 'none' } as unknown as TextStyle;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: 0,
    minHeight: 0,
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
