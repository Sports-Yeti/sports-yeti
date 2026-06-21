import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';

export type TagTone =
  | 'neutral'
  | 'brand'
  | 'live'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type TagSize = 'sm' | 'md';

export interface TagProps {
  label: string;
  tone?: TagTone;
  size?: TagSize;
  /** Solid colored dot before the label (good for "live" pulse). */
  leadingDot?: boolean;
  /** Optional icon node (e.g. lucide). */
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Compact, non-interactive status indicator.
 *
 * Differs from <Chip> (interactive, denser, role="checkbox" when selected).
 * Use Tag for badges: "Live", "Approved", "Draft", "S/S 2026".
 */
export function Tag({
  label,
  tone = 'neutral',
  size = 'md',
  leadingDot = false,
  icon,
  style,
}: TagProps) {
  const { colors, radii, spacing } = useTheme();
  const palette = palettes(tone, colors);
  const padV = size === 'sm' ? spacing['2xs'] + 1 : spacing.xs;
  const padH = size === 'sm' ? spacing.xs + 2 : spacing.sm;
  const fontVariant = size === 'sm' ? 'caption' : 'bodySm';
  const dotSize = size === 'sm' ? 6 : 8;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.bg,
          borderRadius: radii.pill,
          paddingVertical: padV,
          paddingHorizontal: padH,
          gap: spacing['2xs'] + 2,
        },
        style,
      ]}
    >
      {leadingDot ? (
        <View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: palette.fg,
          }}
        />
      ) : null}
      {icon}
      <UIText variant={fontVariant} color={palette.fg} weight="600">
        {label}
      </UIText>
    </View>
  );
}

interface ColorMap {
  brand: { primary: string; soft: string; deep: string };
  text: { secondary: string; inverse: string; muted: string };
  status: { live: string; success: string; warning: string; error: string; info: string };
  surface: { chip: string; chipMuted: string };
}

function palettes(tone: TagTone, c: ColorMap) {
  switch (tone) {
    case 'brand':
      return { bg: c.brand.soft, fg: c.brand.deep };
    case 'live':
      return { bg: hexAlpha(c.status.live, 0.14), fg: c.status.live };
    case 'success':
      return { bg: hexAlpha(c.status.success, 0.14), fg: c.status.success };
    case 'warning':
      return { bg: hexAlpha(c.status.warning, 0.14), fg: c.status.warning };
    case 'error':
      return { bg: hexAlpha(c.status.error, 0.14), fg: c.status.error };
    case 'info':
      return { bg: hexAlpha(c.status.info, 0.14), fg: c.status.info };
    case 'neutral':
    default:
      return { bg: c.surface.chip, fg: c.text.secondary };
  }
}

function hexAlpha(color: string, alpha: number): string {
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
