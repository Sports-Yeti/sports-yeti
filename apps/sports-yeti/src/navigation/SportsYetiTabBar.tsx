import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  Calendar,
  Compass,
  PlaySquare,
  User,
  Users,
} from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, radii, shadows } from '../theme';
import { Text } from '../ui/Text';

const ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  Discover: Compass,
  Highlights: PlaySquare,
  Teams: Users,
  Schedule: Calendar,
  Profile: User,
};

const LABELS: Record<string, string> = {
  Discover: 'Discover',
  Highlights: 'Highlights',
  Teams: 'Teams',
  Schedule: 'Schedule',
  Profile: 'Profile',
};

export function SportsYetiTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={50}
      tint="light"
      style={[
        styles.bar,
        shadows.nav,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const Icon = ICONS[route.name] ?? Compass;
          const label = LABELS[route.name] ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              style={[
                styles.tab,
                isFocused ? styles.tabActive : null,
              ]}
            >
              <Icon
                size={20}
                color={isFocused ? colors.brand.tint : colors.text.muted}
                strokeWidth={isFocused ? 2.5 : 2}
              />
              <Text
                variant="eyebrow"
                color={isFocused ? colors.brand.tint : colors.text.muted}
                style={styles.tabLabel}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.overlay,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radii.pill,
    gap: 4,
  },
  tabActive: {
    backgroundColor: colors.brand.soft,
  },
  tabLabel: {
    marginTop: 2,
  },
});
