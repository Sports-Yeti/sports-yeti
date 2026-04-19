import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormSubmit } from './form-provider';

export interface FormActionsProps {
  /** Submit button label. Defaults to "Save changes". */
  submitLabel?: string;
  /** Optional cancel button. */
  cancelLabel?: string;
  onCancel?: () => void;
  /** When true (mobile default), pins the action bar to the bottom of
   *  the screen with a hairline top border. Web defaults to inline. */
  sticky?: boolean;
  /** Extra style for the wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Optional right-aligned secondary action (e.g. "Save draft"). */
  secondary?: React.ReactNode;
}

/**
 * Submit + Cancel pair wired to the parent <Form>'s submit handler.
 *
 * On mobile (`density === 'comfortable'`), defaults to a sticky bottom
 * bar. On admin (`density === 'compact'`), defaults to inline right-
 * aligned actions matching the existing admin PageHeader pattern.
 */
export function FormActions({
  submitLabel = 'Save changes',
  cancelLabel,
  onCancel,
  sticky,
  style,
  secondary,
}: FormActionsProps) {
  const { colors, spacing, radii, density, shadows } = useTheme();
  const { submit, isSubmitting } = useFormSubmit();
  const isSticky = sticky ?? density === 'comfortable';

  return (
    <View
      style={[
        isSticky
          ? {
              ...styles.sticky,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: Platform.select({
                ios: spacing.xxl,
                default: spacing.md,
              }),
              backgroundColor: colors.surface.card,
              borderTopColor: colors.border.soft,
              ...shadows.soft,
            }
          : styles.inline,
        { gap: spacing.sm },
        style,
      ]}
    >
      {secondary ? <View style={styles.secondary}>{secondary}</View> : null}
      {cancelLabel ? (
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.btn,
            {
              borderRadius: radii.md,
              backgroundColor: pressed ? colors.surface.chipMuted : 'transparent',
              opacity: isSubmitting ? 0.6 : 1,
            },
          ]}
        >
          <UIText variant="button" color={colors.text.primary} align="center">
            {cancelLabel}
          </UIText>
        </Pressable>
      ) : null}
      <Pressable
        onPress={() => void submit()}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
        accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
        style={({ pressed }) => [
          styles.btn,
          styles.submit,
          {
            borderRadius: radii.md,
            backgroundColor: pressed ? colors.brand.deep : colors.brand.primary,
            opacity: isSubmitting ? 0.7 : 1,
          },
        ]}
      >
        <UIText variant="button" color={colors.text.inverse} align="center">
          {isSubmitting ? 'Saving…' : submitLabel}
        </UIText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  submit: {
    flex: 1,
    minWidth: 140,
  },
  secondary: {
    flex: 1,
  },
});
