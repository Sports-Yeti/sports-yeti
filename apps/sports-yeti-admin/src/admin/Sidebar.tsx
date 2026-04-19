import React from 'react';
import { type WebPressableState } from '../lib/pressable';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronsLeft, ChevronsRight, LogOut, Snowflake } from 'lucide-react-native';
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
          <LinearGradient
            colors={[...colors.gradient.cta]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandMark}
          >
            <Snowflake
              size={18}
              color={colors.text.inverse}
              strokeWidth={2.5}
            />
          </LinearGradient>
          {!collapsed ? (
            <View style={styles.brandText}>
              <Text variant="h3" color={colors.brand.deep}>
                {CURRENT_ORG.name}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                League Sanctuary
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={onToggleCollapsed}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          hitSlop={6}
          style={({ hovered }: WebPressableState) => [
            styles.collapseBtn,
            hovered ? styles.collapseBtnHover : null,
          ]}
        >
          {collapsed ? (
            <ChevronsRight
              size={14}
              color={colors.text.muted}
              strokeWidth={2.25}
            />
          ) : (
            <ChevronsLeft
              size={14}
              color={colors.text.muted}
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
                color={colors.text.muted}
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
            size={36}
          />
          {!collapsed ? (
            <View style={styles.userBody}>
              <Text variant="bodySm" color={colors.text.primary}>
                {CURRENT_ADMIN.name}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                {CURRENT_ADMIN.email}
              </Text>
            </View>
          ) : null}
          <Pressable
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={6}
            style={({ hovered }: WebPressableState) => [
              styles.logoutBtn,
              hovered ? styles.logoutBtnHover : null,
            ]}
          >
            <LogOut
              size={14}
              color={colors.text.muted}
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
  const labelColor = active ? colors.brand.primary : colors.text.secondary;
  const iconColor = active ? colors.brand.primary : colors.text.muted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      style={({ hovered, pressed }: WebPressableState) => [
        styles.navItem,
        collapsed ? styles.navItemCollapsed : styles.navItemRightPill,
        active ? styles.navItemActive : null,
        active && !collapsed ? styles.navItemActiveTranslate : null,
        hovered && !active ? styles.navItemHover : null,
        pressed ? styles.navItemPressed : null,
      ]}
    >
      <Icon
        size={20}
        color={iconColor}
        strokeWidth={active ? 2.5 : 2.25}
        // Filled icon look on web — Lucide doesn't ship filled variants
        // so we approximate with a thicker stroke.
      />
      {!collapsed ? (
        <Text
          variant="bodySm"
          color={labelColor}
          weight={active ? '700' : '500'}
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
    paddingVertical: spacing.lg,
    // Tonal-shift hairline rather than a hard line — Glacier "no-line" rule.
    borderRightWidth: 1,
    borderRightColor: colors.border.sidebar,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  brandText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  collapseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseBtnHover: {
    backgroundColor: colors.surface.sidebarHover,
  },
  nav: {
    flex: 1,
  },
  navContent: {
    paddingVertical: spacing.md,
    // Right-rounded-pill rows hug the LEFT edge of the sidebar and
    // leave a rail of breathing room on the right (Stitch reference).
    paddingLeft: 0,
    paddingRight: spacing.sm,
    gap: spacing.lg,
  },
  group: {
    gap: spacing['2xs'],
  },
  groupLabel: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    paddingVertical: 12,
    minHeight: 44,
  },
  navItemRightPill: {
    // Pill is rounded only on the right — left edge is flush with the
    // sidebar so the active row reads as a "tab bleeding off the rail".
    borderTopRightRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    borderRadius: radii.lg,
    marginHorizontal: spacing.sm,
  },
  navItemHover: {
    backgroundColor: colors.surface.sidebarHover,
  },
  navItemActive: {
    backgroundColor: colors.surface.sidebarActive,
  },
  navItemActiveTranslate: {
    // Subtle slide-in animation cue, matches Stitch `translate-x-1`.
    transform: [{ translateX: 4 }],
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
    paddingTop: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  userBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  logoutBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnHover: {
    backgroundColor: colors.surface.sidebarHover,
  },
});
