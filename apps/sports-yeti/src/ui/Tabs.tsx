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

export type TabsVariant = 'underline' | 'segmented' | 'pill';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
  /** Screen-reader label — use when `badge` carries info the label lacks. */
  accessibilityLabel?: string;
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
  variant = 'underline',
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
        accessibilityLabel={item.accessibilityLabel ?? item.label}
        style={({ pressed }) => [
          variantStyles[variant].tab,
          selected ? variantStyles[variant].tabSelected : null,
          pressed ? styles.pressed : null,
          item.disabled ? styles.disabled : null,
        ]}
      >
        {item.icon ? <View style={styles.icon}>{item.icon}</View> : null}
        <Text
          variant="button"
          color={
            selected
              ? variant === 'segmented'
                ? colors.brand.deep
                : colors.brand.primary
              : colors.text.secondary
          }
        >
          {item.label}
        </Text>
        {item.badge ? (
          <View style={styles.badge}>
            <Text
              variant="caption"
              color={colors.text.inverse}
              style={styles.badgeText}
            >
              {item.badge}
            </Text>
          </View>
        ) : null}
      </Pressable>
    );
  });

  return (
    <View
      accessibilityRole="tablist"
      style={[variant === 'segmented' ? styles.segmentedWrap : null, style]}
    >
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
    borderRadius: radii.pill,
    padding: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    marginRight: 4,
  },
  badge: {
    marginLeft: 4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    lineHeight: 14,
  },
});

const variantStyles: Record<TabsVariant, {
  container: ViewStyle;
  containerScroll: ViewStyle;
  tab: ViewStyle;
  tabSelected: ViewStyle;
}> = {
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
      paddingRight: spacing.lg,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
      minHeight: 44,
    },
    tabSelected: {
      borderBottomColor: colors.brand.primary,
    },
  },
  segmented: {
    container: {
      flexDirection: 'row',
      gap: 4,
    },
    containerScroll: {
      flexDirection: 'row',
      gap: 4,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radii.pill,
      minHeight: 36,
    },
    tabSelected: {
      backgroundColor: colors.surface.card,
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
      paddingRight: spacing.lg,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radii.pill,
      backgroundColor: colors.surface.chip,
      minHeight: 40,
    },
    tabSelected: {
      backgroundColor: colors.brand.soft,
    },
  },
};
