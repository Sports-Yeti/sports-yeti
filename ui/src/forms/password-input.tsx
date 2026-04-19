import {
  forwardRef,
  useImperativeHandle,
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
import { Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ControlShell, useControlDims, type ControlSize } from './control-shell';
import type { InputRef } from './input';

export interface PasswordInputProps
  extends Omit<TextInputProps, 'style' | 'placeholderTextColor' | 'secureTextEntry'> {
  label?: string;
  helpText?: string;
  error?: string;
  size?: ControlSize;
  disabled?: boolean;
  /** Show a strength meter under the field. Driven by a simple
   *  zxcvbn-lite scorer so we don't pull in the 600KB dictionary. */
  showStrength?: boolean;
  /** New password (signup) sets correct text-content-type for autofill +
   *  autoComplete='new-password'. Default false (login flow). */
  isNewPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Password text field with built-in show/hide toggle and optional
 * strength meter. Use this instead of <Input variant="password">.
 */
export const PasswordInput = forwardRef<InputRef, PasswordInputProps>(
  function PasswordInput(
    {
      label,
      helpText,
      error,
      size = 'md',
      disabled = false,
      showStrength = false,
      isNewPassword = false,
      containerStyle,
      onFocus,
      onBlur,
      onChangeText,
      placeholder,
      value,
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
    const [visible, setVisible] = useState(false);
    const dims = useControlDims(size);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        inputRef.current?.clear();
        onChangeText?.('');
      },
    }));

    const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
    const resolvedError = fieldCtx?.errorMessage ?? error;
    const isInvalid = fieldCtx?.isInvalid ?? !!error;
    const standaloneLabel = fieldCtx?.hasLabel ? undefined : label;
    const standaloneHelp = fieldCtx ? undefined : helpText;
    const standaloneError = fieldCtx ? undefined : resolvedError;

    const strength = showStrength ? scorePassword(value ?? '') : null;

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
          focused={focused}
          disabled={resolvedDisabled}
          invalid={isInvalid}
          trailingSlot={
            <Pressable
              onPress={() => setVisible((v) => !v)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={visible ? 'Hide password' : 'Show password'}
              accessibilityState={{ selected: visible }}
              style={styles.toggleBtn}
            >
              {visible ? (
                <EyeOff size={18} color={colors.text.secondary} strokeWidth={2.25} />
              ) : (
                <Eye size={18} color={colors.text.secondary} strokeWidth={2.25} />
              )}
            </Pressable>
          }
        >
          <TextInput
            ref={inputRef}
            {...rest}
            value={value}
            onChangeText={onChangeText}
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
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={isNewPassword ? 'password-new' : 'password'}
            textContentType={isNewPassword ? 'newPassword' : 'password'}
            editable={!resolvedDisabled}
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

        {strength ? (
          <View
            style={[
              styles.strengthRow,
              { marginTop: spacing.xs, gap: spacing.xs },
            ]}
            accessibilityLiveRegion="polite"
          >
            <View
              style={[
                styles.strengthTrack,
                { backgroundColor: colors.surface.chip, borderRadius: 999 },
              ]}
            >
              <View
                style={{
                  width: `${strength.fillPct}%`,
                  height: '100%',
                  backgroundColor: strength.color(colors),
                  borderRadius: 999,
                }}
              />
            </View>
            <UIText variant="caption" color={strength.color(colors)}>
              <ShieldCheck size={12} color={strength.color(colors)} />{' '}
              {strength.label}
            </UIText>
          </View>
        ) : null}

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

interface StrengthScore {
  label: string;
  fillPct: number;
  color: (c: { status: { error: string; warning: string; success: string } }) => string;
}

/**
 * Tiny entropy scorer: counts character classes + length bands. Good
 * enough as a UX hint; production sign-up flows should still validate
 * against haveibeenpwned + a length policy server-side.
 */
function scorePassword(pw: string): StrengthScore {
  if (pw.length === 0) {
    return {
      label: 'Enter a password',
      fillPct: 0,
      color: (c) => c.status.error,
    };
  }
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;

  if (score <= 1) {
    return { label: 'Weak', fillPct: 25, color: (c) => c.status.error };
  }
  if (score === 2) {
    return { label: 'Fair', fillPct: 50, color: (c) => c.status.warning };
  }
  if (score === 3) {
    return { label: 'Good', fillPct: 75, color: (c) => c.status.warning };
  }
  return { label: 'Strong', fillPct: 100, color: (c) => c.status.success };
}

const webNoOutline = { outlineStyle: 'none' } as unknown as TextStyle;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  toggleBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    overflow: 'hidden',
  },
});
