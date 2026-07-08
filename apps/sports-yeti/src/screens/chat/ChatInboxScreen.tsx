import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Plus, UserPlus } from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import { EmptyState, SearchHeader, Tabs, Text } from '../../ui';
import { ChatListRow } from '../../components/ChatListRow';
import { CHATS, type ChatPreview } from '../../mocks/messages';
import type { Squad } from '../../mocks/teams';
import { useTeamChat } from '../../features/team-chat-store';
import { useAllSquads } from '../../features/created-squads-store';
import { useTeamMembershipStore } from '../../features/team-membership-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type InboxTab = 'teams' | 'players';

const TABS: { key: InboxTab; label: string }[] = [
  { key: 'teams', label: 'Teams' },
  { key: 'players', label: 'Players' },
];

interface TeamRow {
  chat: ChatPreview;
  locked: boolean;
}

type ChatMeta = ReturnType<typeof useTeamChat.getState>['chatMetaById'][string];
type ChatThread = ReturnType<typeof useTeamChat.getState>['messagesByChat'][string];

/** Build a conversation preview for a team, preferring the seeded chat, then
 *  any session thread, then a "say hi" placeholder so every team the user is
 *  on has a tappable row. */
function teamPreview(
  team: Squad,
  sessionMeta: ChatMeta | undefined,
  thread: ChatThread | undefined,
): ChatPreview {
  const chatId = `chat-${team.id}`;
  const seeded = CHATS.find((c) => c.id === chatId);
  const messages = thread ?? [];
  const last = messages[messages.length - 1];

  // Surface this session's latest message over the seeded preview so a row the
  // user just posted in reflects the freshest activity.
  if (seeded) {
    if (!last) return seeded;
    return {
      ...seeded,
      lastMessage: `${last.isYou ? 'You' : last.authorName}: ${last.body}`,
      lastSenderName: last.authorName,
      lastTimestamp: last.timestamp,
    };
  }

  return {
    id: chatId,
    kind: 'team',
    title: team.name,
    subtitle: `${team.rosterCount} member${team.rosterCount === 1 ? '' : 's'}`,
    avatar: sessionMeta?.avatar ?? '',
    lastMessage: last
      ? `${last.isYou ? 'You' : last.authorName}: ${last.body}`
      : 'Say hi 👋',
    lastSenderName: last?.authorName ?? '',
    lastTimestamp: last?.timestamp ?? 'New',
    unreadCount: 0,
  };
}

export function ChatInboxScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<InboxTab>('teams');
  const [search, setSearch] = useState('');

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();

  const allSquads = useAllSquads();
  const membershipOverrides = useTeamMembershipStore((s) => s.overrides);
  const chatMetaById = useTeamChat((s) => s.chatMetaById);
  const messagesByChat = useTeamChat((s) => s.messagesByChat);

  // Teams the user belongs to, each surfaced as a conversation row.
  const teamRows = useMemo<TeamRow[]>(() => {
    return allSquads
      .map((s) => {
        const membership = membershipOverrides[s.id] ?? s.membership;
        return { squad: s, membership };
      })
      .filter((t) => t.membership !== 'none')
      .map(({ squad, membership }) => {
        const chatId = `chat-${squad.id}`;
        return {
          chat: teamPreview(squad, chatMetaById[chatId], messagesByChat[chatId]),
          locked: membership === 'pending',
        };
      });
  }, [allSquads, membershipOverrides, chatMetaById, messagesByChat]);

  // Direct conversations — seeded DMs plus any started this session.
  const playerRows = useMemo<ChatPreview[]>(() => {
    const sessionDms: ChatPreview[] = Object.entries(chatMetaById)
      .filter(
        ([id, meta]) =>
          meta.kind === 'direct' && !CHATS.some((c) => c.id === id),
      )
      .map(([id, meta]) => {
        const thread = messagesByChat[id] ?? [];
        const last = thread[thread.length - 1];
        return {
          id,
          kind: 'direct',
          title: meta.title,
          avatar: meta.avatar ?? (last && !last.isYou ? last.authorAvatar : ''),
          lastMessage: last
            ? `${last.isYou ? 'You' : last.authorName}: ${last.body}`
            : 'Say hi 👋',
          lastSenderName: last?.authorName ?? '',
          lastTimestamp: last?.timestamp ?? 'New',
          unreadCount: 0,
        };
      });
    return [...sessionDms, ...CHATS.filter((c) => c.kind === 'direct')];
  }, [chatMetaById, messagesByChat]);

  const query = search.trim().toLowerCase();
  const matches = (c: ChatPreview) =>
    !query || `${c.title} ${c.lastMessage}`.toLowerCase().includes(query);

  const visibleTeams = useMemo(
    () => teamRows.filter((t) => matches(t.chat)),
    // matches closes over query; teamRows + query drive the result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teamRows, query],
  );
  const visiblePlayers = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => playerRows.filter(matches),
    [playerRows, query],
  );

  const openChat = (chat: ChatPreview) =>
    navigation.navigate('Chat', { chatId: chat.id, title: chat.title });

  return (
    <View style={styles.root}>
      <SearchHeader
        initials={initials}
        hasNotifications
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          tab === 'teams' ? 'Search team chats…' : 'Search players…'
        }
        onAvatarPress={() => navigation.navigate('Profile' as never)}
        onBellPress={() => navigation.navigate('Notifications')}
      />

      <View style={styles.tabsWrap}>
        <Tabs
          variant="segmented"
          items={TABS}
          value={tab}
          onChange={(k) => setTab(k as InboxTab)}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'teams' ? (
          visibleTeams.length === 0 ? (
            <EmptyState
              icon={
                <MessageCircle
                  size={28}
                  color={colors.brand.primary}
                  strokeWidth={2.25}
                />
              }
              title={query ? 'No team chats match' : 'No team chats yet'}
              description={
                query
                  ? 'Try a different search.'
                  : 'Join a team from the Join tab or start your own squad to open a team chat.'
              }
              primaryAction={
                query
                  ? undefined
                  : {
                      label: 'Find a team',
                      onPress: () =>
                        navigation.navigate('MainTabs', { screen: 'Join' }),
                    }
              }
            />
          ) : (
            visibleTeams.map(({ chat, locked }) => (
              <ChatListRow
                key={chat.id}
                chat={chat}
                locked={locked}
                onPress={() => openChat(chat)}
              />
            ))
          )
        ) : visiblePlayers.length === 0 ? (
          <EmptyState
            icon={
              <UserPlus size={28} color={colors.brand.primary} strokeWidth={2.25} />
            }
            title={query ? 'No players match' : 'No direct messages yet'}
            description={
              query
                ? 'Try a different search.'
                : 'Message a player from their profile or the player directory to start a conversation.'
            }
            primaryAction={
              query
                ? undefined
                : {
                    label: 'Find players',
                    onPress: () => navigation.navigate('PlayerDirectory'),
                  }
            }
          />
        ) : (
          visiblePlayers.map((chat) => (
            <ChatListRow key={chat.id} chat={chat} onPress={() => openChat(chat)} />
          ))
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New squad"
        accessibilityHint="Start a casual squad"
        onPress={() => navigation.navigate('TeamCreate')}
        style={[styles.fab, shadows.card, { bottom: insets.bottom + 110 }]}
      >
        <Plus size={20} color={colors.text.inverse} strokeWidth={2.5} />
        <Text variant="button" color={colors.text.inverse}>
          New squad
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  tabsWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.primary,
  },
});
