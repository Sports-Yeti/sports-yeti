import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Check, Search, X } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { fontFamilies } from '../theme/typography';
import { Tag } from './Tag';
import { Text } from './Text';

export interface SearchMultiSelectProps {
  /** Currently selected option values. */
  value: ReadonlySet<string>;
  onChange: (next: Set<string>) => void;
  /** Full list of selectable options. */
  options: string[];
  placeholder?: string;
  /** Shown when the search query matches nothing. */
  emptyText?: string;
}

/**
 * Generic searchable multi-select rendered entirely in-flow (no nested
 * Modal) so it can live inside a `BottomSheet`. Free-text search narrows
 * the option list; tapping a result toggles it; picks surface as removable
 * `Tag` chips above the input. Use for bounded string option sets such as
 * roster positions.
 */
export function SearchMultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Search…',
  emptyText = 'No matches.',
}: SearchMultiSelectProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? options.filter((o) => o.toLowerCase().includes(q)) : options),
    [options, q],
  );

  const selected = useMemo(
    () => options.filter((o) => value.has(o)),
    [options, value],
  );

  const toggle = (option: string) => {
    const next = new Set(value);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange(next);
  };

  const remove = (option: string) => {
    const next = new Set(value);
    next.delete(option);
    onChange(next);
  };

  const clearAll = () => onChange(new Set<string>());

  return (
    <View style={styles.container}>
      {selected.length > 0 ? (
        <View style={styles.selectedRow}>
          {selected.map((option) => (
            <Tag
              key={option}
              tone="brand"
              size="sm"
              label={option}
              icon={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${option}`}
                  hitSlop={8}
                  onPress={() => remove(option)}
                >
                  <X size={12} color={colors.brand.deep} strokeWidth={2.5} />
                </Pressable>
              }
            />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear all selected"
            hitSlop={8}
            onPress={clearAll}
          >
            <Text variant="caption" color={colors.text.secondary}>
              Clear all
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View
        style={[
          styles.inputWrap,
          { borderColor: focused ? colors.brand.primary : colors.border.strong },
        ]}
      >
        <Search size={18} color={colors.text.secondary} strokeWidth={2.25} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={placeholder}
          accessibilityHint="Type to filter, tap a result to toggle it."
          style={styles.input}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            onPress={() => setQuery('')}
          >
            <X size={16} color={colors.text.secondary} strokeWidth={2.25} />
          </Pressable>
        ) : null}
      </View>

      {filtered.length === 0 ? (
        <Text variant="bodySm" color={colors.text.secondary} style={styles.empty}>
          {emptyText}
        </Text>
      ) : (
        <View style={styles.options}>
          {filtered.map((option) => {
            const isSelected = value.has(option);
            return (
              <Pressable
                key={option}
                accessibilityRole="checkbox"
                accessibilityLabel={option}
                accessibilityState={{ checked: isSelected }}
                onPress={() => toggle(option)}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected ? styles.chipSelected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                {isSelected ? (
                  <Check size={14} color={colors.brand.deep} strokeWidth={2.5} />
                ) : null}
                <Text
                  variant="bodySm"
                  color={isSelected ? colors.brand.deep : colors.text.primary}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  selectedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    backgroundColor: colors.surface.card,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 16,
    paddingVertical: 0,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.chip,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  chipSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  empty: {
    paddingVertical: spacing.md,
  },
});
