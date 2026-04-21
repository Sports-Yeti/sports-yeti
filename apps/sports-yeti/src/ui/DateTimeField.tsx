import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { Button } from './Button';
import { BottomSheet } from './BottomSheet';
import { Text } from './Text';

export type DateTimeFieldMode = 'date' | 'time';

export interface DateTimeFieldProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode?: DateTimeFieldMode;
  placeholder?: string;
  helpText?: string;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** Override automatic formatting of the displayed value. */
  formatValue?: (date: Date) => string;
}

function defaultFormat(date: Date, mode: DateTimeFieldMode): string {
  if (mode === 'time') {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Field-styled wrapper around `@react-native-community/datetimepicker`.
 *
 * Behaviour:
 *  - iOS: tapping the field opens a `BottomSheet` containing the spinner
 *    picker and a "Done" button. We commit the value on Done.
 *  - Android: tapping the field opens the native dialog, which fires
 *    `onChange` with `event.type === 'set'` (committed) or `'dismissed'`.
 */
export function DateTimeField({
  label,
  value,
  onChange,
  mode = 'date',
  placeholder,
  helpText,
  error,
  minimumDate,
  maximumDate,
  disabled = false,
  containerStyle,
  formatValue,
}: DateTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const Icon = mode === 'time' ? Clock : Calendar;
  const display = useMemo(() => {
    if (!value) return placeholder ?? (mode === 'time' ? 'Select time' : 'Select date');
    return formatValue ? formatValue(value) : defaultFormat(value, mode);
  }, [value, placeholder, mode, formatValue]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setDraft(value ?? new Date());
    setOpen(true);
  }, [disabled, value]);

  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      setOpen(false);
      if (event.type === 'set' && selected) onChange(selected);
    },
    [onChange],
  );

  const handleIosChange = useCallback(
    (_event: DateTimePickerEvent, selected?: Date) => {
      if (selected) setDraft(selected);
    },
    [],
  );

  const commitIos = useCallback(() => {
    onChange(draft);
    setOpen(false);
  }, [draft, onChange]);

  const borderColor = error
    ? colors.status.error
    : disabled
    ? colors.border.soft
    : colors.border.strong;
  const valueColor = value ? colors.text.primary : colors.text.muted;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text variant="eyebrow" color={colors.text.secondary} style={styles.label}>
          {label}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? (mode === 'time' ? 'Select time' : 'Select date')}
        accessibilityHint={helpText}
        accessibilityState={{ disabled }}
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.field,
          { borderColor },
          disabled ? styles.fieldDisabled : null,
          pressed ? styles.fieldPressed : null,
        ]}
      >
        <Icon size={18} color={colors.brand.primary} strokeWidth={2.25} />
        <Text variant="body" color={valueColor} style={styles.valueText}>
          {display}
        </Text>
      </Pressable>

      {error ? (
        <Text
          variant="caption"
          color={colors.status.error}
          style={styles.helpText}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : helpText ? (
        <Text variant="caption" color={colors.text.secondary} style={styles.helpText}>
          {helpText}
        </Text>
      ) : null}

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          mode={mode}
          value={value ?? new Date()}
          onChange={handleAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          is24Hour={false}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <BottomSheet
          visible={open}
          onRequestClose={() => setOpen(false)}
          title={label ?? (mode === 'time' ? 'Pick a time' : 'Pick a date')}
          snapPoints={['46%']}
        >
          <View style={styles.iosBody}>
            <DateTimePicker
              mode={mode}
              value={draft}
              onChange={handleIosChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              display="spinner"
              themeVariant="light"
              style={styles.iosPicker}
            />
            <View style={styles.iosActions}>
              <Button
                label="Cancel"
                variant="ghost"
                fullWidth
                onPress={() => setOpen(false)}
              />
              <Button
                label="Done"
                variant="gradient"
                fullWidth
                onPress={commitIos}
              />
            </View>
          </View>
        </BottomSheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    backgroundColor: colors.surface.card,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  fieldPressed: {
    opacity: 0.85,
  },
  fieldDisabled: {
    backgroundColor: colors.surface.chipMuted,
    opacity: 0.7,
  },
  valueText: {
    flex: 1,
  },
  helpText: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  iosBody: {
    flex: 1,
    gap: spacing.md,
  },
  iosPicker: {
    flex: 1,
  },
  iosActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
