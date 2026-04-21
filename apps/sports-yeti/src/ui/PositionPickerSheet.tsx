import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Chip } from './Chip';
import { EmptyState } from './EmptyState';
import { Input } from './Input';
import { Text } from './Text';
import {
  POSITIONS_BY_SPORT,
  type SportKey,
} from '../mocks/teams';
import { SPORT_META_BY_KEY } from '../mocks/profile';

export interface PositionPickerSheetProps {
  visible: boolean;
  sportKey: SportKey;
  /** Position labels currently selected for this sport.
   *  Always at least 1 = primary; the first entry is treated as primary. */
  selected: string[];
  /** Maximum number of positions selectable. Default 3 (1 primary + 2 secondary). */
  maxSelections?: number;
  onChange: (positions: string[]) => void;
  onRequestClose: () => void;
}

/** Searchable position picker scoped to a single sport. The first selected
 *  position is treated as the player's primary position; additional picks
 *  become secondary positions on the profile. */
export function PositionPickerSheet({
  visible,
  sportKey,
  selected,
  maxSelections = 3,
  onChange,
  onRequestClose,
}: PositionPickerSheetProps) {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<string[]>(selected);
  const meta = SPORT_META_BY_KEY[sportKey];

  // Re-seed the draft whenever the sheet opens or `selected` changes from
  // outside (e.g., the parent reset the form).
  React.useEffect(() => {
    if (visible) {
      setDraft(selected);
      setQuery('');
    }
  }, [visible, selected]);

  const positions = POSITIONS_BY_SPORT[sportKey];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return positions;
    return positions.filter((p) => p.toLowerCase().includes(q));
  }, [positions, query]);

  const toggle = (pos: string) => {
    setDraft((prev) => {
      if (prev.includes(pos)) {
        return prev.filter((p) => p !== pos);
      }
      if (prev.length >= maxSelections) {
        // Replace the last secondary slot when full so the primary is preserved.
        return [...prev.slice(0, maxSelections - 1), pos];
      }
      return [...prev, pos];
    });
  };

  const handleApply = () => {
    onChange(draft);
    onRequestClose();
  };

  const helper =
    draft.length === 0
      ? 'Pick your primary position first.'
      : draft.length === 1
      ? `Primary: ${draft[0]}. Add up to ${maxSelections - 1} more.`
      : `Primary: ${draft[0]} · Secondary: ${draft.slice(1).join(', ')}`;

  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onRequestClose}
      title={`${meta?.label ?? 'Sport'} positions`}
      snapPoints={['80%']}
    >
      <View style={styles.container}>
        <Input
          variant="text"
          value={query}
          onChangeText={setQuery}
          placeholder="Search positions…"
          leadingIcon={
            <Search size={18} color={colors.text.secondary} strokeWidth={2.25} />
          }
          accessibilityLabel="Search positions"
        />

        <Text variant="caption" color={colors.text.secondary}>
          {helper}
        </Text>

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon={
                <X size={24} color={colors.brand.primary} strokeWidth={2.25} />
              }
              title="No positions match"
              description={`Try a different keyword or pick from the full ${meta?.label ?? ''} list.`}
            />
          ) : (
            filtered.map((pos) => {
              const isSelected = draft.includes(pos);
              const isPrimary = draft[0] === pos;
              return (
                <Chip
                  key={pos}
                  label={isPrimary && draft.length > 1 ? `${pos} · Primary` : pos}
                  selected={isSelected}
                  onPress={() => toggle(pos)}
                />
              );
            })
          )}
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
            label="Save positions"
            variant="gradient"
            size="md"
            onPress={handleApply}
            disabled={draft.length === 0}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
