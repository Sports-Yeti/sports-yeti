import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { IconBadge } from './IconBadge';
import { Text } from './Text';
import { SPORTS_META } from '../mocks/profile';
import type { SportKey } from '../mocks/teams';

export interface SportPickerSheetProps {
  visible: boolean;
  /** Sports the user already plays. */
  selected: SportKey[];
  onChange: (sports: SportKey[]) => void;
  onRequestClose: () => void;
  /** Optional copy override for the header description. */
  description?: string;
}

/** Multi-select sport picker. Selecting a sport adds it to the user's
 *  `sportProfiles[]` (the profile screens prompt the user to set a position
 *  immediately afterwards). At least one sport must remain selected — the UI
 *  prevents removing the last one. */
export function SportPickerSheet({
  visible,
  selected,
  onChange,
  onRequestClose,
  description = 'Pick the sports you play. Stats, positions and team suggestions all follow your selection.',
}: SportPickerSheetProps) {
  const [draft, setDraft] = useState<SportKey[]>(selected);

  useEffect(() => {
    if (visible) setDraft(selected);
  }, [visible, selected]);

  const toggle = (sport: SportKey) => {
    setDraft((prev) => {
      if (prev.includes(sport)) {
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== sport);
      }
      return [...prev, sport];
    });
  };

  const handleApply = () => {
    onChange(draft);
    onRequestClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onRequestClose}
      title="Sports you play"
      snapPoints={['75%']}
    >
      <View style={styles.container}>
        <Text variant="bodySm" color={colors.text.secondary}>
          {description}
        </Text>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {SPORTS_META.map((sport) => {
            const isSelected = draft.includes(sport.key);
            const Icon = sport.Icon;
            const isOnlySelected = isSelected && draft.length === 1;
            return (
              <Pressable
                key={sport.key}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected, disabled: isOnlySelected }}
                accessibilityLabel={sport.label}
                accessibilityHint={
                  isOnlySelected
                    ? 'You must keep at least one sport selected.'
                    : undefined
                }
                onPress={() => toggle(sport.key)}
                style={({ pressed }) => [
                  styles.row,
                  isSelected ? styles.rowSelected : null,
                  pressed ? styles.rowPressed : null,
                ]}
              >
                <IconBadge size={44} tone={isSelected ? 'brand' : 'soft'}>
                  <Icon
                    size={20}
                    color={isSelected ? colors.brand.deep : colors.brand.primary}
                    strokeWidth={2.25}
                  />
                </IconBadge>
                <View style={styles.rowBody}>
                  <Text variant="button" color={colors.text.primary}>
                    {sport.label}
                  </Text>
                  <Text variant="caption" color={colors.text.secondary}>
                    {isSelected
                      ? isOnlySelected
                        ? 'Primary sport — keep at least one selected'
                        : 'Tap to remove'
                      : 'Tap to add'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    isSelected ? styles.checkboxSelected : null,
                  ]}
                >
                  {isSelected ? (
                    <Check
                      size={16}
                      color={colors.text.inverse}
                      strokeWidth={3}
                    />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Cancel"
            variant="ghost"
            size="md"
            onPress={onRequestClose}
            style={styles.flex1}
          />
          <Button
            label={`Save (${draft.length})`}
            variant="gradient"
            size="md"
            onPress={handleApply}
            style={styles.flex2}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    minHeight: 64,
    ...shadows.soft,
  },
  rowSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.soft,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
});
