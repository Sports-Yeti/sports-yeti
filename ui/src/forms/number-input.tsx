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
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ControlShell, useControlDims, type ControlSize } from './control-shell';
import type { InputRef } from './input';

export interface NumberInputProps
  extends Omit<
    TextInputProps,
    | 'style'
    | 'placeholderTextColor'
    | 'value'
    | 'onChangeText'
    | 'keyboardType'
    | 'inputMode'
  > {
  label?: string;
  helpText?: string;
  error?: string;
  /** Numeric value. `null` = empty. */
  value: number | null;
  /** Called with the parsed number, or `null` when the field is cleared. */
  onChangeNumber: (value: number | null) => void;
  size?: ControlSize;
  /** Min/max bounds (inclusive). */
  min?: number;
  max?: number;
  /** Increment used by stepper buttons + keyboard arrow keys. */
  step?: number;
  /** Show the +/- stepper buttons inside the field. */
  showSteppers?: boolean;
  /** When `format` is provided, the displayed text is formatted via
   *  Intl.NumberFormat. Useful for currency, percent, decimals.
   *  Editing reverts to a plain numeric string for the user's input. */
  format?: Intl.NumberFormatOptions;
  /** BCP-47 locale for formatting. Defaults to runtime locale. */
  locale?: string;
  /** Leading addon — e.g. "$" for USD, "€" for EUR. */
  leftAddon?: React.ReactNode;
  /** Trailing addon — e.g. "%", "kg", "USD". */
  rightAddon?: React.ReactNode;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Numeric input with optional steppers and locale-aware display
 * formatting. Use this instead of <Input variant="number"> for any
 * money / metric value — display formatting handles thousand separators
 * and currency symbols correctly across locales.
 */
export const NumberInput = forwardRef<InputRef, NumberInputProps>(
  function NumberInput(
    {
      label,
      helpText,
      error,
      value,
      onChangeNumber,
      size = 'md',
      min,
      max,
      step = 1,
      showSteppers = false,
      format,
      locale,
      leftAddon,
      rightAddon,
      disabled = false,
      containerStyle,
      onFocus,
      onBlur,
      placeholder,
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
    const [draft, setDraft] = useState<string | null>(null);
    const dims = useControlDims(size);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        setDraft(null);
        onChangeNumber(null);
      },
    }));

    const formatter = useMemo(
      () => (format ? new Intl.NumberFormat(locale, format) : null),
      [format, locale],
    );

    const formattedDisplay = useMemo(() => {
      if (value == null) return '';
      return formatter ? formatter.format(value) : String(value);
    }, [value, formatter]);

    const visible = focused
      ? draft ?? (value == null ? '' : String(value))
      : formattedDisplay;

    const commit = useCallback(
      (raw: string | null) => {
        if (raw == null || raw.trim() === '') {
          onChangeNumber(null);
          return;
        }
        // Allow comma as decimal separator (locales like de-DE) — convert
        // to canonical "." for parseFloat.
        const normalized = raw.replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
        const parsed = parseFloat(normalized);
        if (Number.isNaN(parsed)) {
          onChangeNumber(null);
          return;
        }
        const clamped =
          min != null && parsed < min
            ? min
            : max != null && parsed > max
            ? max
            : parsed;
        onChangeNumber(clamped);
      },
      [min, max, onChangeNumber],
    );

    const handleChange = useCallback(
      (text: string) => {
        setDraft(text);
        commit(text);
      },
      [commit],
    );

    const handleFocus = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
        setFocused(true);
        setDraft(value == null ? '' : String(value));
        onFocus?.(e);
      },
      [value, onFocus],
    );

    const handleBlur = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
        setFocused(false);
        setDraft(null);
        onBlur?.(e);
      },
      [onBlur],
    );

    const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
    const isInvalid = fieldCtx?.isInvalid ?? !!error;

    const adjust = useCallback(
      (delta: number) => {
        const base = value ?? 0;
        const next = base + delta;
        const clamped =
          min != null && next < min
            ? min
            : max != null && next > max
            ? max
            : next;
        onChangeNumber(clamped);
      },
      [value, min, max, onChangeNumber],
    );

    const canDecrement = !resolvedDisabled && (min == null || (value ?? 0) > min);
    const canIncrement = !resolvedDisabled && (max == null || (value ?? 0) < max);

    const inputFontStyle: TextStyle = {
      fontSize: dims.fontSize,
      color: colors.text.primary,
      fontFamily: typography.body.fontFamily,
      fontWeight: typography.body.fontWeight,
      textAlign: showSteppers ? 'center' : 'left',
    };

    const standaloneLabel = fieldCtx?.hasLabel ? undefined : label;
    const standaloneHelp = fieldCtx ? undefined : helpText;
    const standaloneError = fieldCtx ? undefined : error;

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
          focused={focused}
          disabled={resolvedDisabled}
          invalid={isInvalid}
          leadingSlot={
            showSteppers ? (
              <Pressable
                onPress={() => adjust(-step)}
                disabled={!canDecrement}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Decrement"
                style={[
                  styles.stepperBtn,
                  { opacity: canDecrement ? 1 : 0.4 },
                ]}
              >
                <Minus size={16} color={colors.text.primary} strokeWidth={2.5} />
              </Pressable>
            ) : leftAddon != null ? (
              renderAddon(leftAddon, colors.text.muted)
            ) : undefined
          }
          trailingSlot={
            showSteppers ? (
              <Pressable
                onPress={() => adjust(step)}
                disabled={!canIncrement}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Increment"
                style={[
                  styles.stepperBtn,
                  { opacity: canIncrement ? 1 : 0.4 },
                ]}
              >
                <Plus size={16} color={colors.text.primary} strokeWidth={2.5} />
              </Pressable>
            ) : rightAddon != null ? (
              renderAddon(rightAddon, colors.text.muted)
            ) : undefined
          }
        >
          <TextInput
            ref={inputRef}
            {...rest}
            editable={!resolvedDisabled}
            value={visible}
            onChangeText={handleChange}
            placeholder={placeholder}
            placeholderTextColor={colors.text.muted}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType="decimal-pad"
            inputMode="decimal"
            style={[styles.input, inputFontStyle, webNoOutline]}
            nativeID={fieldCtx?.controlId}
            accessibilityRole="adjustable"
            accessibilityLabel={
              accessibilityLabel ??
              (fieldCtx?.hasLabel ? undefined : label ?? placeholder)
            }
            accessibilityHint={accessibilityHint ?? helpText}
            accessibilityLabelledBy={
              fieldCtx?.hasLabel ? fieldCtx.labelId : undefined
            }
            accessibilityState={{ disabled: resolvedDisabled }}
            accessibilityValue={
              value != null
                ? {
                    min,
                    max,
                    now: value,
                  }
                : undefined
            }
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'increment') adjust(step);
              if (e.nativeEvent.actionName === 'decrement') adjust(-step);
            }}
            accessibilityActions={[
              { name: 'increment', label: 'Increase' },
              { name: 'decrement', label: 'Decrease' },
            ]}
            aria-invalid={isInvalid || undefined}
          />
        </ControlShell>

        {standaloneError ? (
          <UIText
            variant="caption"
            color={colors.status.error}
            accessibilityLiveRegion="polite"
            style={{ marginTop: spacing.xs }}
          >
            {standaloneError}
          </UIText>
        ) : standaloneHelp ? (
          <UIText
            variant="caption"
            color={colors.text.secondary}
            style={{ marginTop: spacing.xs }}
          >
            {standaloneHelp}
          </UIText>
        ) : null}
      </View>
    );
  },
);

function renderAddon(node: React.ReactNode, color: string): React.ReactNode {
  if (typeof node === 'string' || typeof node === 'number') {
    return (
      <UIText variant="bodySm" color={color}>
        {node}
      </UIText>
    );
  }
  return node;
}

const webNoOutline = { outlineStyle: 'none' } as unknown as TextStyle;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
