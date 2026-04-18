import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { ToastProvider } from '../ui';
import { Sidebar, type SidebarBadges } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { NotificationsPanel } from './NotificationsPanel';
import { OrgSwitcher } from './OrgSwitcher';
import { NOTIFICATIONS } from '../mocks/insights';
import { pendingTeams } from '../mocks/teams';
import { pendingBookings } from '../mocks/bookings';
import { PAYMENTS } from '../mocks/payments';
import type { AdminRouteName } from './nav';

interface AppShellProps {
  activeRoute: AdminRouteName;
  onNavigate: (route: AdminRouteName) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppShell({
  activeRoute,
  onNavigate,
  onLogout,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);

  // Wire ⌘K / Ctrl-K on web
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    const handler = (e: Event) => {
      const ev = e as KeyboardEvent;
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        setPaletteOpen(true);
      }
      if (ev.key === 'Escape') {
        setPaletteOpen(false);
        setNotificationsOpen(false);
        setOrgSwitcherOpen(false);
      }
    };
    const target = (globalThis as { window?: { addEventListener?: typeof window.addEventListener; removeEventListener?: typeof window.removeEventListener } }).window;
    target?.addEventListener?.('keydown', handler as never);
    return () => target?.removeEventListener?.('keydown', handler as never);
  }, []);

  const badges: SidebarBadges = {
    pendingTeams: pendingTeams().length,
    pendingBookings: pendingBookings().length,
    failedPayments: PAYMENTS.filter((p) => p.status === 'failed').length,
  };

  const unreadNotifications = NOTIFICATIONS.filter((n) => n.unread).length;

  const handleNavigate = useCallback(
    (route: AdminRouteName) => {
      setPaletteOpen(false);
      setNotificationsOpen(false);
      setOrgSwitcherOpen(false);
      onNavigate(route);
    },
    [onNavigate],
  );

  return (
    <ToastProvider>
      <View style={styles.root}>
        <Sidebar
          activeRoute={activeRoute}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          onNavigate={handleNavigate}
          onLogout={onLogout}
          badges={badges}
        />
        <View style={styles.main}>
          <TopBar
            onOpenSearch={openPalette}
            onOpenNotifications={() => setNotificationsOpen(true)}
            onOpenOrgSwitcher={() => setOrgSwitcherOpen(true)}
            unreadNotifications={unreadNotifications}
          />
          <View style={styles.content}>{children}</View>
        </View>

        <CommandPalette
          visible={paletteOpen}
          onRequestClose={() => setPaletteOpen(false)}
          onNavigate={handleNavigate}
        />

        <NotificationsPanel
          visible={notificationsOpen}
          onRequestClose={() => setNotificationsOpen(false)}
        />

        <OrgSwitcher
          visible={orgSwitcherOpen}
          onRequestClose={() => setOrgSwitcherOpen(false)}
        />
      </View>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surface.bg,
    minHeight: '100%',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});
