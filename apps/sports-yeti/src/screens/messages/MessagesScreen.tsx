import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import type { Team, Game } from '../../types';

interface ConversationItem {
  id: string;
  chatId: string;
  name: string;
  type: 'team' | 'game';
  subtitle: string;
  timestamp: string | null;
}

interface MessagesScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

export function MessagesScreen({ navigation }: MessagesScreenProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadConversations = useCallback(async () => {
    try {
      const [teamsResponse, gamesResponse] = await Promise.all([
        api.getTeams({ per_page: 20 }),
        api.getGames({ per_page: 20, status: 'scheduled' }),
      ]);

      const teamChats: ConversationItem[] = teamsResponse.data.map(
        (team: Team) => ({
          id: `team-${team.id}`,
          chatId: `team-${team.id}`,
          name: team.name,
          type: 'team' as const,
          subtitle: `${team.players_count ?? 0} members`,
          timestamp: null,
        })
      );

      const gameChats: ConversationItem[] = gamesResponse.data
        .filter((g: Game) => new Date(g.scheduled_at) > new Date())
        .slice(0, 10)
        .map((game: Game) => ({
          id: `game-${game.id}`,
          chatId: `game-${game.id}`,
          name: `${game.team1?.name ?? 'TBD'} vs ${game.team2?.name ?? 'TBD'}`,
          type: 'game' as const,
          subtitle: new Date(game.scheduled_at).toLocaleDateString(),
          timestamp: game.scheduled_at,
        }));

      setConversations([...teamChats, ...gameChats]);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderConversation = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={styles.conversationRow}
      onPress={() =>
        navigation.navigate('Chat', {
          chatId: item.chatId,
          title: item.name,
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.type === 'team' ? '👥' : '🏀'}
        </Text>
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.timestamp && (
            <Text style={styles.timestampText}>
              {new Date(item.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          )}
        </View>
        <View style={styles.subtitleRow}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  item.type === 'team'
                    ? COLORS.primary + '15'
                    : COLORS.secondary + '15',
              },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                {
                  color:
                    item.type === 'team' ? COLORS.primary : COLORS.secondary,
                },
              ]}
            >
              {item.type === 'team' ? 'Team' : 'Game'}
            </Text>
          </View>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No Conversations</Text>
            <Text style={styles.emptyText}>
              Join a team or game to start chatting
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 22,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  conversationName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  timestampText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  subtitleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 48 + SPACING.md * 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
