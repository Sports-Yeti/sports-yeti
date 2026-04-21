import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  MapPin,
  MessageSquare,
  Share2,
  Shield,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  AvatarStack,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Modal,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  KIND_LABEL,
  eventById,
  type ScheduledCamp,
  type ScheduledEvent,
  type ScheduledGame,
  type ScheduledScrimmage,
} from '../../mocks/schedule';
import { CHATS } from '../../mocks/messages';
import { TEAM_DETAILS } from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<
  RootStackParamList,
  'ScheduledEventDetail'
>;
type Route = RouteProp<RootStackParamList, 'ScheduledEventDetail'>;

interface CancellationState {
  /** True until the cancel-by deadline passes. */
  canCancel: boolean;
  /** Friendly relative window, e.g. "Cancel free until Friday 5:00 PM". */
  windowLabel: string;
}

function getCancellationState(event: ScheduledEvent): CancellationState {
  const deadline = new Date(event.cancelByISO);
  const now = new Date();
  const canCancel = deadline.getTime() > now.getTime();
  const windowLabel = canCancel
    ? `${event.cancelPolicyLabel} · until ${deadline.toLocaleString(undefined, {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })}`
    : 'Cancellation window closed';
  return { canCancel, windowLabel };
}

function HeaderBar({
  onBack,
  onShare,
}: {
  onBack: () => void;
  onShare: () => void;
}) {
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        onPress={onBack}
        style={styles.iconBtn}
      >
        <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share event"
        hitSlop={8}
        onPress={onShare}
        style={styles.iconBtn}
      >
        <Share2 size={20} color={colors.text.primary} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

function HeroBlock({ event }: { event: ScheduledEvent }) {
  const Icon = event.Icon;
  const title =
    event.kind === 'game'
      ? event.title
      : event.kind === 'camp'
      ? event.campTitle
      : event.title;
  const subtitle =
    event.kind === 'game'
      ? event.league
      : event.kind === 'camp'
      ? event.sessionLabel
      : `Hosted by ${event.hostName}`;
  const kindTone =
    event.kind === 'game' ? 'brand' : event.kind === 'camp' ? 'info' : 'warning';

  return (
    <View style={styles.heroBlock}>
      <View style={styles.heroTags}>
        <Tag tone={kindTone} size="sm" label={KIND_LABEL[event.kind]} />
        {event.commitment === 'paid' ? (
          <Tag tone="success" size="sm" leadingDot label="Paid" />
        ) : (
          <Tag tone="brand" size="sm" leadingDot label="Committed" />
        )}
        {event.kind === 'game' && event.isLive ? (
          <Tag tone="live" size="sm" leadingDot label="Live now" />
        ) : null}
        <Text variant="eyebrow" color={colors.text.secondary}>
          {event.sportLabel.toUpperCase()}
        </Text>
      </View>
      <View style={styles.heroRow}>
        <IconBadge size={64} tone="brand">
          <Icon size={28} color={colors.brand.deep} strokeWidth={2.25} />
        </IconBadge>
        <View style={styles.heroText}>
          <Text variant="h1" color={colors.text.primary}>
            {title}
          </Text>
          <Text variant="bodySm" color={colors.text.secondary}>
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}

function DetailsCard({ event }: { event: ScheduledEvent }) {
  const dateLabel = new Date(event.startsAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const durationLabel = `${event.durationMinutes} min`;
  return (
    <Card style={styles.detailsCard}>
      <View style={styles.detailRow}>
        <Clock size={18} color={colors.brand.primary} strokeWidth={2.25} />
        <View style={styles.detailBody}>
          <Text variant="button" color={colors.text.primary}>
            {event.time} · {durationLabel}
          </Text>
          <Text variant="bodySm" color={colors.text.secondary}>
            {dateLabel}
          </Text>
        </View>
      </View>
      <View style={styles.detailDivider} />
      <View style={styles.detailRow}>
        <MapPin size={18} color={colors.brand.primary} strokeWidth={2.25} />
        <View style={styles.detailBody}>
          <Text variant="button" color={colors.text.primary}>
            {event.location}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function GameMatchupCard({ event }: { event: ScheduledGame }) {
  const userIsHome = event.userTeamId === event.homeTeam.id;
  const yourTeam = userIsHome ? event.homeTeam : event.awayTeam;
  return (
    <Card style={styles.matchupCard}>
      <View style={styles.matchupHead}>
        <Text variant="h3" color={colors.text.primary}>
          Matchup
        </Text>
        <Tag tone="brand" size="sm" label={`You · ${yourTeam.abbreviation}`} />
      </View>
      <View style={styles.matchupRow}>
        <View style={styles.teamColumn}>
          <View style={styles.crest}>
            <Text variant="h3" color={colors.brand.primary} align="center">
              {event.homeTeam.abbreviation}
            </Text>
          </View>
          <Text
            variant="button"
            color={colors.text.primary}
            align="center"
            numberOfLines={2}
          >
            {event.homeTeam.name}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            Home
          </Text>
        </View>
        <Text variant="h1" color={colors.text.secondary}>
          VS
        </Text>
        <View style={styles.teamColumn}>
          <View style={styles.crest}>
            <Text variant="h3" color={colors.brand.primary} align="center">
              {event.awayTeam.abbreviation}
            </Text>
          </View>
          <Text
            variant="button"
            color={colors.text.primary}
            align="center"
            numberOfLines={2}
          >
            {event.awayTeam.name}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            Away
          </Text>
        </View>
      </View>
      <Text variant="caption" color={colors.text.muted} align="center">
        Playing for {yourTeam.name}
      </Text>
    </Card>
  );
}

interface ChatLinkCardProps {
  iconColor?: string;
  iconBg?: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  eyebrow: string;
  title: string;
  subtitle: string;
  trailing?: string;
  onPress: () => void;
  testID?: string;
}

function ChatLinkCard({
  iconColor = colors.brand.deep,
  iconBg = colors.brand.soft,
  Icon,
  eyebrow,
  title,
  subtitle,
  trailing,
  onPress,
}: ChatLinkCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chatRow,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.chatIcon, { backgroundColor: iconBg }]}>
        <Icon size={20} color={iconColor} strokeWidth={2.25} />
      </View>
      <View style={styles.chatBody}>
        <Text variant="eyebrow" color={colors.brand.primary}>
          {eyebrow}
        </Text>
        <Text variant="button" color={colors.text.primary} numberOfLines={1}>
          {title}
        </Text>
        <Text variant="bodySm" color={colors.text.secondary} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.chatTrailing}>
        {trailing ? (
          <View style={styles.unreadPill}>
            <Text variant="caption" color={colors.text.inverse}>
              {trailing}
            </Text>
          </View>
        ) : null}
        <ChevronRight
          size={18}
          color={colors.text.secondary}
          strokeWidth={2.25}
        />
      </View>
    </Pressable>
  );
}

function ChatsSection({
  event,
  onOpenChat,
}: {
  event: ScheduledEvent;
  onOpenChat: (chatId: string, title: string) => void;
}) {
  const lockerRoom = CHATS.find((c) => c.id === event.lockerRoomChatId);
  const teamChat =
    event.kind === 'game'
      ? CHATS.find(
          (c) =>
            c.id ===
            (event.userTeamId === event.homeTeam.id
              ? event.homeTeam.chatId
              : event.awayTeam.chatId),
        )
      : undefined;
  const userTeam =
    event.kind === 'game'
      ? TEAM_DETAILS[event.userTeamId]
      : undefined;

  return (
    <View style={styles.section}>
      <Text variant="h2" color={colors.text.primary}>
        Chat
      </Text>
      <Card style={styles.chatList}>
        <ChatLinkCard
          Icon={MessageSquare}
          eyebrow="LOCKER ROOM"
          title={lockerRoom?.title ?? 'Locker Room'}
          subtitle={
            lockerRoom?.lastMessage ?? 'Say hi to the rest of the squad.'
          }
          trailing={
            lockerRoom && lockerRoom.unreadCount > 0
              ? String(lockerRoom.unreadCount)
              : undefined
          }
          onPress={() =>
            onOpenChat(event.lockerRoomChatId, lockerRoom?.title ?? 'Locker Room')
          }
        />
        {event.kind === 'game' && teamChat && userTeam ? (
          <>
            <View style={styles.chatDivider} />
            <ChatLinkCard
              Icon={ShieldCheck}
              iconBg={colors.surface.chip}
              iconColor={colors.brand.primary}
              eyebrow={`YOUR TEAM · ${userTeam.abbreviation}`}
              title={`Chat with ${userTeam.name}`}
              subtitle={
                teamChat.lastMessage ??
                'Coordinate lineup, kits, and post-game plans.'
              }
              trailing={
                teamChat.unreadCount > 0
                  ? String(teamChat.unreadCount)
                  : undefined
              }
              onPress={() =>
                onOpenChat(teamChat.id, `${userTeam.name} Team`)
              }
            />
          </>
        ) : null}
      </Card>
      {event.kind === 'game' ? (
        <Text variant="caption" color={colors.text.muted}>
          Locker Room is shared with both squads. Your team chat is private to{' '}
          {TEAM_DETAILS[event.userTeamId]?.name ?? 'your team'}.
        </Text>
      ) : null}
    </View>
  );
}

function CampDetails({ event }: { event: ScheduledCamp }) {
  return (
    <Card style={styles.attendeeCard}>
      <View style={styles.attendeeHead}>
        <View style={styles.coachRow}>
          <Avatar
            uri={event.coachAvatar}
            initials={event.coachName.charAt(0)}
            size={44}
          />
          <View style={styles.coachBody}>
            <Text variant="button" color={colors.text.primary}>
              {event.coachName}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              Camp lead
            </Text>
          </View>
        </View>
        <Text variant="bodySm" color={colors.brand.primary}>
          Day {event.programDay}/{event.programTotalDays}
        </Text>
      </View>
      <View style={styles.attendeeRow}>
        <AvatarStack
          uris={event.attendees}
          totalCount={event.attendeeTotal}
          size={32}
        />
        <View style={styles.attendeeMeta}>
          <Users size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {event.attendeeTotal} athletes registered
          </Text>
        </View>
      </View>
    </Card>
  );
}

function ScrimmageDetails({ event }: { event: ScheduledScrimmage }) {
  return (
    <Card style={styles.attendeeCard}>
      <View style={styles.coachRow}>
        <Avatar
          uri={event.hostAvatar}
          initials={event.hostName.charAt(0)}
          size={44}
        />
        <View style={styles.coachBody}>
          <Text variant="button" color={colors.text.primary}>
            {event.hostName}
          </Text>
          <Text variant="bodySm" color={colors.text.secondary}>
            Host
          </Text>
        </View>
      </View>
      <View style={styles.attendeeRow}>
        <AvatarStack
          uris={event.attendees}
          totalCount={event.attendeeTotal}
          size={32}
        />
        <View style={styles.attendeeMeta}>
          <Users size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {event.attendeeTotal}/{event.spotsTotal} going
          </Text>
        </View>
      </View>
    </Card>
  );
}

function CancellationCard({
  state,
  onCancel,
}: {
  state: CancellationState;
  onCancel: () => void;
}) {
  return (
    <Card style={styles.cancelCard}>
      <View style={styles.cancelHead}>
        {state.canCancel ? (
          <Shield size={18} color={colors.brand.primary} strokeWidth={2.25} />
        ) : (
          <Lock size={18} color={colors.text.muted} strokeWidth={2.25} />
        )}
        <Text variant="button" color={colors.text.primary}>
          Cancellation policy
        </Text>
      </View>
      <Text variant="bodySm" color={colors.text.secondary}>
        {state.windowLabel}
      </Text>
      {state.canCancel ? (
        <Button
          label="Cancel my spot"
          variant="ghost"
          size="md"
          onPress={onCancel}
          leadingIcon={
            <XCircle size={16} color={colors.brand.primary} strokeWidth={2.5} />
          }
          style={styles.cancelBtn}
        />
      ) : (
        <Tag
          tone="neutral"
          size="sm"
          leadingDot
          label="Window closed"
          style={styles.cancelBtn}
        />
      )}
    </Card>
  );
}

export function ScheduledEventDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const event = eventById(route.params.id);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const cancellation = useMemo(
    () => (event ? getCancellationState(event) : null),
    [event],
  );

  if (!event || !cancellation) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Event not found"
          description="It may have been cancelled or you opened a stale link."
          primaryAction={{
            label: 'Back to Schedule',
            onPress: () => navigation.goBack(),
          }}
        />
      </View>
    );
  }

  const openChat = (chatId: string, title: string) => {
    Haptics.selectionAsync();
    navigation.navigate('Chat', { chatId, title });
  };

  const handleCancel = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setConfirmCancel(false);
    setCancelled(true);
    toast.show({
      variant: 'success',
      title: 'Cancelled your spot',
      description:
        event.commitment === 'paid'
          ? 'Refund issued to your original payment method.'
          : 'You’ve been removed from the roster.',
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + 140,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeaderBar
          onBack={() => navigation.goBack()}
          onShare={() => {
            Haptics.selectionAsync();
            toast.show({ variant: 'info', title: 'Share link copied' });
          }}
        />

        <HeroBlock event={event} />

        <DetailsCard event={event} />

        {event.kind === 'game' ? <GameMatchupCard event={event} /> : null}
        {event.kind === 'camp' ? <CampDetails event={event} /> : null}
        {event.kind === 'scrimmage' ? <ScrimmageDetails event={event} /> : null}

        <ChatsSection event={event} onOpenChat={openChat} />

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Manage commitment
          </Text>
          <CancellationCard
            state={cancellation}
            onCancel={() => setConfirmCancel(true)}
          />
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        {cancelled ? (
          <View style={styles.footerRow}>
            <Tag tone="neutral" leadingDot label="No longer attending" />
            <Button
              label="Find another"
              variant="ghost"
              size="md"
              onPress={() => navigation.navigate('Discover' as never)}
            />
          </View>
        ) : (
          <View style={styles.footerRow}>
            <View style={styles.footerStatus}>
              {event.commitment === 'paid' ? (
                <Tag tone="success" leadingDot label="You’re paid in" />
              ) : (
                <Tag tone="brand" leadingDot label="You’re committed" />
              )}
              <Text variant="caption" color={colors.text.muted}>
                {cancellation.canCancel
                  ? 'Need to bail? Use the cancel button above.'
                  : 'Cancellation window has closed.'}
              </Text>
            </View>
            <Button
              label="Open Locker Room"
              variant="gradient"
              size="md"
              onPress={() =>
                openChat(
                  event.lockerRoomChatId,
                  CHATS.find((c) => c.id === event.lockerRoomChatId)?.title ??
                    'Locker Room',
                )
              }
              leadingIcon={
                <MessageSquare
                  size={16}
                  color={colors.text.inverse}
                  strokeWidth={2.5}
                />
              }
            />
          </View>
        )}
      </View>

      <Modal
        visible={confirmCancel}
        onRequestClose={() => setConfirmCancel(false)}
        variant="destructive"
        title="Cancel your spot?"
        description={
          event.commitment === 'paid'
            ? `${event.cancelPolicyLabel}. Your refund processes to the original payment method within 3–5 business days.`
            : `${event.cancelPolicyLabel}. The host will be notified so they can fill your spot.`
        }
        primaryAction={{ label: 'Cancel my spot', onPress: handleCancel }}
        secondaryAction={{
          label: 'Keep it',
          onPress: () => setConfirmCancel(false),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heroBlock: {
    gap: spacing.lg,
  },
  heroTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  detailsCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailBody: {
    flex: 1,
    gap: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  matchupCard: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  matchupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamColumn: {
    alignItems: 'center',
    gap: 4,
    width: 110,
  },
  crest: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  section: {
    gap: spacing.md,
  },
  chatList: {
    padding: 0,
    gap: 0,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.75,
  },
  chatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBody: {
    flex: 1,
    gap: 2,
  },
  chatTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unreadPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.status.live,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
    marginHorizontal: spacing.lg,
  },
  attendeeCard: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  attendeeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  coachBody: {
    gap: 2,
    flex: 1,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  attendeeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancelCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  cancelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cancelBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  footerStatus: {
    flex: 1,
    gap: 4,
  },
});
