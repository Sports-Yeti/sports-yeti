import React from 'react';
import { type WebPressableState } from '../lib/pressable';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Bell, ChevronDown, Search } from 'lucide-react-native';
import { colors, spacing, TOPBAR_HEIGHT } from '../theme';
import { Avatar, Badge, Text } from '../ui';
import { CURRENT_ADMIN, CURRENT_ORG } from '../mocks/org';

interface TopBarProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenOrgSwitcher: () => void;
  unreadNotifications: number;
}

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
    <View style={styles.bar}>
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
        <Search size={14} color={colors.text.muted} strokeWidth={2.25} />
        <Text variant="bodySm" color={colors.text.muted} style={styles.searchLabel}>
          Search players, teams, payments…
        </Text>
        <View style={styles.kbd}>
          <Text variant="caption" color={colors.text.muted}>
            {shortcut}
          </Text>
        </View>
      </Pressable>

      <View style={styles.right}>
        <Pressable
          onPress={onOpenOrgSwitcher}
          accessibilityRole="button"
          accessibilityLabel="Switch organization"
          style={({ hovered }: WebPressableState) => [
            styles.orgSwitcher,
            hovered ? styles.orgSwitcherHover : null,
          ]}
        >
          <Text variant="bodySm" color={colors.text.primary}>
            {CURRENT_ORG.name}
          </Text>
          <ChevronDown
            size={12}
            color={colors.text.secondary}
            strokeWidth={2.25}
          />
        </Pressable>

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

        <Avatar
          uri={CURRENT_ADMIN.avatar}
          initials={CURRENT_ADMIN.initials}
          size={28}
        />
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
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
    gap: spacing.lg,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 32,
    flex: 1,
    maxWidth: 480,
    backgroundColor: colors.surface.bg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  searchHover: {
    backgroundColor: colors.surface.card,
    borderColor: colors.border.strong,
  },
  searchLabel: {
    flex: 1,
  },
  kbd: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.surface.chip,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orgSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  orgSwitcherHover: {
    backgroundColor: colors.surface.bg,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.soft,
    position: 'relative',
  },
  iconBtnHover: {
    backgroundColor: colors.surface.bg,
  },
  badgeWrap: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
