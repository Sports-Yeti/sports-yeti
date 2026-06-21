import React from 'react';
import { type WebPressableState } from '../lib/pressable';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { Bell, ChevronDown, HelpCircle, Search } from 'lucide-react-native';
import { colors, radii, spacing, TOPBAR_HEIGHT } from '../theme';
import { Avatar, Badge, Text } from '../ui';
import { CURRENT_ADMIN, CURRENT_ORG } from '../mocks/org';

interface TopBarProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenOrgSwitcher: () => void;
  unreadNotifications: number;
}

// Web-only `backdrop-filter` glass. RN Native ignores unknown props,
// so this is a no-op on iOS/Android (the admin app is web-only anyway).
const GLASS_WEB_STYLE = (Platform.OS === 'web'
  ? ({
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
    } as unknown as ViewStyle)
  : null) as ViewStyle | null;

export function TopBar({
  onOpenSearch,
  onOpenNotifications,
  onOpenOrgSwitcher,
  unreadNotifications,
}: TopBarProps) {
  const shortcut = typeof navigator !== 'undefined' && /Mac/i.test(
    (navigator as { userAgent?: string }).userAgent ?? '',
  )
    ? '⌘K'
    : 'Ctrl+K';

  return (
    <View style={[styles.bar, GLASS_WEB_STYLE]}>
      {/* Centered search pill (Glacier ethos: floating, frosted nav). */}
      <View style={styles.searchWrap}>
        <Pressable
          onPress={onOpenSearch}
          accessibilityRole="button"
          accessibilityLabel="Open search"
          accessibilityHint={`Press ${shortcut} to search across the admin`}
          style={({ hovered }: WebPressableState) => [
            styles.search,
            hovered ? styles.searchHover : null,
          ]}
        >
          <Search size={16} color={colors.text.muted} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.muted} style={styles.searchLabel}>
            Search players, teams, payments…
          </Text>
          <View style={styles.kbd}>
            <Text variant="caption" color={colors.text.muted}>
              {shortcut}
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.right}>
        <Pressable
          onPress={onOpenNotifications}
          accessibilityRole="button"
          accessibilityLabel={
            unreadNotifications > 0
              ? `Notifications, ${unreadNotifications} unread`
              : 'Notifications'
          }
          style={({ hovered }: WebPressableState) => [
            styles.iconBtn,
            hovered ? styles.iconBtnHover : null,
          ]}
        >
          <Bell size={16} color={colors.text.secondary} strokeWidth={2.25} />
          {unreadNotifications > 0 ? (
            <View style={styles.badgeWrap}>
              <Badge count={unreadNotifications} tone="warning" />
            </View>
          ) : null}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Help center"
          style={({ hovered }: WebPressableState) => [
            styles.iconBtn,
            hovered ? styles.iconBtnHover : null,
          ]}
        >
          <HelpCircle
            size={16}
            color={colors.text.secondary}
            strokeWidth={2.25}
          />
        </Pressable>

        <Pressable
          onPress={onOpenOrgSwitcher}
          accessibilityRole="button"
          accessibilityLabel="Switch organization or open profile"
          style={({ hovered }: WebPressableState) => [
            styles.userPill,
            hovered ? styles.userPillHover : null,
          ]}
        >
          <Avatar
            uri={CURRENT_ADMIN.avatar}
            initials={CURRENT_ADMIN.initials}
            size={28}
          />
          <View style={styles.userPillBody}>
            <Text variant="caption" color={colors.text.muted}>
              {CURRENT_ORG.name}
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {CURRENT_ADMIN.name.split(' ')[0]}
            </Text>
          </View>
          <ChevronDown
            size={12}
            color={colors.text.secondary}
            strokeWidth={2.25}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: TOPBAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.surface.glassOverlay,
    gap: spacing.lg,
  },
  searchWrap: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 40,
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.surface.containerHigh,
    borderRadius: radii.pill,
  },
  searchHover: {
    backgroundColor: colors.surface.card,
    ...({ outlineWidth: 0 } as unknown as ViewStyle),
  },
  searchLabel: {
    flex: 1,
  },
  kbd: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.surface.card,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBtnHover: {
    backgroundColor: colors.surface.containerHigh,
  },
  badgeWrap: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: 4,
    paddingRight: spacing.md,
    height: 40,
    borderRadius: radii.pill,
  },
  userPillHover: {
    backgroundColor: colors.surface.containerHigh,
  },
  userPillBody: {
    gap: 1,
  },
});
