import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';
import type { ThemeDensity } from '../theme/types';
import { useFormFieldContext } from './form-field-context';

export type ControlSize = 'sm' | 'md' | 'lg';
export type ControlState =
  | 'idle'
  | 'focused'
  | 'invalid'
  | 'disabled'
  | 'readonly';

export interface ControlShellProps {
  /** Logical size for the control. The shell maps `size` × `density` to a
   *  height and padding. Mobile (comfortable) bumps every size up. */
  size?: ControlSize;
  /** Multiline shells render as a top-aligned, taller box. */
  multiline?: boolean;
  /** Visually marks the control invalid (red border). When you wrap a
   *  control in a FormField, this is auto-derived from context. */
  invalid?: boolean;
  /** Mark as disabled — dims the surface and disables interactions. */
  disabled?: boolean;
  /** Mark as focused — drives the brand-color border + focus ring. */
  focused?: boolean;
  /** Slot rendered inside the control on the leading edge (left in LTR). */
  leadingSlot?: React.ReactNode;
  /** Slot rendered on the trailing edge (right in LTR). */
  trailingSlot?: React.ReactNode;
  /** Outer shell style passthrough (custom width, margin, etc). */
  style?: StyleProp<ViewStyle>;
  /** The actual native input/control rendered inside the shell. */
  children: React.ReactNode;
}

/**
 * Renders the visible "field box" — border, padding, focus ring, addon
 * slots — used by Input, NumberInput, PasswordInput, Combobox, Select
 * trigger, DatePicker trigger, and TextArea. Centralizes all the
 * border-color + focus-ring logic so every control feels identical.
 */
export function ControlShell({
  size = 'md',
  multiline = false,
  invalid: invalidProp,
  disabled: disabledProp,
  focused = false,
  leadingSlot,
  trailingSlot,
  style,
  children,
}: ControlShellProps) {
  const { colors, radii, spacing, density } = useTheme();
  const fieldCtx = useFormFieldContext();

  const invalid = invalidProp ?? fieldCtx?.isInvalid ?? false;
  const disabled = disabledProp ?? fieldCtx?.isDisabled ?? false;

  const dims = useMemo(() => sizeMap(size, density), [size, density]);

  const borderColor = invalid
    ? colors.status.error
    : focused
    ? colors.brand.primary
    : colors.border.strong;

  const minHeight = multiline ? dims.height * 1.8 : dims.height;

  return (
    <View
      style={[
        styles.shell,
        {
          minHeight,
          paddingHorizontal: dims.paddingX,
          gap: dims.gap,
          backgroundColor: colors.surface.card,
          borderRadius: radii.md,
          borderColor,
          // Focus ring on web — render via boxShadow on the View. RN
          // ignores boxShadow but RN-Web honors it. Provides a 2px
          // halo using brand.primary at 20% opacity.
          ...(focused && !invalid
            ? webFocusRing(colors.brand.primary)
            : null),
          ...(invalid ? webFocusRing(colors.status.error) : null),
        },
        multiline ? { paddingVertical: spacing.md, alignItems: 'flex-start' } : null,
        disabled
          ? {
              backgroundColor: colors.surface.chipMuted,
              opacity: 0.7,
            }
          : null,
        style,
      ]}
    >
      {leadingSlot ? <View style={styles.slot}>{leadingSlot}</View> : null}
      <View style={styles.body}>{children}</View>
      {trailingSlot ? <View style={styles.slot}>{trailingSlot}</View> : null}
    </View>
  );
}

interface SizeDims {
  height: number;
  paddingX: number;
  gap: number;
  fontSize: number;
}

function sizeMap(size: ControlSize, density: ThemeDensity): SizeDims {
  const isMobile = density === 'comfortable';
  if (size === 'sm') {
    return isMobile
      ? { height: 44, paddingX: 12, gap: 8, fontSize: 14 }
      : { height: 32, paddingX: 10, gap: 6, fontSize: 13 };
  }
  if (size === 'lg') {
    return isMobile
      ? { height: 60, paddingX: 18, gap: 12, fontSize: 18 }
      : { height: 44, paddingX: 14, gap: 10, fontSize: 16 };
  }
  return isMobile
    ? { height: 52, paddingX: 16, gap: 10, fontSize: 16 }
    : { height: 38, paddingX: 12, gap: 8, fontSize: 14 };
}

/**
 * Density- and size-aware font/height/padding sniff for child controls
 * (Input/Combobox/etc.) that need to match the shell.
 */
export function useControlDims(size: ControlSize): SizeDims {
  const { density } = useTheme();
  return useMemo(() => sizeMap(size, density), [size, density]);
}

interface WebShadow {
  boxShadow?: string;
}

function webFocusRing(color: string): WebShadow {
  // RN-Web ignores `shadow*` and reads `boxShadow`. RN native ignores
  // `boxShadow`. Either way we get the desired effect on the right
  // platform without polluting native styles.
  return { boxShadow: `0 0 0 3px ${withAlpha(color, 0.18)}` };
}

function withAlpha(color: string, alpha: number): string {
  // Accepts #RRGGBB or rgb(...). Keeps it simple — full hex only.
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
