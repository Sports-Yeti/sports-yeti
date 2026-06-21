import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MessageCircle } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  EmptyState,
  SearchBar,
  Tabs,
  Tag,
  Text,
} from '../../ui';
import { CHATS, type ChatPreview } from '../../mocks/messages';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'team', label: 'Teams' },
  { key: 'direct', label: 'DMs' },
  { key: 'event', label: 'Events' },
];

function ChatRow({
  chat,
  onPress,
}: {
  chat: ChatPreview;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${chat.title}, ${chat.unreadCount} unread`}
      style={({ pressed }) => [
        styles.row,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.avatarShell}>
        <Avatar uri={chat.avatar} initials={chat.title.charAt(0)} size={48} />
        {chat.online ? <View style={styles.onlineDot} /> : null}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.headRow}>
          <Text variant="button" color={colors.text.primary} style={styles.title}>
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
          <Text variant="caption" color={colors.text.muted}>
            {chat.subtitle}
          </Text>
        ) : null}
      </View>
      {chat.unreadCount > 0 ? (
        <Tag tone="brand" size="sm" label={String(chat.unreadCount)} />
      ) : null}
    </Pressable>
  );
}

export function MessagesScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CHATS.filter((c) => {
      if (tab !== 'all' && c.kind !== tab) return false;
      if (q) {
        const hay = `${c.title} ${c.lastMessage}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tab, search]);

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
          Messages
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.filtersWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations…"
          onFilterPress={() => undefined}
        />
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
            icon={
              <MessageCircle
                size={28}
                color={colors.brand.primary}
                strokeWidth={2.25}
              />
            }
            title="No conversations"
            description="Join a team or game to start chatting with players."
          />
        ) : (
          visible.map((c) => (
            <ChatRow
              key={c.id}
              chat={c}
              onPress={() =>
                navigation.navigate('Chat', { chatId: c.id, title: c.title })
              }
            />
          ))
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
  filtersWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
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
