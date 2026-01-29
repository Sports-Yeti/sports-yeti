import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores';

interface Message {
  id: string;
  content: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  user_vote?: string;
  is_closed: boolean;
  closes_at?: string;
}

interface ChatScreenProps {
  route: {
    params: {
      chatId: string;
      title?: string;
    };
  };
}

export function ChatScreen({ route }: ChatScreenProps) {
  const { chatId, title } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();

  const loadMessages = async () => {
    try {
      const [messagesRes, pollsRes] = await Promise.all([
        api.getChatMessages(chatId),
        api.getChatPolls(chatId),
      ]);
      setMessages(messagesRes.data);
      setPolls(pollsRes.data);
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // In production, set up SSE connection here for real-time updates
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const message = await api.sendChatMessage(chatId, newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const votePoll = async (pollId: string, option: string) => {
    try {
      await api.voteChatPoll(chatId, pollId, option);
      // Refresh polls
      const pollsRes = await api.getChatPolls(chatId);
      setPolls(pollsRes.data);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.user_id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.messageSender}>{item.user.name}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
        <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
      </View>
    );
  };

  const renderPoll = (poll: Poll) => {
    const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);

    return (
      <View key={poll.id} style={styles.pollContainer}>
        <View style={styles.pollHeader}>
          <Text style={styles.pollIcon}>📊</Text>
          <Text style={styles.pollQuestion}>{poll.question}</Text>
        </View>
        {poll.options.map((option) => {
          const voteCount = poll.votes[option] || 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isSelected = poll.user_vote === option;

          return (
            <TouchableOpacity
              key={option}
              style={[styles.pollOption, isSelected && styles.pollOptionSelected]}
              onPress={() => !poll.is_closed && votePoll(poll.id, option)}
              disabled={poll.is_closed}
            >
              <View style={styles.pollOptionContent}>
                <Text
                  style={[
                    styles.pollOptionText,
                    isSelected && styles.pollOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                <Text style={styles.pollVoteCount}>
                  {voteCount} ({percentage.toFixed(0)}%)
                </Text>
              </View>
              <View style={styles.pollProgressBar}>
                <View
                  style={[styles.pollProgressFill, { width: `${percentage}%` }]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
        <Text style={styles.pollFooter}>
          {totalVotes} votes{poll.is_closed ? ' • Closed' : ''}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {polls.length > 0 && (
        <View style={styles.pollsSection}>
          {polls.filter((p) => !p.is_closed).map(renderPoll)}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to send a message!
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  pollsSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  pollContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pollIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  pollQuestion: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  pollOption: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pollOptionSelected: {
    borderColor: COLORS.primary,
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  pollOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  pollOptionTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  pollVoteCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  pollProgressBar: {
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  pollProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  pollFooter: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  messagesList: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: SPACING.sm,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageSender: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  messageBubble: {
    padding: SPACING.sm,
    borderRadius: 16,
    maxWidth: '100%',
  },
  ownBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.textLight,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xl * 4,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
