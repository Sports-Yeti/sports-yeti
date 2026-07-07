import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Text } from './Text';

export interface OptionListItem {
  key: string;
  label: string;
}

export interface OptionListSheetProps {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  options: OptionListItem[];
  /** When true, renders a multi-select list with Cancel / Apply actions. */
  multiple?: boolean;
  /** Selected key for single-select mode. */
  selectedKey?: string;
  /** Fired with the chosen key in single-select mode (then closes). */
  onSelect?: (key: string) => void;
  /** Selected keys for multi-select mode. */
  selectedKeys?: ReadonlySet<string>;
  /** Fired on Apply with the new selection in multi-select mode. */
  onApply?: (keys: Set<string>) => void;
  snapPoints?: Array<number | string>;
}

/**
 * BottomSheet-hosted option picker. Mirrors the sports picker pattern so every
 * filter pill can open a focused list of just its own options instead of the
 * full filter sheet. Single-select rows commit immediately; multi-select mode
 * keeps a draft and commits on Apply.
 */
export function OptionListSheet({
  visible,
  onRequestClose,
  title,
  options,
  multiple = false,
  selectedKey,
  onSelect,
  selectedKeys,
  onApply,
  snapPoints = ['60%'],
}: OptionListSheetProps) {
  const [draft, setDraft] = useState<Set<string>>(new Set(selectedKeys));

  useEffect(() => {
    if (visible) setDraft(new Set(selectedKeys));
  }, [visible, selectedKeys]);

  const toggle = (key: string) =>
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onRequestClose}
      title={title}
      snapPoints={snapPoints}
    >
      <View style={styles.body}>
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {options.map((option) => {
            const checked = multiple
              ? draft.has(option.key)
              : option.key === selectedKey;
            return (
              <Pressable
                key={option.key}
                accessibilityRole={multiple ? 'checkbox' : 'radio'}
                accessibilityState={{ checked }}
                accessibilityLabel={option.label}
                onPress={() => {
                  if (multiple) {
                    toggle(option.key);
                    return;
                  }
                  onSelect?.(option.key);
                  onRequestClose();
                }}
                style={({ pressed }) => [
                  styles.row,
                  checked ? styles.rowChecked : null,
                  pressed ? styles.rowPressed : null,
                ]}
              >
                <Text
                  variant="body"
                  color={checked ? colors.brand.deep : colors.text.primary}
                >
                  {option.label}
                </Text>
                {checked ? (
                  <Check size={18} color={colors.brand.primary} strokeWidth={2.5} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {multiple ? (
          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="ghost"
              fullWidth
              onPress={onRequestClose}
            />
            <Button
              label={draft.size === 0 ? 'Apply' : `Apply (${draft.size})`}
              variant="gradient"
              fullWidth
              onPress={() => {
                onApply?.(draft);
                onRequestClose();
              }}
            />
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.lg,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.bg,
  },
  rowChecked: {
    backgroundColor: colors.brand.soft,
  },
  rowPressed: {
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
  },
});
