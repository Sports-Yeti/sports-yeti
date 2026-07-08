import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';
import { ws } from '../primitives/pressable';
import { UIText } from '../text/ui-text';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

export type TabsVariant = 'underline' | 'segmented' | 'pill';

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Replaces ad-hoc home-grown tabbed UIs (Marketplace, Bookings filters,
 * referee dashboard). Renders one consistent control with three visual
 * variants — underline (default), segmented (pill-on-rail), pill row.
 */
export function Tabs({
  items,
  value,
  onChange,
  variant = 'underline',
  scrollable = false,
  style,
}: TabsProps) {
  const { colors, spacing, radii } = useTheme();

  const tabNodes = items.map((item) => {
          const selected = item.key === value;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              style={(s) => [
                styles.tab,
                {
                  paddingVertical: spacing.sm,
                  paddingHorizontal:
                    variant === 'underline' ? spacing.md : spacing.lg,
                  gap: spacing.xs,
                  borderRadius:
                    variant === 'underline' ? 0 : radii.pill,
                  backgroundColor:
                    variant === 'segmented' && selected
                      ? colors.surface.card
                      : variant === 'pill' && selected
                      ? colors.brand.primary
                      : 'transparent',
                  opacity: ws(s).pressed ? 0.9 : 1,
                },
                variant === 'underline' && selected
                  ? {
                      borderBottomWidth: 2,
                      borderBottomColor: colors.brand.primary,
                    }
                  : variant === 'underline'
                  ? {
                      borderBottomWidth: 2,
                      borderBottomColor: 'transparent',
                    }
                  : null,
              ]}
            >
              {item.icon}
              <UIText
                variant="bodySm"
                weight={selected ? '600' : '500'}
                color={
                  variant === 'pill' && selected
                    ? colors.text.inverse
                    : selected
                    ? colors.text.primary
                    : colors.text.secondary
                }
              >
                {item.label}
              </UIText>
              {item.badge ? (
                <View
                  style={{
                    paddingHorizontal: spacing.xs,
                    paddingVertical: 1,
                    borderRadius: radii.pill,
                    backgroundColor:
                      variant === 'pill' && selected
                        ? colors.text.inverse
                        : colors.brand.primary,
                  }}
                >
                  <UIText
                    variant="caption"
                    weight="700"
                    color={
                      variant === 'pill' && selected
                        ? colors.brand.primary
                        : colors.text.inverse
                    }
                  >
                    {item.badge}
                  </UIText>
                </View>
              ) : null}
            </Pressable>
          );
        });

  return (
    <View
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessibilityRole={'tablist' as any}
      style={[
        styles.outer,
        variant === 'segmented'
          ? {
              backgroundColor: colors.surface.chip,
              borderRadius: radii.pill,
              padding: spacing['2xs'] + 2,
            }
          : null,
        style,
      ]}
    >
      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.row, { gap: spacing.xs }]}
        >
          {tabNodes}
        </ScrollView>
      ) : (
        <View style={styles.row}>{tabNodes}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
