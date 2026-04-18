import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme';
import { Text } from './Text';

export type TabsVariant = 'segmented' | 'underline' | 'pill';

export interface TabItem {
  key: string;
  label: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Tabs({
  items,
  value,
  onChange,
  variant = 'segmented',
  scrollable = false,
  style,
}: TabsProps) {
  const tabs = items.map((item) => {
    const selected = item.key === value;
    return (
      <Pressable
        key={item.key}
        onPress={() => !item.disabled && onChange(item.key)}
        disabled={item.disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected, disabled: item.disabled }}
        accessibilityLabel={item.label}
        style={({ pressed }) => [
          variantStyles[variant].tab,
          selected ? variantStyles[variant].tabSelected : null,
          pressed ? styles.pressed : null,
          item.disabled ? styles.disabled : null,
        ]}
      >
        <Text
          variant="bodySm"
          color={selected ? colors.text.primary : colors.text.secondary}
          weight={selected ? '600' : undefined}
        >
          {item.label}
        </Text>
        {item.badge !== undefined ? (
          <View style={styles.badge}>
            <Text variant="caption" color={colors.text.inverse} style={styles.badgeText}>
              {item.badge}
            </Text>
          </View>
        ) : null}
      </Pressable>
    );
  });

  const wrapperStyle = [
    variant === 'segmented' ? styles.segmentedWrap : null,
    style,
  ];

  return (
    <View accessibilityRole="tablist" style={wrapperStyle}>
      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={variantStyles[variant].containerScroll}
        >
          {tabs}
        </ScrollView>
      ) : (
        <View style={variantStyles[variant].container}>{tabs}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedWrap: {
    backgroundColor: colors.surface.chip,
    borderRadius: radii.md,
    padding: 3,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
  badge: {
    minWidth: 18,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 5,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
});

const variantStyles: Record<TabsVariant, {
  container: ViewStyle;
  containerScroll: ViewStyle;
  tab: ViewStyle;
  tabSelected: ViewStyle;
}> = {
  segmented: {
    container: {
      flexDirection: 'row',
      gap: 2,
    },
    containerScroll: {
      flexDirection: 'row',
      gap: 2,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: 6,
      minHeight: 28,
    },
    tabSelected: {
      backgroundColor: colors.surface.card,
    },
  },
  underline: {
    container: {
      flexDirection: 'row',
      gap: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.soft,
    },
    containerScroll: {
      flexDirection: 'row',
      gap: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.soft,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabSelected: {
      borderBottomColor: colors.brand.primary,
    },
  },
  pill: {
    container: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    containerScroll: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radii.pill,
      backgroundColor: colors.surface.chip,
    },
    tabSelected: {
      backgroundColor: colors.brand.soft,
    },
  },
};
