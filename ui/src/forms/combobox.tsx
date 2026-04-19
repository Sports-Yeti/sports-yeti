import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Check, ChevronDown, Plus, X } from 'lucide-react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ws } from '../primitives/pressable';
import { ControlShell, useControlDims, type ControlSize } from './control-shell';
import type { InputRef } from './input';

export interface ComboboxOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ComboboxProps<T extends string = string> {
  /** Static options. For async fetching, use `onSearch` instead and
   *  pass the latest results back via `options`. */
  options: ComboboxOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** Called whenever the user types — useful for async data fetching. */
  onSearch?: (query: string) => void;
  /** Allow free-text values that aren't in `options`. Calls `onCreate`
   *  when the user presses enter on a non-matching string. */
  allowCreate?: boolean;
  onCreate?: (rawValue: string) => void;
  size?: ControlSize;
  placeholder?: string;
  disabled?: boolean;
  /** Optional standalone label (ignored in FormField). */
  label?: string;
  /** Optional standalone error (ignored in FormField). */
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Searchable typeahead. Differs from <Select>:
 *   - User can type to filter (in-place, no modal popover on web)
 *   - Optional free-text creation (`allowCreate`)
 *   - Async-friendly via `onSearch`
 *
 * For mobile parity we still surface the option list in a bottom sheet,
 * but the trigger doubles as the search input — tap once, type, pick.
 */
export const Combobox = forwardRef<InputRef, ComboboxProps>(function Combobox(
  {
    options,
    value,
    onChange,
    onSearch,
    allowCreate = false,
    onCreate,
    size = 'md',
    placeholder = 'Search…',
    disabled = false,
    label,
    error,
    containerStyle,
  }: ComboboxProps,
  ref,
) {
  const { colors, spacing, radii, shadows, typography } = useTheme();
  const fieldCtx = useFormFieldContext();
  const dims = useControlDims(size);
  const inputRef = useRef<TextInput>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      setQuery('');
      onChange(null);
    },
  }));

  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const isInvalid = fieldCtx?.isInvalid ?? !!error;

  // Display value: if there's a current `value`, show its label (when
  // not actively searching). When the user types, show the query.
  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const display = focused
    ? query
    : selectedOption?.label ?? '';

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);

  const exactMatch = filtered.find(
    (o) => o.label.toLowerCase() === query.trim().toLowerCase(),
  );
  const showCreate = allowCreate && query.trim().length > 0 && !exactMatch;

  useEffect(() => {
    if (onSearch) onSearch(query);
  }, [query, onSearch]);

  const isWeb = Platform.OS === 'web';

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.value);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleCreate = () => {
    const raw = query.trim();
    if (!raw) return;
    onCreate?.(raw);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const inputFontStyle: TextStyle = {
    fontSize: dims.fontSize,
    color: colors.text.primary,
    fontFamily: typography.body.fontFamily,
    fontWeight: typography.body.fontWeight,
  };

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {!fieldCtx && label ? (
        <UIText
          variant="eyebrow"
          color={colors.text.secondary}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </UIText>
      ) : null}

      <ControlShell
        size={size}
        focused={focused}
        disabled={resolvedDisabled}
        invalid={isInvalid}
        trailingSlot={
          value ? (
            <Pressable
              onPress={() => {
                onChange(null);
                setQuery('');
                inputRef.current?.focus();
              }}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Clear selection"
              style={styles.iconBtn}
            >
              <X size={16} color={colors.text.secondary} strokeWidth={2.25} />
            </Pressable>
          ) : (
            <ChevronDown
              size={16}
              color={colors.text.secondary}
              strokeWidth={2.25}
            />
          )
        }
      >
        <TextInput
          ref={inputRef}
          value={display}
          onChangeText={(t) => {
            setQuery(t);
            if (!open) setOpen(true);
            if (value && t !== selectedOption?.label) onChange(null);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => {
            setFocused(false);
            // Defer close so option-tap registers before list unmounts.
            setTimeout(() => setOpen(false), 120);
          }}
          editable={!resolvedDisabled}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          style={[styles.input, inputFontStyle, webNoOutline]}
          accessibilityRole="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-invalid={isInvalid || undefined}
        />
      </ControlShell>

      {!fieldCtx && error ? (
        <UIText
          variant="caption"
          color={colors.status.error}
          accessibilityLiveRegion="polite"
          style={{ marginTop: spacing.xs }}
        >
          {error}
        </UIText>
      ) : null}

      {/* Web: inline dropdown anchored under the input.
          Native: bottom sheet via Modal. */}
      {isWeb ? (
        open && (filtered.length > 0 || showCreate) ? (
          <View
            style={[
              styles.popover,
              {
                marginTop: spacing.xs,
                backgroundColor: colors.surface.card,
                borderRadius: radii.md,
                borderColor: colors.border.soft,
                borderWidth: 1,
              },
              shadows.popover,
            ]}
            {...({ role: 'listbox' } as unknown as Record<string, unknown>)}
          >
            <ScrollView style={styles.popoverList}>
              {filtered.map((opt) => (
                <OptionRow
                  key={opt.value}
                  option={opt}
                  selected={opt.value === value}
                  onSelect={handleSelect}
                  colors={colors}
                  spacing={spacing}
                  radii={radii}
                />
              ))}
              {showCreate ? (
                <CreateRow
                  query={query.trim()}
                  onCreate={handleCreate}
                  colors={colors}
                  spacing={spacing}
                  radii={radii}
                />
              ) : null}
            </ScrollView>
          </View>
        ) : null
      ) : (
        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => {
              setOpen(false);
              inputRef.current?.blur();
            }}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surface.card,
                  borderTopLeftRadius: radii.cardLg,
                  borderTopRightRadius: radii.cardLg,
                  paddingTop: spacing.md,
                  paddingBottom: spacing.xxl,
                },
                shadows.popover,
              ]}
            >
              <View style={styles.handleWrap}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: colors.border.strong },
                  ]}
                />
              </View>
              <ScrollView style={[styles.sheetList, { paddingHorizontal: spacing.sm }]}>
                {filtered.map((opt) => (
                  <OptionRow
                    key={opt.value}
                    option={opt}
                    selected={opt.value === value}
                    onSelect={handleSelect}
                    colors={colors}
                    spacing={spacing}
                    radii={radii}
                  />
                ))}
                {showCreate ? (
                  <CreateRow
                    query={query.trim()}
                    onCreate={handleCreate}
                    colors={colors}
                    spacing={spacing}
                    radii={radii}
                  />
                ) : null}
                {filtered.length === 0 && !showCreate ? (
                  <View style={{ padding: spacing.lg }}>
                    <UIText variant="caption" color={colors.text.muted} align="center">
                      No matches
                    </UIText>
                  </View>
                ) : null}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}) as <T extends string = string>(
  p: ComboboxProps<T> & { ref?: React.Ref<InputRef> },
) => React.ReactElement;

interface RowCtx {
  colors: ReturnType<typeof useTheme>['colors'];
  spacing: ReturnType<typeof useTheme>['spacing'];
  radii: ReturnType<typeof useTheme>['radii'];
}

function OptionRow({
  option,
  selected,
  onSelect,
  colors,
  spacing,
  radii,
}: {
  option: ComboboxOption;
  selected: boolean;
  onSelect: (o: ComboboxOption) => void;
} & RowCtx) {
  return (
    <Pressable
      onPress={() => onSelect(option)}
      disabled={option.disabled}
      {...({ role: 'option' } as unknown as Record<string, unknown>)}
      accessibilityRole="menuitem"
      accessibilityState={{ selected, disabled: option.disabled }}
      style={({ pressed }) => {
        const wsState = ws({ pressed });
        return [
          styles.option,
          {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radii.sm,
            gap: spacing.sm,
            backgroundColor: selected
              ? colors.brand.soft
              : wsState.hovered
              ? colors.surface.chipMuted
              : 'transparent',
            opacity: option.disabled ? 0.5 : 1,
          },
        ];
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <UIText variant="body" color={colors.text.primary}>
          {option.label}
        </UIText>
        {option.description ? (
          <UIText variant="caption" color={colors.text.muted}>
            {option.description}
          </UIText>
        ) : null}
      </View>
      {selected ? (
        <Check size={16} color={colors.brand.primary} strokeWidth={2.5} />
      ) : null}
    </Pressable>
  );
}

function CreateRow({
  query,
  onCreate,
  colors,
  spacing,
  radii,
}: {
  query: string;
  onCreate: () => void;
} & RowCtx) {
  return (
    <Pressable
      onPress={onCreate}
      accessibilityRole="button"
      accessibilityLabel={`Create "${query}"`}
      style={({ pressed }) => {
        const wsState = ws({ pressed });
        return [
          styles.option,
          {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radii.sm,
            gap: spacing.sm,
            backgroundColor: wsState.hovered
              ? colors.surface.chipMuted
              : 'transparent',
          },
        ];
      }}
    >
      <Plus size={16} color={colors.brand.primary} strokeWidth={2.5} />
      <UIText variant="body" color={colors.brand.primary}>
        Create "{query}"
      </UIText>
    </Pressable>
  );
}

const webNoOutline = { outlineStyle: 'none' } as unknown as TextStyle;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  iconBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popover: {
    overflow: 'hidden',
  },
  popoverList: {
    maxHeight: 280,
    padding: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '80%',
  },
  sheetList: {
    paddingBottom: 8,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 999,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
});
