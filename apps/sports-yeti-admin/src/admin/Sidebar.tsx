import React from 'react';
import { type WebPressableState } from '../lib/pressable';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react-native';
import {
  colors,
  radii,
  shadows,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
  spacing,
} from '../theme';
import { Avatar, Badge, Text } from '../ui';
import { CURRENT_ADMIN, CURRENT_ORG } from '../mocks/org';
import {
  NAV_GROUPS,
  ROUTE_TO_ITEM,
  SETTINGS_ITEM,
  type AdminRouteName,
  type NavItem,
} from './nav';

export interface SidebarBadges {
  pendingTeams?: number;
  pendingBookings?: number;
  failedPayments?: number;
}

interface SidebarProps {
  activeRoute: AdminRouteName;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate: (route: AdminRouteName) => void;
  onLogout: () => void;
  badges?: SidebarBadges;
}

export function Sidebar({
  activeRoute,
  collapsed,
  onToggleCollapsed,
  onNavigate,
  onLogout,
  badges = {},
}: SidebarProps) {
  const activeItemId = ROUTE_TO_ITEM[activeRoute];

  return (
    <View
      style={[
        styles.container,
        { width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH },
      ]}
      accessibilityRole="menu"
      accessibilityLabel="Primary navigation"
    >
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text variant="button" color={colors.text.inverse}>
              SY
            </Text>
          </View>
          {!collapsed ? (
            <View style={styles.brandText}>
              <Text variant="h4" color={colors.text.sidebarPrimary}>
                {CURRENT_ORG.name}
              </Text>
              <Text variant="caption" color={colors.text.sidebarMuted}>
                {CURRENT_ORG.plan === 'pro' ? 'Pro plan' : CURRENT_ORG.plan}
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={onToggleCollapsed}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          hitSlop={6}
          style={styles.collapseBtn}
        >
          {collapsed ? (
            <ChevronsRight
              size={14}
              color={colors.text.sidebarMuted}
              strokeWidth={2.25}
            />
          ) : (
            <ChevronsLeft
              size={14}
              color={colors.text.sidebarMuted}
              strokeWidth={2.25}
            />
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.nav}
        contentContainerStyle={styles.navContent}
        showsVerticalScrollIndicator={false}
      >
        {NAV_GROUPS.map((group) => (
          <View key={group.id} style={styles.group}>
            {!collapsed ? (
              <Text
                variant="eyebrow"
                color={colors.text.sidebarMuted}
                style={styles.groupLabel}
              >
                {group.label}
              </Text>
            ) : null}
            {group.items.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                active={item.id === activeItemId}
                collapsed={collapsed}
                badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                onPress={() => onNavigate(item.route)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <NavItemRow
          item={SETTINGS_ITEM}
          active={activeItemId === SETTINGS_ITEM.id}
          collapsed={collapsed}
          onPress={() => onNavigate(SETTINGS_ITEM.route)}
        />
        <View style={styles.userRow}>
          <Avatar
            uri={CURRENT_ADMIN.avatar}
            initials={CURRENT_ADMIN.initials}
            size={32}
          />
          {!collapsed ? (
            <View style={styles.userBody}>
              <Text variant="bodySm" color={colors.text.sidebarPrimary}>
                {CURRENT_ADMIN.name}
              </Text>
              <Text variant="caption" color={colors.text.sidebarMuted}>
                {CURRENT_ADMIN.email}
              </Text>
            </View>
          ) : null}
          <Pressable
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={6}
            style={styles.logoutBtn}
          >
            <LogOut
              size={14}
              color={colors.text.sidebarMuted}
              strokeWidth={2.25}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

interface NavItemRowProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  onPress: () => void;
}

function NavItemRow({
  item,
  active,
  collapsed,
  badge,
  onPress,
}: NavItemRowProps) {
  const Icon = item.icon;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      style={({ hovered, pressed }: WebPressableState) => [
        styles.navItem,
        collapsed ? styles.navItemCollapsed : null,
        active ? styles.navItemActive : null,
        hovered && !active ? styles.navItemHover : null,
        pressed ? styles.navItemPressed : null,
      ]}
    >
      <Icon
        size={16}
        color={
          active ? colors.text.sidebarPrimary : colors.text.sidebarMuted
        }
        strokeWidth={2.25}
      />
      {!collapsed ? (
        <Text
          variant="bodySm"
          color={
            active ? colors.text.sidebarPrimary : colors.text.sidebarMuted
          }
          style={styles.navItemLabel}
        >
          {item.label}
        </Text>
      ) : null}
      {!collapsed && typeof badge === 'number' && badge > 0 ? (
        <Badge count={badge} tone="warning" />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: colors.surface.sidebar,
    borderRightWidth: 1,
    borderRightColor: colors.border.sidebar,
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.sidebar,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  brandText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  collapseBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    flex: 1,
  },
  navContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.lg,
  },
  group: {
    gap: 2,
  },
  groupLabel: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    minHeight: 32,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemHover: {
    backgroundColor: colors.surface.sidebarHover,
  },
  navItemActive: {
    backgroundColor: colors.surface.sidebarActive,
  },
  navItemPressed: {
    opacity: 0.85,
  },
  navItemLabel: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.sidebar,
    paddingTop: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  userBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  logoutBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
