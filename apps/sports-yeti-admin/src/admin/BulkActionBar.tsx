import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Button, Text } from '../ui';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: { label: string; onPress: () => void; tone?: 'destructive' | 'default' }[];
}

export function BulkActionBar({
  selectedCount,
  onClear,
  actions,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;
  return (
    <View
      style={[styles.bar, shadows.popover]}
      accessibilityRole="toolbar"
      accessibilityLabel={`${selectedCount} selected`}
    >
      <Text variant="bodySm" color={colors.text.primary}>
        {selectedCount} selected
      </Text>
      <View style={styles.actions}>
        {actions.map((a) => (
          <Button
            key={a.label}
            label={a.label}
            variant={a.tone === 'destructive' ? 'destructive' : 'subtle'}
            size="sm"
            onPress={a.onPress}
          />
        ))}
        <Button
          label="Clear"
          variant="ghost"
          size="sm"
          onPress={onClear}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: spacing.xl,
    left: '50%',
    transform: [{ translateX: -240 }],
    width: 480,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.strong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
