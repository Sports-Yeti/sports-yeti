import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ws } from '../primitives/pressable';
import { ControlShell } from './control-shell';
import {
  clamp,
  formatDateValue,
  type DatePickerProps,
  type DatePickerMode,
} from './date-picker-shared';

export type { DatePickerProps, DatePickerMode } from './date-picker-shared';

/**
 * Web implementation: custom calendar grid in a centered popover.
 * Native (.native.tsx) overrides this to use @react-native-community/datetimepicker.
 */
export function DatePicker({
  value,
  onChange,
  mode = 'date',
  label,
  error,
  helpText,
  placeholder,
  size = 'md',
  disabled = false,
  minDate,
  maxDate,
  is24Hour,
  locale,
  clearable = false,
  containerStyle,
}: DatePickerProps) {
  const { colors, spacing, radii, shadows } = useTheme();
  const fieldCtx = useFormFieldContext();
  const [open, setOpen] = useState(false);

  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const isInvalid = fieldCtx?.isInvalid ?? !!error;
  const display = formatDateValue(value, mode, locale);

  const close = () => setOpen(false);

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {!fieldCtx && label ? (
        <UIText
          variant="eyebrow"
          color={colors.text.secondary}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </UIText>
      ) : null}

      <Pressable
        onPress={() => !resolvedDisabled && setOpen(true)}
        disabled={resolvedDisabled}
        accessibilityRole="button"
        accessibilityLabel={fieldCtx?.hasLabel ? undefined : label ?? placeholder}
        accessibilityLabelledBy={fieldCtx?.hasLabel ? fieldCtx.labelId : undefined}
        accessibilityState={{ disabled: resolvedDisabled, expanded: open }}
        accessibilityHint={display || 'No date selected'}
        aria-invalid={isInvalid || undefined}
      >
        {(state) => {
          const { hovered } = ws(state);
          const focused = open;
          return (
            <ControlShell
              size={size}
              focused={focused}
              disabled={resolvedDisabled}
              invalid={isInvalid}
              leadingSlot={
                mode === 'time' ? (
                  <Clock size={16} color={colors.text.secondary} strokeWidth={2.25} />
                ) : (
                  <Calendar size={16} color={colors.text.secondary} strokeWidth={2.25} />
                )
              }
              trailingSlot={
                clearable && value ? (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onChange(null);
                    }}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Clear date"
                    style={styles.iconBtn}
                  >
                    <X size={16} color={colors.text.secondary} strokeWidth={2.25} />
                  </Pressable>
                ) : undefined
              }
              style={
                hovered && !resolvedDisabled
                  ? { backgroundColor: colors.brand.soft }
                  : undefined
              }
            >
              <UIText
                variant="body"
                color={display ? colors.text.primary : colors.text.muted}
                numberOfLines={1}
                style={{ flex: 1 }}
              >
                {display || placeholder || defaultPlaceholder(mode)}
              </UIText>
            </ControlShell>
          );
        }}
      </Pressable>

      {!fieldCtx && error ? (
        <UIText
          variant="caption"
          color={colors.status.error}
          accessibilityLiveRegion="polite"
          style={{ marginTop: spacing.xs }}
        >
          {error}
        </UIText>
      ) : !fieldCtx && helpText ? (
        <UIText
          variant="caption"
          color={colors.text.secondary}
          style={{ marginTop: spacing.xs }}
        >
          {helpText}
        </UIText>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.popover,
              {
                backgroundColor: colors.surface.card,
                borderRadius: radii.lg,
                padding: spacing.lg,
              },
              shadows.popover,
            ]}
          >
            <CalendarGrid
              value={value ?? new Date()}
              onSelect={(d) => {
                const next = clamp(d, minDate, maxDate);
                onChange(next);
                if (mode === 'date') close();
              }}
              minDate={minDate}
              maxDate={maxDate}
              locale={locale}
            />
            {mode !== 'date' ? (
              <TimeWheel
                value={value ?? new Date()}
                onChange={(d) => onChange(clamp(d, minDate, maxDate))}
                is24Hour={is24Hour}
                locale={locale}
              />
            ) : null}

            <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.md }]}>
              {clearable ? (
                <Pressable
                  onPress={() => {
                    onChange(null);
                    close();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear"
                  style={({ pressed }) => [
                    styles.actionBtn,
                    {
                      borderRadius: radii.md,
                      backgroundColor: pressed
                        ? colors.surface.chipMuted
                        : 'transparent',
                    },
                  ]}
                >
                  <UIText variant="button" color={colors.text.secondary}>
                    Clear
                  </UIText>
                </Pressable>
              ) : null}
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="Done"
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    borderRadius: radii.md,
                    backgroundColor: pressed
                      ? colors.brand.deep
                      : colors.brand.primary,
                  },
                ]}
              >
                <UIText variant="button" color={colors.text.inverse}>
                  Done
                </UIText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function defaultPlaceholder(mode: DatePickerMode) {
  if (mode === 'time') return 'Select time';
  if (mode === 'datetime') return 'Select date & time';
  return 'Select date';
}

interface GridProps {
  value: Date;
  onSelect: (d: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
}

function CalendarGrid({ value, onSelect, minDate, maxDate, locale }: GridProps) {
  const { colors, spacing, radii } = useTheme();
  const [view, setView] = useState(() => startOfMonth(value));

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).format(view),
    [view, locale],
  );

  const weeks = useMemo(() => buildMonthGrid(view), [view]);
  const weekdays = useMemo(() => getWeekdayLabels(locale), [locale]);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isOutOfRange = (d: Date) => {
    if (minDate && d < startOfDay(minDate)) return true;
    if (maxDate && d > endOfDay(maxDate)) return true;
    return false;
  };

  const cellSize = 36;

  return (
    <View style={{ width: cellSize * 7 + spacing.md, gap: spacing.sm }}>
      <View style={styles.calendarHeader}>
        <Pressable
          onPress={() => setView((v) => addMonths(v, -1))}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={styles.iconBtn}
        >
          <ChevronLeft size={18} color={colors.text.secondary} strokeWidth={2.25} />
        </Pressable>
        <UIText variant="h3" color={colors.text.primary}>
          {monthLabel}
        </UIText>
        <Pressable
          onPress={() => setView((v) => addMonths(v, 1))}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          style={styles.iconBtn}
        >
          <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2.25} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {weekdays.map((w) => (
          <View key={w} style={{ width: cellSize, alignItems: 'center' }}>
            <UIText variant="caption" color={colors.text.muted}>
              {w}
            </UIText>
          </View>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((d) => {
            const inMonth = d.getMonth() === view.getMonth();
            const selected = isSameDay(d, value);
            const oor = isOutOfRange(d);
            return (
              <Pressable
                key={d.toISOString()}
                onPress={() => !oor && onSelect(d)}
                disabled={oor}
                accessibilityRole="button"
                accessibilityLabel={d.toDateString()}
                accessibilityState={{ selected, disabled: oor }}
                style={({ pressed }) => {
                  const wsState = ws({ pressed });
                  return [
                    styles.dayCell,
                    {
                      width: cellSize,
                      height: cellSize,
                      borderRadius: radii.md,
                      backgroundColor: selected
                        ? colors.brand.primary
                        : wsState.hovered
                        ? colors.brand.soft
                        : 'transparent',
                      opacity: oor ? 0.3 : inMonth ? 1 : 0.4,
                    },
                  ];
                }}
              >
                <UIText
                  variant="bodySm"
                  color={selected ? colors.text.inverse : colors.text.primary}
                >
                  {d.getDate()}
                </UIText>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

interface TimeWheelProps {
  value: Date;
  onChange: (d: Date) => void;
  is24Hour?: boolean;
  locale?: string;
}

function TimeWheel({ value, onChange, is24Hour, locale }: TimeWheelProps) {
  const { colors, spacing, radii } = useTheme();
  const use24 =
    is24Hour ??
    (locale ? !new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12 : false);

  const hourOptions = use24
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i).filter((m) => m % 5 === 0);

  const currentHour = value.getHours();
  const currentMinute = value.getMinutes();
  const displayHour = use24 ? currentHour : ((currentHour + 11) % 12) + 1;
  const isPM = currentHour >= 12;

  const setHour = (h: number) => {
    const next = new Date(value);
    if (use24) {
      next.setHours(h);
    } else {
      const base = h % 12;
      next.setHours(isPM ? base + 12 : base);
    }
    onChange(next);
  };
  const setMinute = (m: number) => {
    const next = new Date(value);
    next.setMinutes(m);
    onChange(next);
  };
  const togglePeriod = () => {
    const next = new Date(value);
    next.setHours((currentHour + 12) % 24);
    onChange(next);
  };

  return (
    <View style={[styles.timeRow, { gap: spacing.sm, marginTop: spacing.md }]}>
      <ScrollView style={styles.timeCol}>
        {hourOptions.map((h) => {
          const active = h === displayHour;
          return (
            <Pressable
              key={h}
              onPress={() => setHour(h)}
              accessibilityRole="button"
              accessibilityLabel={`${h} hours`}
              accessibilityState={{ selected: active }}
              style={[
                styles.timeCell,
                {
                  borderRadius: radii.sm,
                  backgroundColor: active ? colors.brand.primary : 'transparent',
                },
              ]}
            >
              <UIText
                variant="body"
                color={active ? colors.text.inverse : colors.text.primary}
                align="center"
              >
                {String(h).padStart(2, '0')}
              </UIText>
            </Pressable>
          );
        })}
      </ScrollView>
      <UIText variant="h2" color={colors.text.muted}>
        :
      </UIText>
      <ScrollView style={styles.timeCol}>
        {minuteOptions.map((m) => {
          const active = m === currentMinute - (currentMinute % 5);
          return (
            <Pressable
              key={m}
              onPress={() => setMinute(m)}
              accessibilityRole="button"
              accessibilityLabel={`${m} minutes`}
              accessibilityState={{ selected: active }}
              style={[
                styles.timeCell,
                {
                  borderRadius: radii.sm,
                  backgroundColor: active ? colors.brand.primary : 'transparent',
                },
              ]}
            >
              <UIText
                variant="body"
                color={active ? colors.text.inverse : colors.text.primary}
                align="center"
              >
                {String(m).padStart(2, '0')}
              </UIText>
            </Pressable>
          );
        })}
      </ScrollView>
      {use24 ? null : (
        <Pressable
          onPress={togglePeriod}
          accessibilityRole="button"
          accessibilityLabel="Toggle AM/PM"
          style={[
            styles.amPm,
            { borderRadius: radii.md, borderColor: colors.border.strong },
          ]}
        >
          <UIText variant="button" color={colors.text.primary}>
            {isPM ? 'PM' : 'AM'}
          </UIText>
        </Pressable>
      )}
    </View>
  );
}

// ---------- Date utilities ----------

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function addMonths(d: Date, n: number) {
  const next = new Date(d);
  next.setMonth(d.getMonth() + n);
  return next;
}
function buildMonthGrid(viewMonth: Date): Date[][] {
  const first = startOfMonth(viewMonth);
  const startOffset = first.getDay();
  const start = new Date(first);
  start.setDate(first.getDate() - startOffset);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const idx = w * 7 + i;
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      week.push(d);
    }
    weeks.push(week);
  }
  return weeks;
}
function getWeekdayLabels(locale?: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const reference = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(reference);
    d.setDate(reference.getDate() + i);
    return fmt.format(d);
  });
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  popover: {
    width: 360,
    maxWidth: '92%',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCol: {
    height: 140,
    width: 56,
  },
  timeCell: {
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  amPm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
