import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar, Clock, X } from 'lucide-react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ws } from '../primitives/pressable';
import { ControlShell } from './control-shell';
import {
  formatDateValue,
  type DatePickerProps,
  type DatePickerMode,
} from './date-picker-shared';

export type { DatePickerProps, DatePickerMode } from './date-picker-shared';

/**
 * Native (iOS/Android) implementation. Wraps
 * @react-native-community/datetimepicker:
 *   - iOS: inline-spinner inside a sheet (matches native UX)
 *   - Android: launches the platform dialog imperatively
 *
 * The web implementation lives in date-picker.tsx (Metro picks the
 * right file by extension).
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
  const [iosSheetOpen, setIosSheetOpen] = useState(false);
  const [androidStep, setAndroidStep] = useState<'idle' | 'date' | 'time'>('idle');
  const [draft, setDraft] = useState<Date>(() => value ?? new Date());

  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const isInvalid = fieldCtx?.isInvalid ?? !!error;
  const display = formatDateValue(value, mode, locale);

  const open = () => {
    if (resolvedDisabled) return;
    setDraft(value ?? new Date());
    if (Platform.OS === 'ios') {
      setIosSheetOpen(true);
    } else {
      setAndroidStep(mode === 'time' ? 'time' : 'date');
    }
  };

  // Android: chained date → time pickers handle the 'datetime' mode.
  const handleAndroidEvent = (
    event: DateTimePickerEvent,
    selected?: Date,
  ): void => {
    if (event.type === 'dismissed' || !selected) {
      setAndroidStep('idle');
      return;
    }
    if (mode === 'datetime' && androidStep === 'date') {
      // Carry the chosen date into the time step.
      setDraft(selected);
      setAndroidStep('time');
      return;
    }
    onChange(selected);
    setAndroidStep('idle');
  };

  const handleIosEvent = (_e: DateTimePickerEvent, selected?: Date) => {
    if (selected) setDraft(selected);
  };

  const commitIos = () => {
    onChange(draft);
    setIosSheetOpen(false);
  };

  const cancelIos = () => {
    setIosSheetOpen(false);
  };

  const clear = () => {
    onChange(null);
    setIosSheetOpen(false);
    setAndroidStep('idle');
  };

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
        onPress={open}
        disabled={resolvedDisabled}
        accessibilityRole="button"
        accessibilityLabel={fieldCtx?.hasLabel ? undefined : label ?? placeholder}
        accessibilityLabelledBy={fieldCtx?.hasLabel ? fieldCtx.labelId : undefined}
        accessibilityState={{
          disabled: resolvedDisabled,
          expanded: iosSheetOpen || androidStep !== 'idle',
        }}
        accessibilityHint={display || 'No date selected'}
        aria-invalid={isInvalid || undefined}
      >
        {(state) => {
          const { hovered } = ws(state);
          return (
            <ControlShell
              size={size}
              focused={iosSheetOpen}
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
                    onPress={clear}
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

      {/* iOS: bottom-sheet wrapping the inline spinner. */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={iosSheetOpen}
          transparent
          animationType="slide"
          onRequestClose={cancelIos}
        >
          <Pressable style={styles.backdrop} onPress={cancelIos}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surface.card,
                  borderTopLeftRadius: radii.cardLg,
                  borderTopRightRadius: radii.cardLg,
                  paddingHorizontal: spacing.lg,
                  paddingTop: spacing.md,
                  paddingBottom: spacing.xxl,
                },
                shadows.popover,
              ]}
            >
              <View style={styles.handleWrap}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: colors.border.strong },
                  ]}
                />
              </View>

              <View style={styles.iosHeader}>
                <Pressable
                  onPress={cancelIos}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <UIText variant="button" color={colors.text.secondary}>
                    Cancel
                  </UIText>
                </Pressable>
                <UIText variant="h3" color={colors.text.primary}>
                  {label ?? defaultPlaceholder(mode)}
                </UIText>
                <Pressable
                  onPress={commitIos}
                  accessibilityRole="button"
                  accessibilityLabel="Done"
                >
                  <UIText variant="button" color={colors.brand.primary}>
                    Done
                  </UIText>
                </Pressable>
              </View>

              <DateTimePicker
                value={draft}
                mode={mode}
                display="spinner"
                onChange={handleIosEvent}
                minimumDate={minDate}
                maximumDate={maxDate}
                is24Hour={is24Hour}
                locale={locale}
              />

              {clearable ? (
                <Pressable
                  onPress={clear}
                  accessibilityRole="button"
                  accessibilityLabel="Clear"
                  style={[styles.clearBtn, { paddingVertical: spacing.sm }]}
                >
                  <UIText variant="button" color={colors.status.live} align="center">
                    Clear
                  </UIText>
                </Pressable>
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {/* Android: imperative dialogs (date then optionally time). */}
      {Platform.OS === 'android' && androidStep !== 'idle' ? (
        <DateTimePicker
          value={draft}
          mode={androidStep}
          display="default"
          onChange={handleAndroidEvent}
          minimumDate={minDate}
          maximumDate={maxDate}
          is24Hour={is24Hour}
          locale={locale}
        />
      ) : null}
    </View>
  );
}

function defaultPlaceholder(mode: DatePickerMode) {
  if (mode === 'time') return 'Select time';
  if (mode === 'datetime') return 'Select date & time';
  return 'Select date';
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '70%',
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 999,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  clearBtn: {
    marginTop: 8,
  },
});
