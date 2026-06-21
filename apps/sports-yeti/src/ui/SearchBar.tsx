import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { colors, radii, shadows } from '../theme';
import { fontFamilies } from '../theme/typography';

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onChangeText?: (value: string) => void;
  onFilterPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SearchBar({
  value,
  placeholder = 'Search sports, locations, or teams...',
  onChangeText,
  onFilterPress,
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.iconLeft}>
        <Search size={18} color={colors.text.secondary} strokeWidth={2.5} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={placeholder}
        accessibilityHint="Type to search"
        returnKeyType="search"
      />
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          style={styles.filterButton}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <SlidersHorizontal
            size={15}
            color={colors.brand.primary}
            strokeWidth={2.5}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 60,
    backgroundColor: colors.surface.chipMuted,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 50,
    paddingRight: 8,
    ...shadows.soft,
  },
  iconLeft: {
    position: 'absolute',
    left: 18,
    top: 21,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text.primary,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
});
