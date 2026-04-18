import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Text } from './Text';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string> {
  label?: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
  width?: number | `${number}%`;
}

export function Select<T extends string = string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  error,
  style,
  width = '100%',
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const borderColor = error ? colors.status.error : colors.border.strong;

  return (
    <View style={[{ width } as ViewStyle, style]}>
      {label ? (
        <Text variant="caption" color={colors.text.secondary} style={styles.label}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityHint={selected?.label}
        accessibilityState={{ disabled, expanded: open }}
        style={({ hovered }) => [
          styles.trigger,
          { borderColor },
          // @ts-expect-error rn-web hovered
          hovered && !disabled ? styles.triggerHover : null,
          disabled ? styles.triggerDisabled : null,
        ]}
      >
        <Text
          variant="body"
          color={selected ? colors.text.primary : colors.text.muted}
          numberOfLines={1}
          style={styles.triggerText}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={14} color={colors.text.secondary} strokeWidth={2.25} />
      </Pressable>
      {error ? (
        <Text variant="caption" color={colors.status.error} style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityElementsHidden
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[styles.popover, shadows.popover]}
          >
            <ScrollView style={styles.list}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    disabled={option.disabled}
                    accessibilityRole="menuitem"
                    accessibilityState={{
                      selected: isSelected,
                      disabled: option.disabled,
                    }}
                    style={({ hovered }) => [
                      styles.option,
                      // @ts-expect-error rn-web hovered
                      hovered ? styles.optionHover : null,
                      option.disabled ? styles.optionDisabled : null,
                    ]}
                  >
                    <View style={styles.optionBody}>
                      <Text
                        variant="body"
                        color={
                          option.disabled
                            ? colors.text.muted
                            : colors.text.primary
                        }
                      >
                        {option.label}
                      </Text>
                      {option.description ? (
                        <Text variant="caption" color={colors.text.muted}>
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Check size={14} color={colors.brand.primary} strokeWidth={2.5} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing['2xs'],
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 38,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  triggerHover: {
    backgroundColor: '#FAFBFD',
  },
  triggerDisabled: {
    backgroundColor: colors.surface.chipMuted,
    opacity: 0.7,
  },
  triggerText: {
    flex: 1,
  },
  error: {
    marginTop: spacing['2xs'],
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  popover: {
    width: 320,
    maxHeight: 360,
    backgroundColor: colors.surface.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    overflow: 'hidden',
  },
  list: {
    maxHeight: 360,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  optionHover: {
    backgroundColor: colors.brand.soft,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionBody: {
    flex: 1,
    gap: 2,
  },
});
