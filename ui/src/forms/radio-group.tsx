import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ws } from '../primitives/pressable';

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string = string> {
  options: RadioOption<T>[];
  value: T | null;
  onChange: (next: T) => void;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

/**
 * Single-select radio group. Use this when you have 2-5 mutually-exclusive
 * options that benefit from being all visible at once. For 6+ options
 * (or any options where labels are user data), prefer <Select>.
 */
export function RadioGroup<T extends string = string>({
  options,
  value,
  onChange,
  disabled = false,
  orientation = 'vertical',
  size = 'md',
  style,
}: RadioGroupProps<T>) {
  const { spacing, colors, radii } = useTheme();
  const fieldCtx = useFormFieldContext();
  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const dim = size === 'sm' ? 18 : 22;

  return (
    <View
      role="radiogroup"
      accessibilityLabelledBy={
        fieldCtx?.hasLabel ? fieldCtx.labelId : undefined
      }
      aria-describedby={
        fieldCtx?.hasError
          ? fieldCtx.errorId
          : fieldCtx?.hasDescription
          ? fieldCtx.descriptionId
          : undefined
      }
      style={[
        styles.group,
        {
          flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
          gap: spacing.sm,
        },
        style,
      ]}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        const optDisabled = resolvedDisabled || opt.disabled === true;
        return (
          <Pressable
            key={opt.value}
            onPress={() => !optDisabled && onChange(opt.value)}
            disabled={optDisabled}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: optDisabled }}
            accessibilityLabel={opt.label}
            hitSlop={4}
            style={({ pressed }) => [
              styles.row,
              { gap: spacing.sm, paddingVertical: spacing.xs },
              pressed && !optDisabled ? { opacity: 0.85 } : null,
            ]}
          >
            {(state) => {
              const { hovered } = ws(state);
              const borderColor = selected
                ? colors.brand.primary
                : hovered
                ? colors.brand.primary
                : colors.border.strong;
              return (
                <>
                  <View
                    style={[
                      styles.outer,
                      {
                        width: dim,
                        height: dim,
                        borderRadius: radii.pill,
                        borderColor,
                        opacity: optDisabled ? 0.5 : 1,
                      },
                    ]}
                  >
                    {selected ? (
                      <View
                        style={{
                          width: dim - 8,
                          height: dim - 8,
                          borderRadius: dim,
                          backgroundColor: colors.brand.primary,
                        }}
                      />
                    ) : null}
                  </View>
                  <View style={[styles.body, { gap: 2 }]}>
                    <UIText
                      variant="body"
                      color={
                        optDisabled ? colors.text.muted : colors.text.primary
                      }
                    >
                      {opt.label}
                    </UIText>
                    {opt.description ? (
                      <UIText variant="caption" color={colors.text.secondary}>
                        {opt.description}
                      </UIText>
                    ) : null}
                  </View>
                </>
              );
            }}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  outer: {
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
