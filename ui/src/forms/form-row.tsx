import React, { Children } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';

export interface FormRowProps {
  /** Number of equal columns. On screens narrower than `breakpoint`, the
   *  row collapses to a single stack. */
  columns?: 1 | 2 | 3 | 4;
  /** Width below which the row stacks vertically. Defaults to 720. */
  breakpoint?: number;
  /** Custom column flex weights. Length must match `columns`. */
  weights?: number[];
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Responsive row that places its children side-by-side above the
 * breakpoint and stacks them vertically below it. Avoids the per-screen
 * `flex: 1, minWidth: 200` boilerplate that admin forms repeat today.
 */
export function FormRow({
  columns = 2,
  breakpoint = 720,
  weights,
  style,
  children,
}: FormRowProps) {
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const stack = width < breakpoint;

  const items = Children.toArray(children);

  if (stack) {
    return (
      <View style={[{ gap: spacing.md }, style]}>
        {items.map((child, i) => (
          <View key={i} style={{ width: '100%' }}>
            {child}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.row, { gap: spacing.md }, style]}>
      {items.slice(0, columns).map((child, i) => {
        const flex = weights?.[i] ?? 1;
        return (
          <View key={i} style={{ flex, minWidth: 0 }}>
            {child}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
});
