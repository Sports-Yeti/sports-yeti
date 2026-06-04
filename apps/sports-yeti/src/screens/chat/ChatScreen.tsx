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
import {
  CalendarClock,
  ChevronLeft,
  Lock,
  Plus,
  SendHorizonal,
  Share2,
  Trophy,
  Vote,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import { Avatar, BottomSheet, Button, EmptyState, Tag, Text, useToast } from '../../ui';
import {
  CHATS,
  type ChatCard,
  type ChatMessage,
} from '../../mocks/messages';
import {
  OPEN_LEAGUES,
  TEAM_DETAILS,
  type CommitVote,
  type OpenLeague,
} from '../../mocks/teams';
import { formatCurrency } from '../../lib/format';
import { useTeamChat, SARAH_VOTER_ID } from '../../features/team-chat-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type Route = RouteProp<RootStackParamList, 'Chat'>;

const VOTE_LABEL: Record<CommitVote, string> = {
  in: "I'm in",
  maybe: 'Maybe',
  out: "Can't",
};

// Stable reference so the zustand selector doesn't return a fresh array each
// render (which triggers an infinite getSnapshot/update loop).
const EMPTY_MESSAGES: ChatMessage[] = [];

function deriveTeamIdFromChatId(chatId: string): string | undefined {
  if (!chatId.startsWith('chat-')) return undefined;
  const candidate = chatId.replace('chat-', '');
  return TEAM_DETAILS[candidate] ? candidate : undefined;
}

function LeagueShareInline({
  card,
  onOpen,
}: {
  card: Extract<ChatCard, { kind: 'league_share' }>;
  onOpen: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${card.leagueName}`}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.cardShell,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Trophy size={18} color={colors.brand.primary} strokeWidth={2.25} />
        </View>
        <View style={styles.cardHeaderBody}>
          <Text variant="caption" color={colors.text.secondary}>
            LEAGUE
          </Text>
          <Text variant="button" color={colors.text.primary}>
            {card.leagueName}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {card.sport} · {card.city}
          </Text>
        </View>
      </View>
      <View style={styles.cardMetaRow}>
        <View style={styles.cardMetaCell}>
          <Text variant="caption" color={colors.text.secondary}>
            STARTS
          </Text>
          <Text variant="bodySm" color={colors.text.primary}>
            {card.startDate.replace('Starts ', '')}
          </Text>
        </View>
        <View style={styles.cardMetaCell}>
          <Text variant="caption" color={colors.text.secondary}>
            FEE
          </Text>
          <Text variant="bodySm" color={colors.brand.primary}>
            {card.feeCents === 0 ? 'Free' : formatCurrency(card.feeCents)}
          </Text>
        </View>
        <View style={styles.cardMetaCell}>
          <Text variant="caption" color={colors.text.secondary}>
            SPOTS
          </Text>
          <Text variant="bodySm" color={colors.text.primary}>
            {card.maxTeams - card.registeredTeams} of {card.maxTeams}
          </Text>
        </View>
      </View>
      <Tag tone="info" size="sm" leadingDot label="Tap to view league" />
    </Pressable>
  );
}

function CommitPollInline({
  card,
}: {
  card: Extract<ChatCard, { kind: 'commit_poll' }>;
}) {
  const poll = useTeamChat((s) => s.pollsById[card.pollId]);
  const vote = useTeamChat((s) => s.votePoll);

  const myVote = poll?.responses[SARAH_VOTER_ID];
  const counts = useMemo(() => {
    const base: Record<CommitVote, number> = { in: 0, maybe: 0, out: 0 };
    if (!poll) return base;
    for (const v of Object.values(poll.responses)) base[v] += 1;
    return base;
  }, [poll]);
  const totalVotes = counts.in + counts.maybe + counts.out;

  return (
    <View style={styles.cardShell}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: colors.brand.soft }]}>
          <Vote size={18} color={colors.brand.primary} strokeWidth={2.25} />
        </View>
        <View style={styles.cardHeaderBody}>
          <Text variant="caption" color={colors.text.secondary}>
            COMMIT POLL · {card.leagueName}
          </Text>
          <Text variant="button" color={colors.text.primary}>
            {card.question}
          </Text>
          {card.closesAt ? (
            <Text variant="caption" color={colors.text.secondary}>
              {card.closesAt} · {totalVotes} vote{totalVotes === 1 ? '' : 's'}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.voteRow}>
        {(['in', 'maybe', 'out'] as const).map((opt) => {
          const selected = myVote === opt;
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityLabel={`Vote ${VOTE_LABEL[opt]}`}
              accessibilityState={{ selected }}
              onPress={() => vote(card.pollId, opt)}
              style={[
                styles.voteOption,
                selected ? styles.voteOptionSelected : null,
              ]}
            >
              <Text
                variant="button"
                color={selected ? colors.text.inverse : colors.text.primary}
              >
                {VOTE_LABEL[opt]}
              </Text>
              <Text
                variant="caption"
                color={selected ? colors.text.inverse : colors.text.secondary}
              >
                {counts[opt]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MessageBubble({
  msg,
  onOpenLeague,
}: {
  msg: ChatMessage;
  onOpenLeague: (leagueId: string) => void;
}) {
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
        {msg.card?.kind === 'league_share' ? (
          <LeagueShareInline
            card={msg.card}
            onOpen={() => onOpenLeague(msg.card!.kind === 'league_share' ? msg.card.leagueId : '')}
          />
        ) : null}
        {msg.card?.kind === 'commit_poll' ? (
          <CommitPollInline card={msg.card} />
        ) : null}
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
  const toast = useToast();
  const chat = CHATS.find((c) => c.id === route.params.chatId);
  const messages = useTeamChat(
    (s) => s.messagesByChat[route.params.chatId] ?? EMPTY_MESSAGES,
  );
  const postCard = useTeamChat((s) => s.postCard);
  const appendUserMessage = useTeamChat((s) => s.appendUserMessage);
  const [draft, setDraft] = useState('');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const title = chat?.title ?? route.params.title ?? 'Chat';
  const subtitle = chat?.subtitle;
  const isOnline = chat?.online;

  const teamId = deriveTeamIdFromChatId(route.params.chatId);
  const team = teamId ? TEAM_DETAILS[teamId] : undefined;
  const isCaptain = !!team?.isCaptain;
  const isMember = team?.membership === 'member' || team?.membership === 'captain';
  // Team chat is members-only and gated solely on approval: once the captain
  // approves a player onto the roster they get full chat access. Payment never
  // blocks chat. Non-team chats (DMs, events) are unaffected.
  const blockedNonMember = !!team && !isMember;

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    Haptics.selectionAsync();
    appendUserMessage(route.params.chatId, body);
    setDraft('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const handleShareLeague = (league: OpenLeague) => {
    setShareOpen(false);
    setActionsOpen(false);
    postCard(
      route.params.chatId,
      `Take a look at ${league.name} — could be our next league.`,
      {
        kind: 'league_share',
        leagueId: league.id,
        leagueName: league.name,
        sport: league.sport,
        city: league.city,
        startDate: league.startDate,
        registrationCloses: league.registrationCloses,
        feeCents: league.feeCents,
        maxTeams: league.maxTeams,
        registeredTeams: league.registeredTeams,
      },
    );
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const handleStartPoll = (league: OpenLeague) => {
    setPollOpen(false);
    setActionsOpen(false);
    postCard(
      route.params.chatId,
      `Vote so I can lock in our ${league.name} registration:`,
      {
        kind: 'commit_poll',
        pollId: `poll-chat-${league.id}-${Date.now()}`,
        leagueId: league.id,
        leagueName: league.name,
        question: `Can you commit to the full ${league.name} season?`,
        closesAt: league.registrationCloses,
      },
    );
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const openLeague = () => {
    if (isCaptain) {
      navigation.navigate('LeagueBrowse', { mode: 'captain', teamId });
    } else {
      navigation.navigate('LeagueBrowse');
    }
  };

  if (blockedNonMember && team) {
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
            {subtitle ? (
              <Text variant="caption" color={colors.text.secondary}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.lockedBlock}>
          <EmptyState
            icon={<Lock size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title="Members only"
            description={
              team.membership === 'pending'
                ? `Your request to join ${team.name} is pending. You'll get into chat as soon as the captain approves you.`
                : `Team chat opens up once the captain approves you onto ${team.name}.`
            }
            primaryAction={{
              label: team.membership === 'pending' ? 'View team' : 'Offer to join',
              onPress: () =>
                navigation.navigate('TeamDetails', { id: team.id }),
            }}
          />
        </View>
      </View>
    );
  }

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={team ? `Open ${team.name} details` : 'Chat details'}
          onPress={() => team && navigation.navigate('TeamDetails', { id: team.id })}
          style={styles.titleBlock}
        >
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
        </Pressable>
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
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                msg={m}
                onOpenLeague={() => {
                  toast.show({
                    variant: 'info',
                    title: 'Opening league',
                    description: 'Take a look and tap "Enroll team" if it fits.',
                  });
                  openLeague();
                }}
              />
            ))
          )}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isCaptain ? 'Captain actions' : 'Attach'
            }
            hitSlop={6}
            onPress={() => setActionsOpen(true)}
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

      <BottomSheet
        visible={actionsOpen}
        onRequestClose={() => setActionsOpen(false)}
        title={isCaptain ? 'Captain actions' : 'Quick actions'}
        snapPoints={['45%']}
      >
        <View style={styles.actionsSheet}>
          {isCaptain ? (
            <>
              <ActionRow
                Icon={Trophy}
                title="Browse leagues"
                description="Search and enroll your team"
                onPress={() => {
                  setActionsOpen(false);
                  openLeague();
                }}
              />
              <ActionRow
                Icon={Share2}
                title="Share a league"
                description="Drop a card in this chat"
                onPress={() => {
                  setActionsOpen(false);
                  setShareOpen(true);
                }}
              />
              <ActionRow
                Icon={Vote}
                title="Start commit poll"
                description="Ask the squad if they're in"
                onPress={() => {
                  setActionsOpen(false);
                  setPollOpen(true);
                }}
              />
            </>
          ) : (
            <>
              <ActionRow
                Icon={CalendarClock}
                title="Add to calendar"
                description="Sync upcoming fixtures"
                onPress={() => {
                  setActionsOpen(false);
                  toast.show({ variant: 'info', title: 'Calendar coming soon' });
                }}
              />
              <ActionRow
                Icon={Trophy}
                title="Find a league"
                description="Browse open leagues"
                onPress={() => {
                  setActionsOpen(false);
                  openLeague();
                }}
              />
            </>
          )}
          <Button
            label="Cancel"
            variant="ghost"
            fullWidth
            onPress={() => setActionsOpen(false)}
          />
        </View>
      </BottomSheet>

      <BottomSheet
        visible={shareOpen}
        onRequestClose={() => setShareOpen(false)}
        title="Share a league"
        snapPoints={['72%']}
      >
        <ScrollView contentContainerStyle={styles.actionsSheet}>
          {OPEN_LEAGUES.map((league) => (
            <LeaguePickerRow
              key={league.id}
              league={league}
              onPress={() => handleShareLeague(league)}
            />
          ))}
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={pollOpen}
        onRequestClose={() => setPollOpen(false)}
        title="Pick a league for the poll"
        snapPoints={['72%']}
      >
        <ScrollView contentContainerStyle={styles.actionsSheet}>
          {OPEN_LEAGUES.map((league) => (
            <LeaguePickerRow
              key={league.id}
              league={league}
              onPress={() => handleStartPoll(league)}
            />
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

function ActionRow({
  Icon,
  title,
  description,
  onPress,
}: {
  Icon: typeof Trophy;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed ? styles.actionRowPressed : null,
      ]}
    >
      <View style={styles.cardIcon}>
        <Icon size={18} color={colors.brand.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.actionRowBody}>
        <Text variant="button" color={colors.text.primary}>
          {title}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function LeaguePickerRow({
  league,
  onPress,
}: {
  league: OpenLeague;
  onPress: () => void;
}) {
  const Icon = league.Icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Pick ${league.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed ? styles.actionRowPressed : null,
      ]}
    >
      <View style={styles.cardIcon}>
        <Icon size={18} color={colors.brand.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.actionRowBody}>
        <Text variant="button" color={colors.text.primary}>
          {league.name}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {league.sport} · {formatCurrency(league.feeCents)}
        </Text>
      </View>
    </Pressable>
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
    maxWidth: '85%',
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
  cardShell: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    width: 280,
    ...shadows.soft,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderBody: {
    flex: 1,
    gap: 2,
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface.bg,
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  cardMetaCell: {
    flex: 1,
    gap: 2,
  },
  voteRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  voteOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface.bg,
    alignItems: 'center',
    gap: 2,
  },
  voteOptionSelected: {
    backgroundColor: colors.brand.primary,
  },
  lockedBlock: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  actionsSheet: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface.card,
    ...shadows.soft,
  },
  actionRowPressed: {
    opacity: 0.75,
  },
  actionRowBody: {
    flex: 1,
    gap: 2,
  },
});
