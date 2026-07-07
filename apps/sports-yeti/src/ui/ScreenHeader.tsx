import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Bell, Menu, Search } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { fontFamilies } from '../theme/typography';
import { Avatar } from './Avatar';
import { Text } from './Text';

interface ScreenHeaderProps {
  avatarUri?: string;
  initials?: string;
  title?: string;
  onAvatarPress?: () => void;
  onBellPress?: () => void;
  hasNotifications?: boolean;
  /** Hide the notifications bell entirely (e.g. on the user's own Profile). */
  showBell?: boolean;
  variant?: 'translucent' | 'solid';
}

export function ScreenHeader({
  avatarUri,
  initials = 'SY',
  title = 'SportsYeti',
  onAvatarPress,
  onBellPress,
  hasNotifications = false,
  showBell = true,
  variant = 'translucent',
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const Container = variant === 'translucent' ? BlurView : View;
  const containerProps =
    variant === 'translucent'
      ? { intensity: 40, tint: 'light' as const }
      : {};

  return (
    <Container
      {...containerProps}
      style={[
        styles.wrapper,
        { paddingTop: insets.top + spacing.md },
        variant === 'solid' ? styles.solid : styles.translucent,
        shadows.soft,
      ]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={onAvatarPress}
          style={styles.left}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Avatar uri={avatarUri} initials={initials} size={40} />
          <Text variant="h1" color={colors.brand.deep}>
            {title}
          </Text>
        </Pressable>
        {showBell ? (
          <Pressable
            onPress={onBellPress}
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel={
              hasNotifications
                ? 'View notifications, unread items available'
                : 'View notifications'
            }
          >
            <Bell size={20} color={colors.text.primary} strokeWidth={2.25} />
            {hasNotifications ? <View style={styles.dot} /> : null}
          </Pressable>
        ) : (
          <View style={styles.bell} />
        )}
      </View>
    </Container>
  );
}

interface SearchHeaderProps {
  avatarUri?: string;
  initials?: string;
  onAvatarPress?: () => void;
  onBellPress?: () => void;
  /** Opens the full filter sheet (hamburger on the far left). */
  onFilterPress?: () => void;
  hasNotifications?: boolean;
  showBell?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  variant?: 'translucent' | 'solid';
}

/**
 * Toolbar header with the search bar inline: a hamburger filter button on the
 * far left, a search field in the middle, and the notifications bell + profile
 * avatar on the right. Used by Discover so search lives in the top toolbar.
 */
export function SearchHeader({
  avatarUri,
  initials = 'SY',
  onAvatarPress,
  onBellPress,
  onFilterPress,
  hasNotifications = false,
  showBell = true,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  variant = 'translucent',
}: SearchHeaderProps) {
  const insets = useSafeAreaInsets();
  const Container = variant === 'translucent' ? BlurView : View;
  const containerProps =
    variant === 'translucent'
      ? { intensity: 40, tint: 'light' as const }
      : {};

  return (
    <Container
      {...containerProps}
      style={[
        searchStyles.wrapper,
        { paddingTop: insets.top + spacing.md },
        variant === 'solid' ? styles.solid : styles.translucent,
        shadows.soft,
      ]}
    >
      <View style={searchStyles.row}>
        <Pressable
          onPress={onFilterPress}
          style={searchStyles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Open all filters"
          hitSlop={6}
        >
          <Menu size={22} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>

        <View style={searchStyles.field}>
          <Search size={18} color={colors.text.secondary} strokeWidth={2.5} />
          <TextInput
            style={searchStyles.input}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.text.secondary}
            value={searchValue}
            onChangeText={onSearchChange}
            accessibilityLabel="Search"
            accessibilityHint={searchPlaceholder}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {showBell ? (
          <Pressable
            onPress={onBellPress}
            style={searchStyles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel={
              hasNotifications
                ? 'View notifications, unread items available'
                : 'View notifications'
            }
            hitSlop={6}
          >
            <Bell size={20} color={colors.text.primary} strokeWidth={2.25} />
            {hasNotifications ? <View style={styles.dot} /> : null}
          </Pressable>
        ) : null}

        <Pressable
          onPress={onAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          hitSlop={6}
        >
          <Avatar uri={avatarUri} initials={initials} size={36} />
        </Pressable>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  translucent: {
    backgroundColor: colors.surface.overlay,
  },
  solid: {
    backgroundColor: colors.surface.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.live,
    borderWidth: 1,
    borderColor: colors.surface.card,
  },
});

const searchStyles = StyleSheet.create({
  wrapper: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.chipMuted,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text.primary,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 16,
  },
});
