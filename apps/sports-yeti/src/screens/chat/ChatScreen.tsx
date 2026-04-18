import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Plus, SendHorizonal } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import { Avatar, EmptyState, Tag, Text } from '../../ui';
import {
  CHAT_MESSAGES,
  CHATS,
  type ChatMessage,
} from '../../mocks/messages';
import { SARAH_AVATAR } from '../../mocks/avatars';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type Route = RouteProp<RootStackParamList, 'Chat'>;

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isYou = !!msg.isYou;
  return (
    <View style={[styles.bubbleRow, isYou ? styles.bubbleRowYou : null]}>
      {!isYou ? (
        <Avatar uri={msg.authorAvatar} initials={msg.authorName.charAt(0)} size={32} />
      ) : null}
      <View style={[styles.bubbleColumn, isYou ? styles.bubbleColumnYou : null]}>
        {!isYou ? (
          <Text variant="caption" color={colors.text.secondary}>
            {msg.authorName}
          </Text>
        ) : null}
        <View
          style={[
            styles.bubble,
            isYou ? styles.bubbleYou : styles.bubbleOther,
          ]}
        >
          <Text
            variant="body"
            color={isYou ? colors.text.inverse : colors.text.primary}
          >
            {msg.body}
          </Text>
        </View>
        <Text variant="caption" color={colors.text.muted}>
          {msg.timestamp}
        </Text>
        {msg.reactions && msg.reactions.length > 0 ? (
          <View style={styles.reactionsRow}>
            {msg.reactions.map((r) => (
              <View key={r.emoji} style={styles.reactionChip}>
                <Text variant="caption" color={colors.text.primary}>
                  {r.emoji} {r.count}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function ChatScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const chat = CHATS.find((c) => c.id === route.params.chatId);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => CHAT_MESSAGES[route.params.chatId] ?? [],
  );
  const scrollRef = useRef<ScrollView>(null);

  const title = chat?.title ?? route.params.title ?? 'Chat';
  const subtitle = chat?.subtitle;
  const isOnline = chat?.online;

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    Haptics.selectionAsync();
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      authorName: 'You',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body,
      timestamp: 'Just now',
      isYou: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to messages"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text variant="h3" color={colors.text.primary}>
            {title}
          </Text>
          <View style={styles.subtitleRow}>
            {isOnline ? <Tag tone="success" size="sm" leadingDot label="Online" /> : null}
            {subtitle ? (
              <Text variant="caption" color={colors.text.secondary}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.bottom + 16}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 ? (
            <EmptyState
              title="Say hi"
              description="No messages yet. Start the conversation."
            />
          ) : (
            messages.map((m) => <MessageBubble key={m.id} msg={m} />)
          )}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Attach"
            hitSlop={6}
            style={styles.attachBtn}
          >
            <Plus size={20} color={colors.brand.primary} strokeWidth={2.5} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={colors.text.muted}
            style={styles.input}
            multiline
            accessibilityLabel="Message body"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!draft.trim()}
            onPress={send}
            style={[
              styles.sendBtn,
              !draft.trim() ? styles.sendBtnDisabled : null,
            ]}
          >
            <SendHorizonal
              size={18}
              color={colors.text.inverse}
              strokeWidth={2.5}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  flex1: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
    backgroundColor: colors.surface.card,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  bubbleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  bubbleRowYou: {
    justifyContent: 'flex-end',
  },
  bubbleColumn: {
    maxWidth: '80%',
    gap: 4,
  },
  bubbleColumnYou: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bubbleOther: {
    backgroundColor: colors.surface.card,
    ...shadows.soft,
  },
  bubbleYou: {
    backgroundColor: colors.brand.primary,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  reactionChip: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    ...shadows.soft,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
