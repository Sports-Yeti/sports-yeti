import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { DateTimeField } from './DateTimeField';
import { Text } from './Text';

export interface TimeRange {
  /** Time-of-day expressed as Date with arbitrary date component. */
  start: Date | null;
  end: Date | null;
}

export interface TimeRangeFieldProps {
  label?: string;
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  helpText?: string;
  showClear?: boolean;
}

/**
 * Composite field for picking a same-day time window (e.g. "between 5pm
 * and 9pm"). The `start.date` and `end.date` portions are irrelevant —
 * consumers should compare against `Date#getHours()` / `getMinutes()`.
 */
export function TimeRangeField({
  label,
  value,
  onChange,
  helpText,
  showClear = true,
}: TimeRangeFieldProps) {
  const handleStart = useCallback(
    (start: Date) => {
      const next: TimeRange = { start, end: value.end };
      if (
        next.end &&
        toMinutes(next.end) < toMinutes(start)
      ) {
        next.end = start;
      }
      onChange(next);
    },
    [onChange, value.end],
  );

  const handleEnd = useCallback(
    (end: Date) => {
      const next: TimeRange = { start: value.start, end };
      if (
        next.start &&
        toMinutes(next.start) > toMinutes(end)
      ) {
        next.start = end;
      }
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
              accessibilityLabel="Clear time range"
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
          mode="time"
          value={value.start}
          onChange={handleStart}
          placeholder="From"
          containerStyle={styles.flex1}
        />
        <DateTimeField
          mode="time"
          value={value.end}
          onChange={handleEnd}
          placeholder="Until"
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

export function toMinutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
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
