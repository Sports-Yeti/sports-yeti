import React, { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { usePrefixedId } from '../primitives/id';
import {
  FormFieldContextProvider,
  type FormFieldContextValue,
} from './form-field-context';

export type FormFieldOrientation = 'vertical' | 'row';

export interface FormFieldProps {
  /** Field label. Rendered as eyebrow text above the control (vertical) or
   *  to the left of the control with a help description (row). */
  label?: React.ReactNode;
  /** Optional secondary help text. Always rendered below the label. */
  description?: React.ReactNode;
  /** Error message — when present, replaces help text and triggers
   *  a polite live-region announcement on screen readers. */
  error?: React.ReactNode;
  /** Required marker (renders a `*` after the label). */
  required?: boolean;
  /** Disable the control + dim the label/help text. */
  disabled?: boolean;
  /** vertical (default): label above field. row: label/description on the
   *  left, control on the right (used for Toggle / Checkbox-style rows). */
  orientation?: FormFieldOrientation;
  /** Override the auto-generated control id — useful when you want to
   *  associate a label with an external native form element. */
  controlId?: string;
  /** Container style passthrough. */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Wrapper that owns label / description / error layout for ANY form
 * control underneath it. The control reads its label/error/disabled
 * state via useFormFieldContext(), so callsites don't need to plumb
 * those props through twice.
 *
 * Examples
 *   <FormField label="Email" error={errors.email}>
 *     <Input variant="email" value={email} onChangeText={setEmail} />
 *   </FormField>
 *
 *   <FormField label="Notifications" description="Game reminders." orientation="row">
 *     <Toggle value={pushEnabled} onValueChange={setPushEnabled} />
 *   </FormField>
 */
export function FormField({
  label,
  description,
  error,
  required = false,
  disabled = false,
  orientation = 'vertical',
  controlId,
  style,
  children,
}: FormFieldProps) {
  const { colors, spacing } = useTheme();
  const baseId = usePrefixedId('formfield', controlId);

  const hasLabel = label != null;
  const hasDescription = description != null;
  const hasError = error != null && error !== '';
  const errorMessage = typeof error === 'string' ? error : undefined;

  const ctx = useMemo<FormFieldContextValue>(
    () => ({
      controlId: baseId,
      labelId: `${baseId}-label`,
      descriptionId: `${baseId}-desc`,
      errorId: `${baseId}-err`,
      hasLabel,
      hasDescription,
      hasError,
      isInvalid: hasError,
      isDisabled: disabled,
      isRequired: required,
      errorMessage,
    }),
    [baseId, hasLabel, hasDescription, hasError, disabled, required, errorMessage],
  );

  if (orientation === 'row') {
    return (
      <View style={[styles.row, { gap: spacing.md }, style]}>
        <View style={styles.rowText}>
          {hasLabel ? (
            <UIText
              variant="button"
              color={
                disabled ? colors.text.muted : colors.text.primary
              }
              nativeID={ctx.labelId}
              style={styles.label}
            >
              {label}
              {required ? (
                <UIText variant="button" color={colors.status.error}>
                  {' '}
                  *
                </UIText>
              ) : null}
            </UIText>
          ) : null}
          {hasDescription ? (
            <UIText
              variant="caption"
              color={colors.text.secondary}
              nativeID={ctx.descriptionId}
            >
              {description}
            </UIText>
          ) : null}
          {hasError ? (
            <UIText
              variant="caption"
              color={colors.status.error}
              nativeID={ctx.errorId}
              accessibilityLiveRegion="polite"
            >
              {error}
            </UIText>
          ) : null}
        </View>
        <View style={styles.rowControl}>
          <FormFieldContextProvider value={ctx}>
            {children}
          </FormFieldContextProvider>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.vertical, { gap: spacing.xs }, style]}>
      {hasLabel ? (
        <UIText
          variant="eyebrow"
          color={disabled ? colors.text.muted : colors.text.secondary}
          nativeID={ctx.labelId}
          style={styles.label}
        >
          {label}
          {required ? (
            <UIText variant="eyebrow" color={colors.status.error}>
              {' '}
              *
            </UIText>
          ) : null}
        </UIText>
      ) : null}

      <FormFieldContextProvider value={ctx}>
        {children}
      </FormFieldContextProvider>

      {hasError ? (
        <UIText
          variant="caption"
          color={colors.status.error}
          nativeID={ctx.errorId}
          accessibilityLiveRegion="polite"
        >
          {error}
        </UIText>
      ) : hasDescription ? (
        <UIText
          variant="caption"
          color={colors.text.secondary}
          nativeID={ctx.descriptionId}
        >
          {description}
        </UIText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  vertical: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowControl: {
    flexShrink: 0,
  },
  label: {
    // small letter-spacing tweak handled by typography variant
  },
});
