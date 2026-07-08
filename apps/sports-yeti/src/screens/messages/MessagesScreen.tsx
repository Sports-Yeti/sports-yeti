import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MessageCircle } from 'lucide-react-native';
import { colors, spacing } from '../../theme';
import { EmptyState, SearchBar, Tabs, Text } from '../../ui';
import { ChatListRow } from '../../components/ChatListRow';
import { CHATS, type ChatPreview } from '../../mocks/messages';
import { SARAH_AVATAR } from '../../mocks/avatars';
import { useTeamChat } from '../../features/team-chat-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'team', label: 'Teams' },
  { key: 'direct', label: 'DMs' },
  { key: 'event', label: 'Events' },
];

export function MessagesScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  // Conversations started this session (fresh DMs, new locker rooms) have
  // no seeded preview — synthesize rows from the chat store so they show
  // up in the inbox alongside the fixtures.
  const chatMetaById = useTeamChat((s) => s.chatMetaById);
  const messagesByChat = useTeamChat((s) => s.messagesByChat);
  const sessionChats = useMemo<ChatPreview[]>(
    () =>
      Object.entries(chatMetaById)
        .filter(([id]) => !CHATS.some((c) => c.id === id))
        .map(([id, meta]) => {
          const thread = messagesByChat[id] ?? [];
          const last = thread[thread.length - 1];
          return {
            id,
            kind: meta.kind,
            title: meta.title,
            avatar:
              meta.avatar ??
              (last && !last.isYou ? last.authorAvatar : SARAH_AVATAR),
            lastMessage: last
              ? `${last.isYou ? 'You' : last.authorName}: ${last.body}`
              : 'Say hi 👋',
            lastSenderName: last?.authorName ?? '',
            lastTimestamp: last?.timestamp ?? 'New',
            unreadCount: 0,
          };
        }),
    [chatMetaById, messagesByChat],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...sessionChats, ...CHATS].filter((c) => {
      if (tab !== 'all' && c.kind !== tab) return false;
      if (q) {
        const hay = `${c.title} ${c.lastMessage}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sessionChats, tab, search]);

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
            <ChatListRow
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
});
