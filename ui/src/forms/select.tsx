import React, { useMemo, useState } from 'react';
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
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ws } from '../primitives/pressable';
import { ControlShell, useControlDims, type ControlSize } from './control-shell';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  /** Optional leading icon node (e.g. a sport icon). */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectGroup<T extends string = string> {
  label: string;
  options: SelectOption<T>[];
}

export type SelectItems<T extends string = string> =
  | SelectOption<T>[]
  | SelectGroup<T>[];

interface BaseSelectProps<T extends string = string> {
  options: SelectItems<T>;
  placeholder?: string;
  size?: ControlSize;
  disabled?: boolean;
  /** Show an inline search input above the option list. Recommended for >7 options. */
  searchable?: boolean;
  /** Optional standalone label (ignored in FormField). */
  label?: string;
  /** Optional standalone error (ignored in FormField). */
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export interface SingleSelectProps<T extends string = string>
  extends BaseSelectProps<T> {
  multiple?: false;
  value: T | null;
  onChange: (value: T) => void;
}

export interface MultiSelectProps<T extends string = string>
  extends BaseSelectProps<T> {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
}

export type SelectProps<T extends string = string> =
  | SingleSelectProps<T>
  | MultiSelectProps<T>;

/**
 * Searchable + optionally-multi select that renders a bottom-sheet on
 * native and a centered popover on web. API is identical across both
 * platforms; only the surfacing differs.
 */
export function Select<T extends string = string>(props: SelectProps<T>) {
  const {
    options,
    placeholder = 'Select…',
    size = 'md',
    disabled = false,
    searchable = false,
    label,
    error,
    containerStyle,
  } = props;
  const { colors, spacing, radii, shadows, typography } = useTheme();
  const fieldCtx = useFormFieldContext();
  const dims = useControlDims(size);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const isInvalid = fieldCtx?.isInvalid ?? !!error;

  const flatOptions = useMemo(() => flattenOptions(options), [options]);
  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.trim().toLowerCase();
    return filterOptions(options, q);
  }, [options, query]);

  const selectedSummary = useMemo(() => {
    if (props.multiple) {
      if (!props.value || props.value.length === 0) return null;
      if (props.value.length === 1) {
        return flatOptions.find((o) => o.value === props.value[0])?.label ?? null;
      }
      return `${props.value.length} selected`;
    }
    if (props.value == null) return null;
    return flatOptions.find((o) => o.value === props.value)?.label ?? null;
  }, [props, flatOptions]);

  const isOptionSelected = (val: T) => {
    if (props.multiple) return props.value?.includes(val) ?? false;
    return props.value === val;
  };

  const handleSelect = (opt: SelectOption<T>) => {
    if (opt.disabled) return;
    if (props.multiple) {
      const set = new Set(props.value ?? []);
      if (set.has(opt.value)) set.delete(opt.value);
      else set.add(opt.value);
      props.onChange(Array.from(set));
      return;
    }
    props.onChange(opt.value);
    setOpen(false);
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const isSheet = Platform.OS !== 'web';

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

      <Pressable
        onPress={() => !resolvedDisabled && setOpen(true)}
        disabled={resolvedDisabled}
        accessibilityRole="combobox"
        accessibilityLabel={fieldCtx?.hasLabel ? undefined : label ?? placeholder}
        accessibilityLabelledBy={fieldCtx?.hasLabel ? fieldCtx.labelId : undefined}
        accessibilityState={{ disabled: resolvedDisabled, expanded: open }}
        accessibilityHint={selectedSummary ?? undefined}
        aria-invalid={isInvalid || undefined}
        aria-haspopup="listbox"
      >
        {(state) => {
          const { hovered, focused } = ws(state);
          return (
            <ControlShell
              size={size}
              focused={focused === true || open}
              disabled={resolvedDisabled}
              invalid={isInvalid}
              trailingSlot={
                <ChevronDown
                  size={16}
                  color={colors.text.secondary}
                  strokeWidth={2.25}
                />
              }
              style={
                hovered && !resolvedDisabled
                  ? { backgroundColor: colors.brand.soft }
                  : undefined
              }
            >
              <UIText
                variant="body"
                color={selectedSummary ? colors.text.primary : colors.text.muted}
                numberOfLines={1}
                style={{ flex: 1, fontSize: dims.fontSize }}
              >
                {selectedSummary ?? placeholder}
              </UIText>
            </ControlShell>
          );
        }}
      </Pressable>

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

      <Modal
        visible={open}
        transparent
        animationType={isSheet ? 'slide' : 'fade'}
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable
            // Stop propagation — clicks inside the sheet/popover shouldn't close it.
            onPress={(e) => e.stopPropagation()}
            style={[
              isSheet ? styles.sheet : styles.popover,
              {
                backgroundColor: colors.surface.card,
                borderRadius: isSheet ? radii.cardLg : radii.lg,
                borderTopLeftRadius: isSheet ? radii.cardLg : radii.lg,
                borderTopRightRadius: isSheet ? radii.cardLg : radii.lg,
                borderBottomLeftRadius: isSheet ? 0 : radii.lg,
                borderBottomRightRadius: isSheet ? 0 : radii.lg,
                paddingTop: spacing.md,
                paddingBottom: isSheet ? spacing.xxl : spacing.md,
              },
              shadows.popover,
            ]}
          >
            {isSheet ? (
              <View style={styles.handleWrap}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: colors.border.strong },
                  ]}
                />
              </View>
            ) : null}

            <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
              <UIText variant="h3" color={colors.text.primary}>
                {label ?? placeholder}
              </UIText>
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                style={styles.closeBtn}
              >
                <X size={18} color={colors.text.secondary} strokeWidth={2.25} />
              </Pressable>
            </View>

            {searchable ? (
              <View
                style={[
                  styles.searchWrap,
                  {
                    marginHorizontal: spacing.lg,
                    marginBottom: spacing.sm,
                    borderRadius: radii.md,
                    backgroundColor: colors.surface.chipMuted,
                    paddingHorizontal: spacing.md,
                  },
                ]}
              >
                <Search size={16} color={colors.text.secondary} strokeWidth={2.25} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search…"
                  placeholderTextColor={colors.text.muted}
                  autoFocus
                  style={[
                    styles.searchInput,
                    {
                      color: colors.text.primary,
                      fontFamily: typography.body.fontFamily,
                      fontWeight: typography.body.fontWeight,
                    },
                    webNoOutline,
                  ]}
                />
              </View>
            ) : null}

            <ScrollView
              style={[
                styles.list,
                {
                  maxHeight: isSheet ? 420 : 360,
                  paddingHorizontal: spacing.sm,
                },
              ]}
              // RN's role typings don't include 'listbox', but RN-Web
              // accepts it and screen readers depend on it. Pass through.
              {...({ role: 'listbox' } as unknown as Record<string, unknown>)}
              accessibilityLabel={`${label ?? placeholder} options`}
            >
              {renderItems(filtered, {
                isSelected: isOptionSelected,
                onSelect: handleSelect,
                colors,
                spacing,
                radii,
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

interface RenderCtx<T extends string> {
  isSelected: (val: T) => boolean;
  onSelect: (opt: SelectOption<T>) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  spacing: ReturnType<typeof useTheme>['spacing'];
  radii: ReturnType<typeof useTheme>['radii'];
}

function renderItems<T extends string>(
  items: SelectItems<T>,
  ctx: RenderCtx<T>,
): React.ReactNode {
  if (items.length === 0) {
    return (
      <View style={{ padding: ctx.spacing.lg }}>
        <UIText variant="caption" color={ctx.colors.text.muted} align="center">
          No matches
        </UIText>
      </View>
    );
  }
  if ('options' in items[0]) {
    return (items as SelectGroup<T>[]).map((group) => (
      <View key={group.label}>
        <UIText
          variant="eyebrow"
          color={ctx.colors.text.muted}
          style={{ paddingHorizontal: ctx.spacing.md, marginTop: ctx.spacing.sm, marginBottom: 4 }}
        >
          {group.label}
        </UIText>
        {group.options.map((opt) => (
          <OptionRow key={opt.value} option={opt} ctx={ctx} />
        ))}
      </View>
    ));
  }
  return (items as SelectOption<T>[]).map((opt) => (
    <OptionRow key={opt.value} option={opt} ctx={ctx} />
  ));
}

function OptionRow<T extends string>({
  option,
  ctx,
}: {
  option: SelectOption<T>;
  ctx: RenderCtx<T>;
}) {
  const selected = ctx.isSelected(option.value);
  return (
    <Pressable
      onPress={() => ctx.onSelect(option)}
      disabled={option.disabled}
      // role="option" is a real ARIA role on web; RN typings only accept
      // 'menuitem'. We set both so VoiceOver-on-iOS still has a useful
      // role and web ATs get the canonical listbox/option pairing.
      {...({ role: 'option' } as unknown as Record<string, unknown>)}
      accessibilityRole="menuitem"
      accessibilityState={{ selected, disabled: option.disabled }}
      style={({ pressed }) => {
        const wsState = ws({ pressed });
        return [
          styles.option,
          {
            paddingHorizontal: ctx.spacing.md,
            paddingVertical: ctx.spacing.sm,
            borderRadius: ctx.radii.sm,
            gap: ctx.spacing.sm,
            backgroundColor: selected
              ? ctx.colors.brand.soft
              : wsState.hovered
              ? ctx.colors.surface.chipMuted
              : 'transparent',
            opacity: option.disabled ? 0.5 : 1,
          },
        ];
      }}
    >
      {option.icon ? <View style={styles.optionIcon}>{option.icon}</View> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <UIText variant="body" color={ctx.colors.text.primary}>
          {option.label}
        </UIText>
        {option.description ? (
          <UIText variant="caption" color={ctx.colors.text.muted}>
            {option.description}
          </UIText>
        ) : null}
      </View>
      {selected ? (
        <Check size={16} color={ctx.colors.brand.primary} strokeWidth={2.5} />
      ) : null}
    </Pressable>
  );
}

function flattenOptions<T extends string>(
  items: SelectItems<T>,
): SelectOption<T>[] {
  if (items.length === 0) return [];
  if ('options' in items[0]) {
    return (items as SelectGroup<T>[]).flatMap((g) => g.options);
  }
  return items as SelectOption<T>[];
}

function filterOptions<T extends string>(
  items: SelectItems<T>,
  q: string,
): SelectItems<T> {
  if (items.length === 0) return items;
  const matches = (o: SelectOption<T>) =>
    o.label.toLowerCase().includes(q) ||
    (o.description?.toLowerCase().includes(q) ?? false);
  if ('options' in items[0]) {
    return (items as SelectGroup<T>[])
      .map((g) => ({ ...g, options: g.options.filter(matches) }))
      .filter((g) => g.options.length > 0) as SelectGroup<T>[];
  }
  return (items as SelectOption<T>[]).filter(matches);
}

const webNoOutline = { outlineStyle: 'none' } as unknown as TextStyle;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  sheet: {
    width: '100%',
    maxHeight: '80%',
  },
  popover: {
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    width: 380,
    maxWidth: '92%',
    maxHeight: '80%',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  list: {
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  optionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
});
