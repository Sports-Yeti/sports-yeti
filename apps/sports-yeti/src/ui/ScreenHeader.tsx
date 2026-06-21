import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Bell } from 'lucide-react-native';
import { colors, shadows, spacing } from '../theme';
import { Avatar } from './Avatar';
import { Text } from './Text';

interface ScreenHeaderProps {
  avatarUri?: string;
  initials?: string;
  title?: string;
  onAvatarPress?: () => void;
  onBellPress?: () => void;
  hasNotifications?: boolean;
  variant?: 'translucent' | 'solid';
}

export function ScreenHeader({
  avatarUri,
  initials = 'SY',
  title = 'SportsYeti',
  onAvatarPress,
  onBellPress,
  hasNotifications = false,
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
