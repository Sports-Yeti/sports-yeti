import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { Text } from './Text';

export interface FilterPillProps {
  label: string;
  onPress: () => void;
  /** Optional close affordance. When provided shows an X icon and routes
   *  its press to `onClose` instead of `onPress`. */
  onClose?: () => void;
  accessibilityLabel?: string;
  /** Optional leading icon. */
  leading?: React.ReactNode;
}

/**
 * Compact tappable filter pill. The whole pill opens the filter sheet (or
 * whatever `onPress` does). A small embedded X — when `onClose` is set —
 * removes just this filter without opening the sheet. Shared across the
 * Discover and Teams discovery surfaces so the filter chrome stays
 * consistent.
 */
export function FilterPill({
  label,
  onPress,
  onClose,
  accessibilityLabel,
  leading,
}: FilterPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed ? styles.pressed : null]}
      hitSlop={4}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <Text variant="caption" color={colors.brand.deep} style={styles.label}>
        {label}
      </Text>
      {onClose ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          hitSlop={10}
          onPress={onClose}
          style={styles.closeBtn}
        >
          <X size={12} color={colors.brand.deep} strokeWidth={2.5} />
        </Pressable>
      ) : (
        <ChevronDown size={12} color={colors.brand.deep} strokeWidth={2.5} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    minHeight: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.soft,
  },
  pressed: {
    opacity: 0.8,
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.brand.deep,
  },
  closeBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.card,
  },
});
