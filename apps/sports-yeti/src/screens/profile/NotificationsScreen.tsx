import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  EmptyState,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  NOTIFICATIONS,
  type AppNotification,
  type NotificationType,
} from '../../mocks/profile';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'invites', label: 'Invites' },
  { key: 'payments', label: 'Payments' },
];

const TYPE_TONE: Record<NotificationType, 'brand' | 'live' | 'info' | 'warning' | 'neutral'> = {
  invite: 'brand',
  payment: 'warning',
  reminder: 'info',
  highlight: 'info',
  mention: 'neutral',
};

function NotificationRow({
  notification,
  onAction,
  onPress,
}: {
  notification: AppNotification;
  onAction: (actionId: string) => void;
  onPress: () => void;
}) {
  const Icon = notification.Icon;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={notification.title}
      accessibilityHint={notification.body}
      style={({ pressed }) => [
        styles.row,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.icon,
          notification.unread ? styles.iconUnread : null,
        ]}
      >
        <Icon
          size={18}
          color={
            notification.unread ? colors.text.inverse : colors.brand.primary
          }
          strokeWidth={2.25}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.head}>
          <Text variant="button" color={colors.text.primary} style={styles.title}>
            {notification.title}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {notification.timestamp}
          </Text>
        </View>
        <Text variant="bodySm" color={colors.text.secondary}>
          {notification.body}
        </Text>
        <View style={styles.footerRow}>
          {notification.unread ? (
            <Tag tone={TYPE_TONE[notification.type]} size="sm" leadingDot label="New" />
          ) : null}
          {notification.actions ? (
            <View style={styles.actions}>
              {notification.actions.map((a) => (
                <Button
                  key={a.id}
                  label={a.label}
                  variant={a.primary ? 'gradient' : 'soft'}
                  size="sm"
                  onPress={() => onAction(a.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function NotificationsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState<AppNotification[]>(NOTIFICATIONS);

  const visible = items.filter((n) => {
    if (tab === 'unread') return n.unread;
    if (tab === 'invites') return n.type === 'invite';
    if (tab === 'payments') return n.type === 'payment';
    return true;
  });
  const unreadCount = items.filter((n) => n.unread).length;

  const markAllRead = () => {
    Haptics.selectionAsync();
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.show({ variant: 'success', title: `Marked ${unreadCount} as read` });
  };

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  const handlePress = (n: AppNotification) => {
    markRead(n.id);
    if (!n.link) return;
    if (n.link.kind === 'team') navigation.navigate('TeamDetails', { id: n.link.id });
    if (n.link.kind === 'game') navigation.navigate('GameDetails', { id: n.link.id });
    if (n.link.kind === 'highlight')
      navigation.navigate('HighlightDetail', { id: n.link.id });
    if (n.link.kind === 'payment')
      navigation.navigate('TeamPayment', { teamId: n.link.teamId });
    if (n.link.kind === 'chat')
      navigation.navigate('Chat', { chatId: n.link.chatId });
  };

  const handleAction = (n: AppNotification, actionId: string) => {
    Haptics.selectionAsync();
    markRead(n.id);
    if (actionId === 'pay' && n.link?.kind === 'payment') {
      navigation.navigate('TeamPayment', { teamId: n.link.teamId });
      return;
    }
    if (actionId === 'accept') {
      toast.show({ variant: 'success', title: 'Invite accepted' });
      setItems((prev) => prev.filter((x) => x.id !== n.id));
      return;
    }
    if (actionId === 'decline') {
      toast.show({ variant: 'info', title: 'Invite declined' });
      setItems((prev) => prev.filter((x) => x.id !== n.id));
      return;
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          Notifications
        </Text>
        <Pressable
          onPress={markAllRead}
          accessibilityRole="button"
          accessibilityLabel={`Mark ${unreadCount} as read`}
          accessibilityState={{ disabled: unreadCount === 0 }}
          disabled={unreadCount === 0}
          hitSlop={8}
          style={styles.markBtn}
        >
          <Text
            variant="button"
            color={unreadCount === 0 ? colors.text.muted : colors.brand.primary}
          >
            Mark read
          </Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Tabs variant="pill" scrollable items={TABS} value={tab} onChange={setTab} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <EmptyState
            icon={<Bell size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title="All caught up"
            description="When new invites, reminders, or messages arrive, they'll show up here."
          />
        ) : (
          <Card style={styles.listCard}>
            {visible.map((n, idx) => (
              <View
                key={n.id}
                style={[
                  styles.rowWrap,
                  idx < visible.length - 1 ? styles.rowDivider : null,
                ]}
              >
                <NotificationRow
                  notification={n}
                  onAction={(a) => handleAction(n, a)}
                  onPress={() => handlePress(n)}
                />
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markBtn: {
    height: 44,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  listCard: {
    padding: spacing.lg,
    gap: 0,
  },
  rowWrap: {
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnread: {
    backgroundColor: colors.brand.primary,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
