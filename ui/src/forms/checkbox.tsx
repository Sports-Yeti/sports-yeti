import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Check, Minus } from 'lucide-react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ws } from '../primitives/pressable';

export type CheckboxState = boolean | 'indeterminate';

export interface CheckboxProps {
  /** Current state. `true`/`false` or `'indeterminate'` for tri-state. */
  value: CheckboxState;
  onValueChange: (next: boolean) => void;
  /** Inline label. When wrapped in <FormField>, prefer the FormField label. */
  label?: React.ReactNode;
  /** Secondary description rendered under the label. */
  description?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  /** When this Checkbox is being used as a list item in a CheckboxGroup,
   *  set `inGroup` to suppress the standalone label spacing/padding. */
  inGroup?: boolean;
}

/**
 * Single checkbox with built-in label + description. Use <CheckboxGroup>
 * for multi-select sets — it handles arrow-key navigation, group label,
 * and rolled-up error.
 */
export function Checkbox({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  size = 'md',
  style,
  inGroup = false,
}: CheckboxProps) {
  const { colors, radii, spacing } = useTheme();
  const fieldCtx = useFormFieldContext();
  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const checked = value === true;
  const indeterminate = value === 'indeterminate';
  const dim = size === 'sm' ? 18 : 22;

  const handlePress = () => {
    if (resolvedDisabled) return;
    onValueChange(!(value === true));
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={resolvedDisabled}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: indeterminate ? 'mixed' : checked,
        disabled: resolvedDisabled,
      }}
      accessibilityLabel={
        typeof label === 'string' ? label : undefined
      }
      hitSlop={inGroup ? 0 : 6}
      style={({ pressed }) => [
        styles.row,
        { gap: spacing.sm, paddingVertical: inGroup ? spacing.xs : 0 },
        pressed && !resolvedDisabled ? { opacity: 0.85 } : null,
        style,
      ]}
    >
      {(state) => {
        const { hovered } = ws(state);
        const borderColor = checked || indeterminate
          ? colors.brand.primary
          : hovered
          ? colors.brand.primary
          : colors.border.strong;
        const bg = checked || indeterminate ? colors.brand.primary : 'transparent';
        return (
          <>
            <View
              style={[
                styles.box,
                {
                  width: dim,
                  height: dim,
                  borderRadius: radii.sm,
                  borderColor,
                  backgroundColor: bg,
                  opacity: resolvedDisabled ? 0.5 : 1,
                },
              ]}
            >
              {indeterminate ? (
                <Minus
                  size={dim - 8}
                  color={colors.text.inverse}
                  strokeWidth={3}
                />
              ) : checked ? (
                <Check
                  size={dim - 8}
                  color={colors.text.inverse}
                  strokeWidth={3}
                />
              ) : null}
            </View>

            {label != null || description != null ? (
              <View style={[styles.body, { gap: 2 }]}>
                {label != null ? (
                  typeof label === 'string' ? (
                    <UIText
                      variant="body"
                      color={resolvedDisabled ? colors.text.muted : colors.text.primary}
                    >
                      {label}
                    </UIText>
                  ) : (
                    label
                  )
                ) : null}
                {description != null ? (
                  typeof description === 'string' ? (
                    <UIText variant="caption" color={colors.text.secondary}>
                      {description}
                    </UIText>
                  ) : (
                    description
                  )
                ) : null}
              </View>
            ) : null}
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
});
