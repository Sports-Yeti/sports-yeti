import React, { useCallback, useMemo, useState, type ComponentType } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Check, Search, X, type LucideProps } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { fontFamilies } from '../theme/typography';
import { IconBadge } from './IconBadge';
import { Tag } from './Tag';
import { Text } from './Text';
import { searchSportCatalog, sportCatalogEntry } from '../mocks/games';

export type SportComboboxMode = 'single' | 'multi';

/**
 * Minimal shape the combobox needs to render a selectable sport. The games
 * `SportCatalogEntry` is structurally compatible (it has extra fields like
 * `bucket`), so the default catalog "just works"; other surfaces (e.g. the
 * News tab's canonical 6-sport list) can pass their own `options`.
 */
export interface SportComboboxOption {
  key: string;
  label: string;
  Icon: ComponentType<LucideProps>;
  aliases?: string[];
}

export interface SportComboboxProps {
  /** Selected sport keys (matches `SportCatalogEntry.key`). */
  value: ReadonlySet<string>;
  onChange: (next: Set<string>) => void;
  /** Max rows rendered at once; remaining are reachable via scroll. */
  maxVisibleResults?: number;
  /** Disable internal scrolling (use when nested in a parent ScrollView). */
  scrollResults?: boolean;
  placeholder?: string;
  /**
   * `'multi'` (default): toggling adds/removes; the chip strip shows all
   * picks. `'single'` collapses to a single selection — picking a new
   * entry replaces the previous one and the result list hides once a
   * sport is chosen (until the user clears it or types again).
   */
  mode?: SportComboboxMode;
  /**
   * Optional custom sport list. Defaults to the games `SPORT_CATALOG`
   * (searched via `searchSportCatalog`). Pass a domain-specific list to reuse
   * the same searchable multi-select UI over a different sport set.
   */
  options?: SportComboboxOption[];
  style?: StyleProp<ViewStyle>;
}

/**
 * Inline searchable multi-select for sports. Renders entirely in-flow — no
 * nested Modal — so it can live inside a `BottomSheet` (filter sheet) or
 * directly on a screen without z-index / focus issues.
 *
 * Behaviour:
 *  - Free-text search filters `SPORT_CATALOG` (label + key + aliases).
 *  - Tapping a result toggles it in the selection set immediately.
 *  - Selected sports show as removable `Tag` chips above the input.
 *  - When `scrollResults` is `false` (the default when nested inside an
 *    outer ScrollView), the result list is rendered flat and capped via
 *    `maxVisibleResults` to keep the surface measurable; pagination is
 *    implicit because typing narrows the list.
 */
export function SportCombobox({
  value,
  onChange,
  maxVisibleResults = 8,
  scrollResults = false,
  placeholder = 'Search sports…',
  mode = 'multi',
  options,
  style,
}: SportComboboxProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const allResults = useMemo<SportComboboxOption[]>(() => {
    if (options) {
      const q = query.trim().toLowerCase();
      if (!q) return options;
      return options.filter((e) =>
        [e.label, e.key, ...(e.aliases ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    return searchSportCatalog(query);
  }, [query, options]);
  const visibleResults = useMemo(
    () =>
      scrollResults ? allResults : allResults.slice(0, maxVisibleResults),
    [allResults, scrollResults, maxVisibleResults],
  );
  const hiddenCount = allResults.length - visibleResults.length;

  // In single-select mode, hide the picker list once the user has a
  // committed selection AND isn't actively typing — that way the field
  // collapses cleanly to its chosen value.
  const showResults =
    mode === 'multi' || value.size === 0 || query.length > 0;

  const toggle = useCallback(
    (key: string) => {
      if (mode === 'single') {
        // Picking the currently-selected item clears it.
        if (value.has(key)) {
          onChange(new Set<string>());
        } else {
          onChange(new Set<string>([key]));
        }
        setQuery('');
        return;
      }
      const next = new Set(value);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onChange(next);
    },
    [mode, onChange, value],
  );

  const remove = useCallback(
    (key: string) => {
      const next = new Set(value);
      next.delete(key);
      onChange(next);
    },
    [onChange, value],
  );

  const clearAll = useCallback(() => onChange(new Set<string>()), [onChange]);

  const selectedEntries = useMemo<SportComboboxOption[]>(
    () =>
      [...value]
        .map((k) =>
          options ? options.find((e) => e.key === k) : sportCatalogEntry(k),
        )
        .filter((e): e is SportComboboxOption => !!e),
    [value, options],
  );

  const ResultList = scrollResults ? ScrollView : View;
  const resultListProps = scrollResults
    ? ({
        keyboardShouldPersistTaps: 'handled' as const,
        showsVerticalScrollIndicator: false,
      } as const)
    : ({} as const);

  return (
    <View style={[styles.container, style]}>
      {selectedEntries.length > 0 ? (
        <View style={styles.selectedRow}>
          {selectedEntries.map((entry) => (
            <Tag
              key={entry.key}
              tone="brand"
              size="sm"
              label={entry.label}
              icon={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${entry.label}`}
                  hitSlop={8}
                  onPress={() => remove(entry.key)}
                >
                  <X
                    size={12}
                    color={colors.brand.deep}
                    strokeWidth={2.5}
                  />
                </Pressable>
              }
            />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear all selected sports"
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
          accessibilityHint="Type a sport name to filter the list, tap a result to add it."
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
        <View style={styles.metaRow}>
          <Text variant="caption" color={colors.text.muted}>
            {mode === 'single'
              ? `${allResults.length} matching`
              : `${value.size} selected · ${allResults.length} matching`}
          </Text>
          {hiddenCount > 0 ? (
            <Text variant="caption" color={colors.text.muted}>
              Refine to see {hiddenCount} more
            </Text>
          ) : null}
        </View>
      ) : null}

      {showResults ? (
        <ResultList
          {...resultListProps}
          style={scrollResults ? styles.scrollList : undefined}
          contentContainerStyle={scrollResults ? styles.scrollContent : undefined}
        >
        {visibleResults.length === 0 ? (
          <Text
            variant="bodySm"
            color={colors.text.secondary}
            align="center"
            style={styles.empty}
          >
            No sports match “{query}”.
          </Text>
        ) : (
          visibleResults.map((entry) => {
            const selected = value.has(entry.key);
            const Icon = entry.Icon;
            return (
              <Pressable
                key={entry.key}
                accessibilityRole="checkbox"
                accessibilityLabel={entry.label}
                accessibilityState={{ checked: selected }}
                onPress={() => toggle(entry.key)}
                style={({ pressed }) => [
                  styles.row,
                  selected ? styles.rowSelected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <IconBadge size={36}>
                  <Icon
                    size={18}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                </IconBadge>
                <Text
                  variant="button"
                  color={colors.text.primary}
                  style={styles.rowLabel}
                >
                  {entry.label}
                </Text>
                <View
                  style={[
                    styles.check,
                    selected ? styles.checkSelected : null,
                  ]}
                >
                  {selected ? (
                    <Check
                      size={12}
                      color={colors.text.inverse}
                      strokeWidth={3}
                    />
                  ) : null}
                </View>
              </Pressable>
            );
          })
        )}
        </ResultList>
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  scrollList: {
    maxHeight: 320,
  },
  scrollContent: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    minHeight: 52,
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
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  empty: {
    paddingVertical: spacing.lg,
  },
});
