import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, shadows } from '../theme';
import { Text } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export function Chip({
  label,
  selected = false,
  onPress,
  size = 'md',
  style,
  leadingIcon,
  trailingIcon,
}: ChipProps) {
  const padding = size === 'md' ? styles.padMd : styles.padSm;

  const content = (
    <View
      style={[
        styles.base,
        padding,
        selected ? styles.selected : styles.unselected,
        selected ? shadows.soft : null,
        style,
      ]}
    >
      {leadingIcon}
      <Text
        variant="button"
        color={selected ? colors.brand.deep : colors.text.primary}
      >
        {label}
      </Text>
      {trailingIcon}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.pill,
  },
  padMd: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  padSm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selected: {
    backgroundColor: colors.brand.accent,
  },
  unselected: {
    backgroundColor: colors.surface.chip,
  },
});
