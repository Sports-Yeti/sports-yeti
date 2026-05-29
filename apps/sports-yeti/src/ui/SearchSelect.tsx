import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Check, Search, X } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { fontFamilies } from '../theme/typography';
import { Tag } from './Tag';
import { Text } from './Text';

export interface SearchSelectOption {
  value: string;
  label: string;
}

export interface SearchSelectProps {
  /** Currently selected option value, or null when nothing is chosen. */
  value: string | null;
  onChange: (next: string | null) => void;
  /** Full list of selectable options. */
  options: SearchSelectOption[];
  placeholder?: string;
  /** Shown when the search query matches nothing. */
  emptyText?: string;
  /** Max rows rendered before the user must refine the query. */
  maxVisibleResults?: number;
}

/**
 * Generic searchable single-select rendered entirely in-flow (no nested
 * Modal) so it can live inside a `ScrollView` or `BottomSheet` without the
 * focus/z-index hangs that a nested native Modal causes. Free-text search
 * narrows the option list; tapping a result selects it and collapses the
 * list to a removable chip. Use for bounded `{ value, label }` option sets
 * such as a city picker (later backed by an API).
 */
export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = 'Search…',
  emptyText = 'No matches.',
  maxVisibleResults = 6,
}: SearchSelectProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options),
    [options, q],
  );
  const visible = filtered.slice(0, maxVisibleResults);
  const hiddenCount = filtered.length - visible.length;

  // Hide the list once there's a committed selection and the user isn't
  // actively typing, so the field collapses cleanly to its chosen value.
  const showResults = !selectedOption || query.length > 0;

  const select = (option: SearchSelectOption) => {
    onChange(option.value);
    setQuery('');
  };

  const clear = () => {
    onChange(null);
    setQuery('');
  };

  return (
    <View style={styles.container}>
      {selectedOption ? (
        <View style={styles.selectedRow}>
          <Tag
            tone="brand"
            size="sm"
            label={selectedOption.label}
            icon={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Clear ${selectedOption.label}`}
                hitSlop={8}
                onPress={clear}
              >
                <X size={12} color={colors.brand.deep} strokeWidth={2.5} />
              </Pressable>
            }
          />
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
          placeholder={selectedOption ? selectedOption.label : placeholder}
          placeholderTextColor={colors.text.muted}
          autoCapitalize="words"
          autoCorrect={false}
          accessibilityLabel={placeholder}
          accessibilityHint="Type to filter, tap a result to select it."
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

      {showResults ? (
        hiddenCount > 0 ? (
          <Text variant="caption" color={colors.text.muted} style={styles.meta}>
            Refine to see {hiddenCount} more
          </Text>
        ) : null
      ) : null}

      {showResults ? (
        visible.length === 0 ? (
          <Text variant="bodySm" color={colors.text.secondary} style={styles.empty}>
            {emptyText}
          </Text>
        ) : (
          <View style={styles.options}>
            {visible.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => select(option)}
                  style={({ pressed }) => [
                    styles.row,
                    isSelected ? styles.rowSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Text
                    variant="bodySm"
                    color={isSelected ? colors.brand.deep : colors.text.primary}
                    style={styles.rowLabel}
                  >
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Check size={14} color={colors.brand.deep} strokeWidth={2.5} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )
      ) : null}
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
  meta: {
    paddingHorizontal: spacing.xs,
  },
  options: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  rowSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  rowLabel: {
    flex: 1,
  },
  empty: {
    paddingVertical: spacing.md,
  },
});
