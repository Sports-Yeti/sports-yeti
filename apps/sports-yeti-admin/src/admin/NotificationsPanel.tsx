import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { Drawer, EmptyState, Tag, Text } from '../ui';
import {
  NOTIFICATIONS,
  type AdminNotification,
  type NotificationKind,
} from '../mocks/insights';
import { formatRelative } from '../lib/format';

interface NotificationsPanelProps {
  visible: boolean;
  onRequestClose: () => void;
}

const KIND_TONE: Record<NotificationKind, 'warning' | 'live' | 'info' | 'neutral'> = {
  team_pending: 'warning',
  payment_failed: 'live',
  booking_pending: 'warning',
  waiver_expiring: 'info',
  system: 'neutral',
};

const KIND_LABEL: Record<NotificationKind, string> = {
  team_pending: 'Approvals',
  payment_failed: 'Payments',
  booking_pending: 'Bookings',
  waiver_expiring: 'Waivers',
  system: 'System',
};

export function NotificationsPanel({
  visible,
  onRequestClose,
}: NotificationsPanelProps) {
  const [items, setItems] = useState<AdminNotification[]>(NOTIFICATIONS);
  const unreadCount = items.filter((n) => n.unread).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <Drawer
      visible={visible}
      onRequestClose={onRequestClose}
      title="Notifications"
      width={420}
    >
      <View style={styles.headerRow}>
        <Text variant="bodySm" color={colors.text.secondary}>
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </Text>
        {unreadCount > 0 ? (
          <Pressable
            onPress={markAllRead}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${unreadCount} as read`}
            hitSlop={6}
          >
            <Text variant="button" color={colors.brand.primary}>
              Mark all read
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listInner}>
        {items.length === 0 ? (
          <EmptyState
            icon={
              <Bell size={20} color={colors.brand.primary} strokeWidth={2.25} />
            }
            title="Nothing yet"
            description="When new approvals, failed payments, or system events happen, they'll show up here."
          />
        ) : (
          items.map((n) => (
            <Pressable
              key={n.id}
              onPress={() =>
                setItems((prev) =>
                  prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)),
                )
              }
              accessibilityRole="button"
              accessibilityLabel={n.title}
              accessibilityHint={n.body}
              style={({ hovered }) => [
                styles.item,
                // @ts-expect-error rn-web hovered
                hovered ? styles.itemHover : null,
              ]}
            >
              <View style={styles.itemHead}>
                <Tag tone={KIND_TONE[n.kind]} size="sm" leadingDot label={KIND_LABEL[n.kind]} />
                <Text variant="caption" color={colors.text.muted}>
                  {formatRelative(n.occurredAtIso)}
                </Text>
              </View>
              <Text variant="h4" color={colors.text.primary}>
                {n.title}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {n.body}
              </Text>
              {n.unread ? <View style={styles.unreadDot} /> : null}
            </Pressable>
          ))
        )}
      </ScrollView>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  listInner: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  item: {
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    borderRadius: 10,
    padding: spacing.md,
    gap: 4,
    position: 'relative',
  },
  itemHover: {
    borderColor: colors.border.strong,
  },
  itemHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
  },
});
