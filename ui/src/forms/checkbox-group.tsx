import { useCallback } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/provider';
import { useFormFieldContext } from './form-field-context';
import { Checkbox } from './checkbox';

export interface CheckboxOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps<T extends string = string> {
  options: CheckboxOption<T>[];
  /** Currently-selected values. */
  value: T[];
  onChange: (next: T[]) => void;
  disabled?: boolean;
  /** vertical (default) stacks options. horizontal wraps in a row. */
  orientation?: 'vertical' | 'horizontal';
  /** Optional column count for horizontal orientation. */
  columns?: number;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

/**
 * Multi-select checkbox group. Wires up each option to a parent FormField
 * if present so the group label / description / error reads correctly to
 * screen readers.
 */
export function CheckboxGroup<T extends string = string>({
  options,
  value,
  onChange,
  disabled = false,
  orientation = 'vertical',
  columns,
  size = 'md',
  style,
}: CheckboxGroupProps<T>) {
  const { spacing } = useTheme();
  const fieldCtx = useFormFieldContext();
  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;

  const toggle = useCallback(
    (key: T) => {
      const set = new Set(value);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      onChange(Array.from(set));
    },
    [value, onChange],
  );

  const containerStyle: ViewStyle = {
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    gap: spacing.sm,
  };

  const itemStyle: ViewStyle | undefined =
    orientation === 'horizontal' && columns
      ? { width: `${100 / columns}%` }
      : orientation === 'horizontal'
      ? { flexShrink: 0 }
      : undefined;

  return (
    <View
      role="group"
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
      style={[styles.group, containerStyle, style]}
    >
      {options.map((opt) => (
        <View key={opt.value} style={itemStyle}>
          <Checkbox
            inGroup
            value={value.includes(opt.value)}
            onValueChange={() => toggle(opt.value)}
            label={opt.label}
            description={opt.description}
            disabled={resolvedDisabled || opt.disabled}
            size={size}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    width: '100%',
  },
});
