import type { ControlSize } from './control-shell';

export type DatePickerMode = 'date' | 'time' | 'datetime';

export interface DatePickerProps {
  /** Current value, or null when empty. */
  value: Date | null;
  onChange: (value: Date | null) => void;
  /** What to capture: just a date, just a time, or both. */
  mode?: DatePickerMode;
  /** Optional standalone label (ignored in FormField). */
  label?: string;
  /** Optional standalone error (ignored in FormField). */
  error?: string;
  helpText?: string;
  placeholder?: string;
  size?: ControlSize;
  disabled?: boolean;
  /** Earliest selectable instant. */
  minDate?: Date;
  /** Latest selectable instant. */
  maxDate?: Date;
  /** Forces 12-hour or 24-hour clock. Defaults to runtime locale. */
  is24Hour?: boolean;
  /** BCP-47 locale used for formatting the trigger label. */
  locale?: string;
  /** Allow clearing back to null. Adds an X button when value is set. */
  clearable?: boolean;
  /** Style passthrough for the outer container. */
  containerStyle?: import('react-native').ViewStyle;
}

export function formatDateValue(
  d: Date | null,
  mode: DatePickerMode,
  locale?: string,
): string {
  if (!d) return '';
  if (mode === 'time') {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  }
  if (mode === 'datetime') {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

export function clamp(d: Date, min?: Date, max?: Date): Date {
  if (min && d < min) return min;
  if (max && d > max) return max;
  return d;
}
