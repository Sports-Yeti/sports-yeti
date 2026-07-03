import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  LayoutGrid,
  Lock,
  MapPin,
  MessageSquare,
  Share2,
  Shield,
  UserPlus,
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
  COMMON_GAME_RULES,
  EVENT_TYPE_LABEL,
  GAME_HOSTS,
  PAYMENT_STATUS_LABEL,
  SARAH_HOST,
  SKILL_LABELS,
  sportLabel,
  type GameAttendee,
  type GamePaymentStatus,
} from '../../mocks/games';
import { FACILITIES } from '../../mocks/facilities';
import { CHATS } from '../../mocks/messages';
import { PROFILE_USER } from '../../mocks/profile';
import { formatCurrency } from '../../lib/format';
import { usePaymentMethodStore, useWatchStore } from '../../stores';
import {
  scheduledEventFromGame,
  useGameScheduleEntry,
  useScheduleStore,
} from '../../features/schedule-store';
import { useDiscoverGame } from '../../features/discover-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'GameDetails'>;
type Route = RouteProp<RootStackParamList, 'GameDetails'>;

export function GameDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const game = useDiscoverGame(route.params.id);
  // A schedule entry for this game (seeded or added this session) means the
  // player is committed (paid or RSVP'd). The Join CTA is replaced with a
  // Cancel CTA gated on the cancellation window — the same model the
  // Schedule tab uses. Join/cancel write to the shared schedule store so
  // the Schedule tab reflects them immediately.
  const {
    entry: scheduleEntry,
    isCommitted: joined,
    wasCancelled,
  } = useGameScheduleEntry(route.params.id);
  const addEvents = useScheduleStore((s) => s.addEvents);
  const cancelEvent = useScheduleStore((s) => s.cancelEvent);
  const restoreEvent = useScheduleStore((s) => s.restoreEvent);
  const [confirmJoin, setConfirmJoin] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmAddCard, setConfirmAddCard] = useState(false);
  const [confirmRepostFree, setConfirmRepostFree] = useState(false);
  const watching = useWatchStore((s) =>
    s.watchedIds.has(route.params.id),
  );
  const toggleWatch = useWatchStore((s) => s.toggle);
  const hasCard = usePaymentMethodStore((s) => s.hasCard);
  const cardLabel = usePaymentMethodStore((s) => s.cardLabel);

  if (!game) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Game not found"
          description="It may have been cancelled or you opened a stale link."
          primaryAction={{
            label: 'Back to Discover',
            onPress: () => navigation.goBack(),
          }}
        />
      </View>
    );
  }

  const host = GAME_HOSTS[game.hostId] ?? SARAH_HOST;
  const venue = FACILITIES.find((f) => f.id === game.venueId);
  // Resolve the booked court within the venue — explicit spaceId wins,
  // otherwise fall back to the venue's first listed space.
  const court =
    venue?.spaces.find((s) => s.id === game.spaceId) ?? venue?.spaces[0];
  const Icon = game.Icon;
  const spotsTone = game.spotsLeft <= 2 ? 'warning' : 'brand';
  const isPaid = game.priceCents > 0;
  // Roster fills to capacity → event is closed regardless of the mock's
  // `openStatus`. Either signal closes the join CTA.
  const isFull = game.attendeeTotal >= game.spotsTotal || game.spotsLeft <= 0;
  const isClosed = game.openStatus === 'closed' || isFull;
  // Captain (host) experience: re-fill controls show only when the current
  // user owns this game, the roster is not yet full, and the captain has
  // taken at least one drop-out (so there's a re-fill story to tell).
  const isHost = host.playerId === PROFILE_USER.playerId;
  const showCaptainRefill =
    isHost && !isClosed && (game.droppedOutCount ?? 0) > 0;

  const lockerRoom = scheduleEntry
    ? CHATS.find((c) => c.id === scheduleEntry.lockerRoomChatId)
    : undefined;
  const cancelDeadline = scheduleEntry
    ? new Date(scheduleEntry.cancelByISO)
    : null;
  const canCancel = !!cancelDeadline && cancelDeadline.getTime() > Date.now();
  const cancelWindowLabel = scheduleEntry
    ? canCancel
      ? `${scheduleEntry.cancelPolicyLabel} · until ${cancelDeadline!.toLocaleString(
          undefined,
          { weekday: 'short', hour: 'numeric', minute: '2-digit' },
        )}`
      : 'Cancellation window closed'
    : '';

  const openLockerRoom = () => {
    if (!scheduleEntry) return;
    Haptics.selectionAsync();
    navigation.navigate('Chat', {
      chatId: scheduleEntry.lockerRoomChatId,
      title: lockerRoom?.title ?? 'Locker Room',
    });
  };

  const handleCancel = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setConfirmCancel(false);
    if (scheduleEntry) cancelEvent(scheduleEntry.id);
    toast.show({
      variant: 'success',
      title: 'Cancelled your spot',
      description:
        scheduleEntry?.commitment === 'paid'
          ? 'Paid games aren’t refunded — the court is already booked.'
          : 'You’ve been removed from the roster.',
    });
  };

  const handleWatchToggle = () => {
    Haptics.selectionAsync();
    const nowWatching = toggleWatch(route.params.id);
    toast.show({
      variant: nowWatching ? 'success' : 'info',
      title: nowWatching
        ? `Watching ${game.title}`
        : `Stopped watching ${game.title}`,
      description: nowWatching
        ? 'You’ll get a notification when spots, roster, or schedule changes.'
        : undefined,
    });
  };

  // Single tap on the footer Join CTA. Routes to:
  //  - free game        → confirmJoin modal (commit)
  //  - paid + no card   → confirmAddCard modal (route to Settings)
  //  - paid + card      → confirmJoin modal (pay)
  const handleJoinPress = () => {
    Haptics.selectionAsync();
    if (isPaid && !hasCard) {
      setConfirmAddCard(true);
      return;
    }
    setConfirmJoin(true);
  };

  const handleJoin = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Re-joining a spot cancelled this session restores the same entry;
    // a fresh join maps the listing into a new schedule entry.
    if (wasCancelled && scheduleEntry) {
      restoreEvent(scheduleEntry.id);
    } else {
      addEvents([scheduledEventFromGame(game)]);
    }
    setConfirmJoin(false);
    toast.show({
      variant: 'success',
      title: isPaid
        ? `Paid · ${formatCurrency(game.priceCents)}`
        : `Committed to ${game.title}`,
      description: isPaid
        ? `${game.time} · ${game.location}. Charged to ${cardLabel ?? 'your card on file'}.`
        : `${game.time} · ${game.location}. See you there.`,
      action: {
        label: 'Add to schedule',
        onPress: () =>
          navigation.navigate('MainTabs', { screen: 'Schedule' }),
      },
    });
  };

  const handleAddCard = () => {
    setConfirmAddCard(false);
    Haptics.selectionAsync();
    navigation.navigate('Settings');
  };

  const handleInvitePlayers = () => {
    Haptics.selectionAsync();
    navigation.navigate('PlayerDirectory');
  };

  const handleRepostFree = () => {
    setConfirmRepostFree(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.show({
      variant: 'success',
      title: 'Remaining spot reposted as free',
      description:
        'Paid players keep their spots. The open seat is now $0 and visible in Discover.',
    });
  };

  const openPlayerProfile = (playerId: string | undefined, label?: string) => {
    if (!playerId) {
      if (label) {
        toast.show({ variant: 'info', title: `${label}'s profile` });
      }
      return;
    }
    Haptics.selectionAsync();
    navigation.navigate('PlayerProfile', { playerId });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
          <View style={styles.topActions}>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: watching }}
              accessibilityLabel={
                watching ? 'Stop watching this game' : 'Watch this game for updates'
              }
              hitSlop={8}
              onPress={handleWatchToggle}
              style={[styles.iconBtn, watching ? styles.iconBtnOn : null]}
            >
              {watching ? (
                <Eye
                  size={20}
                  color={colors.brand.primary}
                  strokeWidth={2.5}
                />
              ) : (
                <EyeOff
                  size={20}
                  color={colors.text.primary}
                  strokeWidth={2.25}
                />
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share game"
              hitSlop={8}
              onPress={() => {
                Haptics.selectionAsync();
                toast.show({ variant: 'info', title: 'Share link copied' });
              }}
              style={styles.iconBtn}
            >
              <Share2 size={20} color={colors.text.primary} strokeWidth={2.25} />
            </Pressable>
          </View>
        </View>

        <View style={styles.heroBlock}>
          <View style={styles.heroTop}>
            <View style={styles.heroTopTags}>
              {game.isLive ? (
                <Tag tone="live" leadingDot label="Live now" />
              ) : (
                <Tag tone="brand" label={game.status} />
              )}
              {/* League-style officiated game vs casual scrimmage — same
                  distinction the Discover cards draw. */}
              <Tag
                tone={game.eventType === 'game' ? 'brand' : 'warning'}
                label={EVENT_TYPE_LABEL[game.eventType]}
              />
              {sportLabel(game.sport) ? (
                <Tag
                  tone="info"
                  leadingDot
                  label={sportLabel(game.sport)!}
                />
              ) : null}
              {game.openStatus === 'closed' ? (
                <Tag tone="neutral" label="Closed" />
              ) : null}
              {watching ? (
                <Tag
                  tone="brand"
                  size="sm"
                  leadingDot
                  label={`Watching · ${game.watcherCount + 1}`}
                />
              ) : null}
            </View>
            <Text variant="bodySm" color={colors.text.secondary}>
              {game.distance} away
            </Text>
          </View>
          <View style={styles.heroRow}>
            <IconBadge size={64} tone="brand">
              <Icon size={28} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.heroText}>
              <Text variant="h1" color={colors.text.primary}>
                {game.title}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {SKILL_LABELS[game.skillLevel]} · {Math.round(game.durationMinutes / 60 * 10) / 10}h
              </Text>
            </View>
            <Text variant="h2" color={colors.brand.primary} align="right">
              {game.priceCents === 0 ? 'Free' : formatCurrency(game.priceCents)}
            </Text>
          </View>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Clock size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {game.time}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {new Date(game.startsAt).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <MapPin size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {game.location}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {venue ? `${venue.city} · ${venue.distanceMiles} mi away` : game.distance}
              </Text>
            </View>
            {venue ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${venue.name}`}
                hitSlop={8}
                onPress={() =>
                  navigation.navigate('FacilityDetails', { id: venue.id })
                }
              >
                <Text variant="button" color={colors.brand.primary}>
                  Venue
                </Text>
              </Pressable>
            ) : null}
          </View>
          {court ? (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <LayoutGrid
                  size={18}
                  color={colors.brand.primary}
                  strokeWidth={2.25}
                />
                <View style={styles.detailBody}>
                  <Text variant="button" color={colors.text.primary}>
                    {court.name}
                  </Text>
                  <Text variant="bodySm" color={colors.text.secondary}>
                    {court.surface} · holds {court.capacity}
                  </Text>
                </View>
              </View>
            </>
          ) : null}
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Users size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {game.attendeeTotal}/{game.spotsTotal} going
              </Text>
              <Text variant="bodySm" color={spotsTone === 'warning' ? colors.status.live : colors.text.secondary}>
                {game.spotsLeft} spot{game.spotsLeft === 1 ? '' : 's'} left
              </Text>
            </View>
            <AvatarStack uris={game.attendees} totalCount={game.attendeeTotal} size={28} />
          </View>
        </Card>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Hosted by
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${host.name}'s profile`}
            style={styles.hostRow}
            onPress={() => openPlayerProfile(host.playerId, host.name)}
          >
            <Avatar uri={host.avatar} initials={host.name.charAt(0)} size={56} />
            <View style={styles.hostBody}>
              <Text variant="h3" color={colors.text.primary}>
                {host.name}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {host.hosted} games hosted · ★ {host.rating.toFixed(1)}
              </Text>
            </View>
            <ChevronRight
              size={18}
              color={colors.text.secondary}
              strokeWidth={2.25}
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.rosterHead}>
            <Text variant="h2" color={colors.text.primary}>
              Roster
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              {isPaid
                ? `${
                    game.roster.filter((a) => a.status === 'paid').length
                  } paid · ${
                    game.roster.filter((a) => a.status === 'pending').length
                  } pending`
                : `${
                    game.roster.filter((a) => a.status === 'committed').length
                  } committed · ${
                    game.roster.filter((a) => a.status === 'pending').length
                  } pending`}
            </Text>
          </View>
          <Card style={styles.rosterCard}>
            {game.roster.map((attendee, idx) => (
              <RosterRow
                key={attendee.id}
                attendee={attendee}
                showDivider={idx < game.roster.length - 1}
                onPress={() =>
                  openPlayerProfile(attendee.playerId, attendee.name)
                }
              />
            ))}
          </Card>
        </View>

        {showCaptainRefill ? (
          <View style={styles.section}>
            <View style={styles.rosterHead}>
              <Text variant="h2" color={colors.text.primary}>
                Captain controls
              </Text>
              <Tag
                size="sm"
                tone="warning"
                label={`${game.droppedOutCount} drop-out${
                  (game.droppedOutCount ?? 0) === 1 ? '' : 's'
                }`}
              />
            </View>
            <Card style={styles.captainCard}>
              <Text variant="bodySm" color={colors.text.secondary}>
                {isPaid
                  ? 'The court is booked — drop-outs are not refunded. Re-fill the open spot to keep the per-player cost steady.'
                  : 'Re-fill the open spot before kickoff so the game stays full.'}
              </Text>
              <Button
                label="Invite players"
                variant="soft"
                size="md"
                fullWidth
                leadingIcon={
                  <UserPlus
                    size={16}
                    color={colors.brand.primary}
                    strokeWidth={2.5}
                  />
                }
                onPress={handleInvitePlayers}
              />
              {isPaid ? (
                <Button
                  label={`Repost ${game.spotsLeft} spot${
                    game.spotsLeft === 1 ? '' : 's'
                  } as free`}
                  variant="ghost"
                  size="md"
                  fullWidth
                  leadingIcon={
                    <CircleDollarSign
                      size={16}
                      color={colors.brand.primary}
                      strokeWidth={2.5}
                    />
                  }
                  onPress={() => setConfirmRepostFree(true)}
                />
              ) : null}
            </Card>
          </View>
        ) : null}

        {joined && scheduleEntry ? (
          <View style={styles.section}>
            <Text variant="h2" color={colors.text.primary}>
              Chat
            </Text>
            <Card style={styles.lockerCard}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${lockerRoom?.title ?? 'Locker Room'}`}
                onPress={openLockerRoom}
                style={({ pressed }) => [
                  styles.lockerRow,
                  pressed ? styles.lockerPressed : null,
                ]}
              >
                <View style={styles.lockerIcon}>
                  <MessageSquare
                    size={20}
                    color={colors.brand.deep}
                    strokeWidth={2.25}
                  />
                </View>
                <View style={styles.lockerBody}>
                  <Text variant="eyebrow" color={colors.brand.primary}>
                    LOCKER ROOM
                  </Text>
                  <Text variant="button" color={colors.text.primary} numberOfLines={1}>
                    {lockerRoom?.title ?? 'Locker Room'}
                  </Text>
                  <Text
                    variant="bodySm"
                    color={colors.text.secondary}
                    numberOfLines={2}
                  >
                    {lockerRoom?.lastMessage ??
                      'Say hi to the rest of the squad.'}
                  </Text>
                </View>
                <View style={styles.lockerTrailing}>
                  {lockerRoom && lockerRoom.unreadCount > 0 ? (
                    <View style={styles.unreadPill}>
                      <Text variant="caption" color={colors.text.inverse}>
                        {lockerRoom.unreadCount}
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
            </Card>
            <Card style={styles.cancelCard}>
              <View style={styles.cancelHead}>
                {canCancel ? (
                  <Shield
                    size={18}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                ) : (
                  <Lock
                    size={18}
                    color={colors.text.muted}
                    strokeWidth={2.25}
                  />
                )}
                <Text variant="button" color={colors.text.primary}>
                  Cancellation policy
                </Text>
              </View>
              <Text variant="bodySm" color={colors.text.secondary}>
                {cancelWindowLabel}
              </Text>
              {canCancel ? (
                <Button
                  label="Cancel my spot"
                  variant="ghost"
                  size="md"
                  onPress={() => setConfirmCancel(true)}
                  leadingIcon={
                    <XCircle
                      size={16}
                      color={colors.brand.primary}
                      strokeWidth={2.5}
                    />
                  }
                  style={styles.cancelBtn}
                />
              ) : null}
            </Card>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            About this game
          </Text>
          <Text variant="body" color={colors.text.primary}>
            {game.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            House rules
          </Text>
          <View style={styles.rulesList}>
            {COMMON_GAME_RULES.map((rule) => (
              <Card key={rule.id} style={styles.ruleCard}>
                <View style={styles.ruleHead}>
                  <Shield size={18} color={colors.brand.primary} strokeWidth={2.25} />
                  <Text variant="button" color={colors.text.primary}>
                    {rule.label}
                  </Text>
                </View>
                <Text variant="bodySm" color={colors.text.secondary}>
                  {rule.detail}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {isHost ? (
          <View style={styles.joinedRow}>
            <Tag tone="brand" leadingDot label="You're hosting" />
            <Button
              label="Invite players"
              variant="gradient"
              size="md"
              leadingIcon={
                <UserPlus
                  size={16}
                  color={colors.text.inverse}
                  strokeWidth={2.5}
                />
              }
              onPress={handleInvitePlayers}
            />
          </View>
        ) : joined ? (
          <View style={styles.joinedRow}>
            <Tag
              tone={isPaid ? 'success' : 'brand'}
              leadingDot
              label={isPaid ? 'Paid' : 'Committed'}
            />
            <Button
              label="View in Schedule"
              variant="ghost"
              size="md"
              leadingIcon={
                <CalendarPlus
                  size={16}
                  color={colors.brand.primary}
                  strokeWidth={2.5}
                />
              }
              onPress={() =>
                navigation.navigate('MainTabs', { screen: 'Schedule' })
              }
            />
          </View>
        ) : isClosed ? (
          <View style={styles.joinedRow}>
            <Tag tone="neutral" leadingDot label="Roster full · Closed" />
            <Button
              label="Watch for openings"
              variant="ghost"
              size="md"
              leadingIcon={
                <Eye
                  size={16}
                  color={colors.brand.primary}
                  strokeWidth={2.5}
                />
              }
              onPress={handleWatchToggle}
            />
          </View>
        ) : (
          <Button
            label={
              isPaid
                ? `Pay · ${formatCurrency(game.priceCents)}`
                : `Commit to ${game.title}`
            }
            variant="gradient"
            size="lg"
            fullWidth
            leadingIcon={
              isPaid ? (
                <CreditCard
                  size={16}
                  color={colors.text.inverse}
                  strokeWidth={2.5}
                />
              ) : undefined
            }
            onPress={handleJoinPress}
          />
        )}
      </View>

      <Modal
        visible={confirmJoin}
        onRequestClose={() => setConfirmJoin(false)}
        variant="info"
        title={
          isPaid
            ? `Pay ${formatCurrency(game.priceCents)} to join`
            : `Commit to ${game.title}`
        }
        description={
          isPaid
            ? `${formatCurrency(game.priceCents)} will be charged to ${
                cardLabel ?? 'your card on file'
              } now. The court is booked — drop-outs aren't refunded.`
            : `${game.time} at ${game.location}. You can cancel up to 2 hours before kickoff.`
        }
        primaryAction={{
          label: isPaid
            ? `Pay ${formatCurrency(game.priceCents)}`
            : 'Commit',
          onPress: handleJoin,
        }}
        secondaryAction={{
          label: 'Not now',
          onPress: () => setConfirmJoin(false),
        }}
      />

      <Modal
        visible={confirmAddCard}
        onRequestClose={() => setConfirmAddCard(false)}
        variant="info"
        title="Add a card to join"
        description={`This is a paid game (${formatCurrency(
          game.priceCents,
        )}). Add a payment method in Settings, then come back to confirm your spot.`}
        primaryAction={{ label: 'Add card', onPress: handleAddCard }}
        secondaryAction={{
          label: 'Not now',
          onPress: () => setConfirmAddCard(false),
        }}
      />

      <Modal
        visible={confirmRepostFree}
        onRequestClose={() => setConfirmRepostFree(false)}
        variant="info"
        title={`Repost ${game.spotsLeft} spot${
          game.spotsLeft === 1 ? '' : 's'
        } as free?`}
        description={
          `Existing paid players keep their spots and are not refunded — ` +
          `the court is already booked. The remaining seat${
            game.spotsLeft === 1 ? ' is' : 's are'
          } posted at $0 to fill the roster.`
        }
        primaryAction={{ label: 'Repost as free', onPress: handleRepostFree }}
        secondaryAction={{
          label: 'Not now',
          onPress: () => setConfirmRepostFree(false),
        }}
      />

      <Modal
        visible={confirmCancel}
        onRequestClose={() => setConfirmCancel(false)}
        variant="destructive"
        title="Cancel your spot?"
        description={
          scheduleEntry?.commitment === 'paid'
            ? `The court is already booked, so paid games aren't refunded. The captain will be notified so they can re-fill your spot.`
            : `${scheduleEntry?.cancelPolicyLabel ?? 'Free cancellation'}. The host will be notified so they can fill your spot.`
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

const STATUS_TONE: Record<GamePaymentStatus, 'success' | 'brand' | 'warning'> = {
  paid: 'success',
  committed: 'brand',
  pending: 'warning',
};

interface RosterRowProps {
  attendee: GameAttendee;
  showDivider: boolean;
  onPress: () => void;
}

function RosterRow({ attendee, showDivider, onPress }: RosterRowProps) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${attendee.name}'s profile`}
        onPress={onPress}
        hitSlop={4}
        style={({ pressed }) => [
          styles.rosterRow,
          pressed ? styles.rosterRowPressed : null,
        ]}
      >
        <Avatar
          uri={attendee.avatar}
          initials={attendee.name.charAt(0)}
          size={36}
        />
        <Text
          variant="button"
          color={colors.text.primary}
          style={styles.rosterName}
        >
          {attendee.name}
        </Text>
        <Tag
          size="sm"
          leadingDot
          tone={STATUS_TONE[attendee.status]}
          label={PAYMENT_STATUS_LABEL[attendee.status]}
        />
        <ChevronRight
          size={16}
          color={colors.text.muted}
          strokeWidth={2.25}
        />
      </Pressable>
      {showDivider ? <View style={styles.rosterDivider} /> : null}
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows.soft,
  },
  iconBtnOn: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  heroBlock: {
    gap: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heroTopTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    flex: 1,
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
  section: {
    gap: spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  hostBody: {
    flex: 1,
    gap: 2,
  },
  rosterHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  rosterCard: {
    padding: spacing.md,
    gap: 0,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rosterRowPressed: {
    opacity: 0.7,
  },
  rosterName: {
    flex: 1,
  },
  rosterDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  captainCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  rulesList: {
    gap: spacing.md,
  },
  ruleCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  ruleHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockerCard: {
    padding: 0,
  },
  lockerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  lockerPressed: {
    opacity: 0.75,
  },
  lockerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockerBody: {
    flex: 1,
    gap: 2,
  },
  lockerTrailing: {
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
});
