import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Avatar, Tag, Text } from '../ui';
import type { ChatPreview } from '../mocks/messages';

interface ChatListRowProps {
  chat: ChatPreview;
  onPress: () => void;
  /** Show a lock glyph when the chat is gated (e.g. pending application). */
  locked?: boolean;
}

/**
 * Single conversation row shared by the Chat inbox and the Messages screen —
 * avatar (with online dot), title, last-message preview, timestamp, and an
 * unread count badge.
 */
export function ChatListRow({ chat, onPress, locked }: ChatListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${chat.title}, ${chat.lastMessage}, ${chat.lastTimestamp}${
        chat.unreadCount > 0 ? `, ${chat.unreadCount} unread` : ''
      }${locked ? ', locked' : ''}`}
      accessibilityHint="Opens the conversation"
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <View style={styles.avatarShell}>
        <Avatar uri={chat.avatar} initials={chat.title.charAt(0)} size={48} />
        {chat.online ? <View style={styles.onlineDot} /> : null}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.headRow}>
          <Text
            variant="button"
            color={colors.text.primary}
            style={styles.title}
            numberOfLines={1}
          >
            {chat.title}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {chat.lastTimestamp}
          </Text>
        </View>
        <Text
          variant="bodySm"
          color={colors.text.secondary}
          numberOfLines={1}
          style={styles.preview}
        >
          {chat.lastMessage}
        </Text>
        {chat.subtitle ? (
          <Text variant="caption" color={colors.text.muted} numberOfLines={1}>
            {chat.subtitle}
          </Text>
        ) : null}
      </View>
      {locked ? (
        <Lock size={16} color={colors.text.muted} strokeWidth={2.25} />
      ) : chat.unreadCount > 0 ? (
        <Tag tone="brand" size="sm" label={String(chat.unreadCount)} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    borderRadius: radii.lg,
    minHeight: 64,
    ...shadows.soft,
  },
  pressed: {
    opacity: 0.85,
  },
  avatarShell: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: colors.surface.card,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  preview: {
    marginRight: spacing.md,
  },
});
