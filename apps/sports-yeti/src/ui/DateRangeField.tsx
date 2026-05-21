import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { DateTimeField } from './DateTimeField';
import { Text } from './Text';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangeFieldProps {
  label?: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  helpText?: string;
  /** Show a small "Clear" affordance when at least one bound is set. */
  showClear?: boolean;
}

/**
 * Composite field for picking an inclusive `[start, end]` date range. Wraps
 * two `DateTimeField`s side-by-side with shared label / help text and an
 * optional clear button. Enforces `end >= start` by bumping whichever the
 * user just changed.
 */
export function DateRangeField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  helpText,
  showClear = true,
}: DateRangeFieldProps) {
  const handleStart = useCallback(
    (start: Date) => {
      const next: DateRange = { start, end: value.end };
      if (next.end && next.end < start) next.end = start;
      onChange(next);
    },
    [onChange, value.end],
  );

  const handleEnd = useCallback(
    (end: Date) => {
      const next: DateRange = { start: value.start, end };
      if (next.start && next.start > end) next.start = end;
      onChange(next);
    },
    [onChange, value.start],
  );

  const handleClear = useCallback(
    () => onChange({ start: null, end: null }),
    [onChange],
  );

  const isSet = useMemo(
    () => value.start !== null || value.end !== null,
    [value.start, value.end],
  );

  const startMin = minimumDate;
  const startMax = value.end ?? maximumDate;
  const endMin = value.start ?? minimumDate;
  const endMax = maximumDate;

  return (
    <View style={styles.container}>
      {label || (showClear && isSet) ? (
        <View style={styles.header}>
          {label ? (
            <Text variant="eyebrow" color={colors.text.secondary}>
              {label}
            </Text>
          ) : (
            <View />
          )}
          {showClear && isSet ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear date range"
              hitSlop={8}
              onPress={handleClear}
              style={styles.clearBtn}
            >
              <X size={14} color={colors.text.secondary} strokeWidth={2.25} />
              <Text variant="caption" color={colors.text.secondary}>
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.row}>
        <DateTimeField
          mode="date"
          value={value.start}
          onChange={handleStart}
          placeholder="Start"
          minimumDate={startMin}
          maximumDate={startMax}
          containerStyle={styles.flex1}
        />
        <DateTimeField
          mode="date"
          value={value.end}
          onChange={handleEnd}
          placeholder="End"
          minimumDate={endMin}
          maximumDate={endMax}
          containerStyle={styles.flex1}
        />
      </View>

      {helpText ? (
        <Text variant="caption" color={colors.text.secondary} style={styles.help}>
          {helpText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 32,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  help: {
    marginLeft: spacing.xs,
  },
});
