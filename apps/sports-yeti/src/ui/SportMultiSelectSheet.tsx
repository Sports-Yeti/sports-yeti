import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { SportCombobox } from './SportCombobox';

export interface SportMultiSelectSheetProps {
  visible: boolean;
  onRequestClose: () => void;
  /** Currently selected sport keys. */
  value: ReadonlySet<string>;
  /** Fired on Apply with the new selection. */
  onApply: (value: Set<string>) => void;
}

/**
 * BottomSheet-hosted wrapper around {@link SportCombobox} for use cases
 * where the combobox is invoked from a non-modal surface (e.g. the
 * Discover header's "More sports" chip). When the combobox already lives
 * inside an open sheet, embed `SportCombobox` directly to avoid stacking
 * two `Modal`s on top of each other.
 */
export function SportMultiSelectSheet({
  visible,
  onRequestClose,
  value,
  onApply,
}: SportMultiSelectSheetProps) {
  const [draft, setDraft] = useState<Set<string>>(new Set(value));

  useEffect(() => {
    if (visible) setDraft(new Set(value));
  }, [visible, value]);

  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onRequestClose}
      title="Pick sports"
      snapPoints={['86%']}
    >
      <View style={styles.body}>
        <SportCombobox
          value={draft}
          onChange={setDraft}
          scrollResults
        />

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
              onApply(draft);
              onRequestClose();
            }}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
  },
});
