import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme';
import { Text } from '../ui';

export type SectionHeaderTone = 'brand' | 'alpine' | 'success' | 'warning' | 'neutral';

interface SectionHeaderProps {
  /** Lucide icon (or any node) rendered inside the tinted bubble. */
  icon: React.ReactNode;
  title: string;
  description?: string;
  tone?: SectionHeaderTone;
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const TONE_BG: Record<SectionHeaderTone, string> = {
  brand: colors.brand.soft,
  alpine: colors.brand.alpineSoft,
  success: '#E2F4E4',
  warning: '#FFF1DC',
  neutral: colors.surface.containerHigh,
};

/**
 * Glacier "section starter" — large h2 title prefixed by a tinted
 * icon bubble. Replaces the bare `<h2>` pattern used inside settings
 * cards and form sections.
 */
export function SectionHeader({
  icon,
  title,
  description,
  tone = 'brand',
  trailing,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View
        style={[styles.iconBubble, { backgroundColor: TONE_BG[tone] }]}
      >
        {icon}
      </View>
      <View style={styles.body}>
        <Text variant="h2" color={colors.text.primary}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodySm" color={colors.text.muted}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  trailing: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
});
