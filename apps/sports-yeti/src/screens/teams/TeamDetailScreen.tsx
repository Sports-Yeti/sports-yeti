import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Crown,
  Lock,
  MessageCircle,
  Share2,
  ShieldCheck,
  Trash2,
  Trophy,
  UserMinus,
  UserPlus,
  Vote,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Modal,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  OPEN_LEAGUES,
  TEAM_DETAILS,
  type CommitPoll,
  type OpenLeague,
  type PendingApplication,
  type RosterMember,
  type TeamDetail,
  type TeamSchedule,
} from '../../mocks/teams';
import type { ChatCard } from '../../mocks/messages';
import { formatCurrency } from '../../lib/format';
import { useTeamChat } from '../../features/team-chat-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeamDetails'>;
type Route = RouteProp<RootStackParamList, 'TeamDetails'>;
type Tab = 'roster' | 'schedule' | 'about';

const PAYMENT_TONE = {
  paid: 'success' as const,
  pending: 'warning' as const,
  overdue: 'live' as const,
  not_required: 'neutral' as const,
};

const PAYMENT_LABEL = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
  not_required: 'Free',
};

interface CaptainHandlers {
  onRemove: (m: RosterMember) => void;
}

function RosterRow({
  member,
  isCaptainView,
  costMode,
  onMessage,
  onNudge,
  captainHandlers,
}: {
  member: RosterMember;
  isCaptainView: boolean;
  costMode: 'free' | 'paid';
  onMessage: (m: RosterMember) => void;
  onNudge: (m: RosterMember) => void;
  captainHandlers: CaptainHandlers;
}) {
  const showPaymentTag = costMode === 'paid';
  return (
    <View style={styles.rosterRow}>
      <View style={styles.rosterAvatarShell}>
        <Avatar uri={member.avatar} initials={member.name.charAt(0)} size={44} />
        {member.role === 'captain' ? (
          <View style={styles.captainBadge}>
            <Crown size={10} color={colors.text.inverse} strokeWidth={3} />
          </View>
        ) : null}
      </View>
      <View style={styles.rosterBody}>
        <View style={styles.rosterHead}>
          <Text variant="button" color={colors.text.primary}>
            {member.name}
            {member.isYou ? ' · You' : ''}
          </Text>
          {showPaymentTag ? (
            <Tag
              tone={PAYMENT_TONE[member.paymentStatus]}
              size="sm"
              label={PAYMENT_LABEL[member.paymentStatus]}
            />
          ) : null}
        </View>
        <Text variant="bodySm" color={colors.text.secondary}>
          {member.position}
        </Text>
      </View>
      <View style={styles.rosterActions}>
        <Pressable
          onPress={() => onMessage(member)}
          accessibilityRole="button"
          accessibilityLabel={`Message ${member.name}`}
          hitSlop={6}
          style={styles.iconButton}
        >
          <MessageCircle
            size={18}
            color={colors.brand.primary}
            strokeWidth={2.25}
          />
        </Pressable>
        {isCaptainView && member.paymentStatus === 'overdue' ? (
          <Pressable
            onPress={() => onNudge(member)}
            accessibilityRole="button"
            accessibilityLabel={`Nudge ${member.name} to pay`}
            hitSlop={6}
            style={styles.iconButton}
          >
            <CreditCard size={18} color={colors.status.live} strokeWidth={2.25} />
          </Pressable>
        ) : null}
        {isCaptainView && member.role !== 'captain' ? (
          <Pressable
            onPress={() => captainHandlers.onRemove(member)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${member.name} from team`}
            hitSlop={6}
            style={styles.iconButton}
          >
            <UserMinus size={18} color={colors.status.error} strokeWidth={2.25} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ScheduleRow({ item }: { item: TeamSchedule }) {
  return (
    <View style={styles.scheduleRow}>
      <View style={styles.scheduleDate}>
        <Text variant="eyebrow" color={colors.text.secondary}>
          {item.date.split(' · ')[0]}
        </Text>
        <Text variant="h3" color={colors.text.primary}>
          {item.date.split(' · ')[1] ?? item.date}
        </Text>
      </View>
      <View style={styles.scheduleBody}>
        <Text variant="button" color={colors.text.primary}>
          vs {item.opponent}
        </Text>
        <Text variant="bodySm" color={colors.text.secondary}>
          {item.location}
        </Text>
      </View>
      {item.result ? (
        <Tag
          tone={
            item.result.outcome === 'W'
              ? 'success'
              : item.result.outcome === 'L'
              ? 'live'
              : 'neutral'
          }
          size="sm"
          label={`${item.result.outcome} ${item.result.home}-${item.result.away}`}
        />
      ) : (
        <Tag tone="brand" size="sm" label="Upcoming" />
      )}
    </View>
  );
}

function PendingApplicationRow({
  app,
  onApprove,
  onDecline,
}: {
  app: PendingApplication;
  onApprove: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={styles.appRow}>
      <Avatar uri={app.avatar} initials={app.name.charAt(0)} size={40} />
      <View style={styles.appBody}>
        <Text variant="button" color={colors.text.primary}>
          {app.name}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {app.position} · applied {app.appliedAt}
        </Text>
        {app.message ? (
          <Text
            variant="bodySm"
            color={colors.text.primary}
            numberOfLines={2}
            style={styles.appMessage}
          >
            "{app.message}"
          </Text>
        ) : null}
      </View>
      <View style={styles.appActions}>
        <Pressable
          onPress={onDecline}
          accessibilityRole="button"
          accessibilityLabel={`Decline ${app.name}`}
          hitSlop={6}
          style={styles.iconButton}
        >
          <Trash2 size={18} color={colors.status.error} strokeWidth={2.25} />
        </Pressable>
        <Button label="Approve" variant="gradient" size="sm" onPress={onApprove} />
      </View>
    </View>
  );
}

function CaptainControls({
  team,
  onBrowseLeagues,
  onShareLeague,
  onStartPoll,
  onInvite,
}: {
  team: TeamDetail;
  onBrowseLeagues: () => void;
  onShareLeague: () => void;
  onStartPoll: () => void;
  onInvite: () => void;
}) {
  const isFull = team.roster.length >= team.rosterMax;
  return (
    <Card style={styles.captainCard}>
      <View style={styles.captainHead}>
        <IconBadge size={40} tone="brand">
          <ShieldCheck size={18} color={colors.brand.deep} strokeWidth={2.25} />
        </IconBadge>
        <View style={styles.captainHeadBody}>
          <Text variant="h3" color={colors.text.primary}>
            Captain controls
          </Text>
          <Text variant="bodySm" color={colors.text.secondary}>
            Manage league registration, roster, and team consensus.
          </Text>
        </View>
      </View>

      {team.leagueRegistration ? (
        <View style={styles.regCard}>
          <View style={styles.regHead}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              League registration
            </Text>
            <Tag
              tone={
                team.leagueRegistration.status === 'approved'
                  ? 'success'
                  : team.leagueRegistration.status === 'pending_admin'
                  ? 'warning'
                  : team.leagueRegistration.status === 'rejected'
                  ? 'live'
                  : 'neutral'
              }
              size="sm"
              label={
                team.leagueRegistration.status === 'approved'
                  ? 'Approved · payments unlocked'
                  : team.leagueRegistration.status === 'pending_admin'
                  ? 'Pending admin'
                  : team.leagueRegistration.status === 'rejected'
                  ? 'Rejected'
                  : 'Draft'
              }
            />
          </View>
          <Text variant="button" color={colors.text.primary}>
            {team.leagueRegistration.leagueName}
          </Text>
          {team.leagueRegistration.notesFromAdmin ? (
            <Text variant="bodySm" color={colors.text.secondary}>
              {team.leagueRegistration.notesFromAdmin}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.captainActionGrid}>
        <CaptainAction
          Icon={Trophy}
          label="Browse leagues"
          description="Search and enrol your team"
          onPress={onBrowseLeagues}
        />
        <CaptainAction
          Icon={Share2}
          label="Share a league"
          description="Drop a league card in chat"
          onPress={onShareLeague}
        />
        <CaptainAction
          Icon={Vote}
          label="Start commit poll"
          description="Ask the squad if they're in"
          onPress={onStartPoll}
        />
        <CaptainAction
          Icon={UserPlus}
          label={isFull ? 'Roster is full' : 'Invite players'}
          description={isFull ? 'Remove a player to invite' : 'From the player directory'}
          onPress={onInvite}
          disabled={isFull}
        />
      </View>
    </Card>
  );
}

function CaptainAction({
  Icon,
  label,
  description,
  onPress,
  disabled,
}: {
  Icon: typeof Trophy;
  label: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.captainAction,
        pressed && !disabled ? styles.captainActionPressed : null,
        disabled ? styles.captainActionDisabled : null,
      ]}
    >
      <View style={styles.captainActionIcon}>
        <Icon size={18} color={colors.brand.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.captainActionBody}>
        <Text variant="button" color={colors.text.primary}>
          {label}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {description}
        </Text>
      </View>
      <ChevronRight size={16} color={colors.text.muted} strokeWidth={2.25} />
    </Pressable>
  );
}

export function TeamDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const baseTeam = TEAM_DETAILS[route.params.id];
  const postCard = useTeamChat((s) => s.postCard);
  const removeMessageAuthor = useTeamChat((s) => s.removeMessageAuthor);
  const polls = useTeamChat((s) => s.pollsById);

  // Derive a mutable team copy so captain actions (remove player, approve app)
  // reflect immediately during the demo without mutating the mock module.
  const [team, setTeam] = useState<TeamDetail | undefined>(baseTeam);

  const [tab, setTab] = useState<Tab>('roster');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RosterMember | null>(null);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [pollSheetOpen, setPollSheetOpen] = useState(false);

  // Re-pull the team from mocks if the user navigates back to a fresh detail.
  useFocusEffect(
    React.useCallback(() => {
      if (TEAM_DETAILS[route.params.id]) {
        setTeam((prev) => prev ?? TEAM_DETAILS[route.params.id]);
      }
    }, [route.params.id]),
  );

  const totalGames = useMemo(() => {
    if (!team) return 0;
    return team.stats.wins + team.stats.losses + team.stats.ties;
  }, [team]);

  const winPct = useMemo(() => {
    if (!team || totalGames === 0) return '—';
    return `${Math.round((team.stats.wins / totalGames) * 100)}%`;
  }, [team, totalGames]);

  if (!team) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Team not found"
          description="The squad may have been disbanded or the link is stale."
          primaryAction={{
            label: 'Back',
            onPress: () => navigation.goBack(),
          }}
        />
      </View>
    );
  }

  const Icon = team.Icon;
  const youMember = team.roster.find((m) => m.isYou);
  const isMember = team.membership === 'member' || team.membership === 'captain';
  const yourPaymentStatus = youMember?.paymentStatus ?? 'pending';
  const youArePaid =
    team.costMode === 'free' || yourPaymentStatus === 'paid' || yourPaymentStatus === 'not_required';
  const chatLocked = team.costMode === 'paid' && isMember && !youArePaid;
  const chatId = `chat-${team.id}`;
  const teamPoll: CommitPoll | undefined = useMemo(() => {
    return Object.values(polls).find(
      (p) => p.leagueId && team.leagueRegistration?.leagueId === p.leagueId,
    );
  }, [polls, team.leagueRegistration?.leagueId]);

  const handleNudge = (m: RosterMember) => {
    Haptics.selectionAsync();
    toast.show({
      variant: 'success',
      title: `Nudge sent to ${m.name}`,
      description: 'They got an in-app reminder + push notification.',
    });
  };

  const handleMessage = (m: RosterMember) => {
    if (m.isYou) return;
    navigation.navigate('Chat', { chatId: `dm-${m.playerId}`, title: m.name });
  };

  const handleRemoveConfirm = () => {
    if (!removeTarget) return;
    const removed = removeTarget;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTeam((prev) =>
      prev ? { ...prev, roster: prev.roster.filter((r) => r.id !== removed.id) } : prev,
    );
    removeMessageAuthor(removed.playerId);
    setRemoveTarget(null);
    toast.show({
      variant: 'info',
      title: `Removed ${removed.name}`,
      description: 'They no longer have access to team chat or fixtures.',
    });
  };

  const handleApprove = (app: PendingApplication) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTeam((prev) => {
      if (!prev) return prev;
      const newMember: RosterMember = {
        id: `r-${app.id}`,
        playerId: app.playerId,
        name: app.name,
        handle: app.handle,
        avatar: app.avatar,
        position: app.position,
        role: 'member',
        experience: app.experience,
        paymentStatus: prev.costMode === 'paid' ? 'pending' : 'not_required',
      };
      return {
        ...prev,
        roster: [...prev.roster, newMember],
        pendingApplications: prev.pendingApplications.filter((a) => a.id !== app.id),
      };
    });
    toast.show({
      variant: 'success',
      title: `${app.name} is on the squad`,
      description:
        team.costMode === 'paid'
          ? `Per-player share is now ${formatCurrency(Math.round(team.feeTotalCents / (team.roster.length + 1)))}.`
          : 'They\'ve been added to team chat and the fixtures.',
    });
  };

  const handleDecline = (app: PendingApplication) => {
    setTeam((prev) =>
      prev
        ? { ...prev, pendingApplications: prev.pendingApplications.filter((a) => a.id !== app.id) }
        : prev,
    );
    toast.show({ variant: 'info', title: `Declined ${app.name}` });
  };

  const handleShareLeague = (league: OpenLeague) => {
    setShareSheetOpen(false);
    const card: ChatCard = {
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
    };
    postCard(
      chatId,
      `Take a look at ${league.name} — could be our next league.`,
      card,
    );
    toast.show({
      variant: 'success',
      title: `Shared with ${team.name}`,
      description: 'Your team can review and react in chat.',
      action: {
        label: 'Open chat',
        onPress: () => navigation.navigate('Chat', { chatId, title: team.name }),
      },
    });
  };

  const handleStartPoll = (league: OpenLeague) => {
    setPollSheetOpen(false);
    const pollId = `poll-${team.id}-${league.id}-${Date.now()}`;
    const card: ChatCard = {
      kind: 'commit_poll',
      pollId,
      leagueId: league.id,
      leagueName: league.name,
      question: `Can you commit to the full ${league.name} season?`,
      closesAt: league.registrationCloses,
    };
    postCard(
      chatId,
      `Vote so I can lock in our ${league.name} registration:`,
      card,
    );
    toast.show({
      variant: 'success',
      title: 'Poll posted',
      description: 'Squad will see it in chat.',
      action: {
        label: 'View poll',
        onPress: () => navigation.navigate('Chat', { chatId, title: team.name }),
      },
    });
  };

  const renderHeroBanner = () => {
    if (chatLocked) {
      return (
        <Card style={styles.lockBanner}>
          <View style={styles.lockBody}>
            <View style={styles.lockHeader}>
              <Lock size={16} color={colors.status.live} strokeWidth={2.25} />
              <Text variant="button" color={colors.status.live}>
                Pay to unlock team chat
              </Text>
            </View>
            <Text variant="bodySm" color={colors.text.secondary}>
              Your {formatCurrency(team.perPlayerCents)} share is{' '}
              {PAYMENT_LABEL[yourPaymentStatus].toLowerCase()} for{' '}
              {team.league?.name ?? 'this season'}.
            </Text>
          </View>
          <Button
            label={`Pay ${formatCurrency(team.perPlayerCents)}`}
            variant="gradient"
            size="md"
            onPress={() => navigation.navigate('TeamPayment', { teamId: team.id })}
          />
        </Card>
      );
    }
    if (team.membership === 'pending') {
      return (
        <Card style={styles.pendingBanner}>
          <Clock size={20} color={colors.status.warning} strokeWidth={2.25} />
          <View style={styles.lockBody}>
            <Text variant="button" color={colors.text.primary}>
              Your application is pending
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              {"Captains usually respond within 48 hours. We'll notify you here."}
            </Text>
          </View>
        </Card>
      );
    }
    if (team.leagueRegistration?.status === 'approved' && team.costMode === 'paid') {
      return (
        <Card style={styles.successBanner}>
          <CheckCircle2 size={20} color="#2E7D32" strokeWidth={2.25} />
          <View style={styles.lockBody}>
            <Text variant="button" color={colors.text.primary}>
              {team.leagueRegistration.leagueName} approved
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              Players can now pay their {formatCurrency(team.perPlayerCents)} share.
            </Text>
          </View>
        </Card>
      );
    }
    return null;
  };

  const chatCtaLabel = chatLocked
    ? `Pay ${formatCurrency(team.perPlayerCents)} to unlock chat`
    : team.membership === 'none'
    ? 'Apply to Team'
    : team.membership === 'pending'
    ? 'Application pending'
    : 'Open team chat';

  const chatCtaIcon = chatLocked ? (
    <Lock size={18} color={colors.text.inverse} strokeWidth={2.5} />
  ) : (
    <MessageCircle size={18} color={colors.text.inverse} strokeWidth={2.5} />
  );

  const handleChatCta = () => {
    if (chatLocked) {
      navigation.navigate('TeamPayment', { teamId: team.id });
      return;
    }
    if (team.membership === 'pending') return;
    if (team.membership === 'none') {
      toast.show({
        variant: 'success',
        title: `Applied to ${team.name}`,
        description: team.costMode === 'paid'
          ? `Captain reviews within 48h. You\'ll pay ${formatCurrency(team.perPlayerCents)} once accepted.`
          : 'The captain will respond within 48 hours.',
      });
      setTeam((prev) => (prev ? { ...prev, membership: 'pending' } : prev));
      return;
    }
    navigation.navigate('Chat', { chatId, title: `${team.name} Chat` });
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
            style={styles.iconButton}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share team"
            hitSlop={8}
            onPress={() => toast.show({ variant: 'info', title: 'Team link copied' })}
            style={styles.iconButton}
          >
            <Share2 size={20} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
        </View>

        <View style={styles.heroBlock}>
          <IconBadge size={80} tone="brand">
            <Icon size={32} color={colors.brand.deep} strokeWidth={2.25} />
          </IconBadge>
          <Text variant="h1" color={colors.text.primary}>
            {team.name}
          </Text>
          <Text variant="body" color={colors.text.secondary}>
            {team.sport} · {team.location}
          </Text>
          <View style={styles.heroTags}>
            <Tag tone="brand" label={team.level} size="sm" />
            <Tag
              tone={team.costMode === 'free' ? 'success' : 'info'}
              size="sm"
              label={
                team.costMode === 'free'
                  ? 'Free'
                  : `${formatCurrency(team.perPlayerCents)} / player`
              }
            />
            {team.league ? <Tag tone="info" label={team.league.name} size="sm" /> : null}
            {team.isCaptain ? (
              <Tag tone="brand" size="sm" label="You captain" />
            ) : null}
          </View>
        </View>

        {renderHeroBanner()}

        <View style={styles.statsRow}>
          <Card padded style={styles.statCard}>
            <Text variant="display" color={colors.text.primary}>
              {team.stats.wins}
            </Text>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Wins
            </Text>
          </Card>
          <Card padded style={styles.statCard}>
            <Text variant="display" color={colors.text.primary}>
              {team.stats.losses}
            </Text>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Losses
            </Text>
          </Card>
          <Card padded style={styles.statCard}>
            <Text variant="display" color={colors.text.primary}>
              {winPct}
            </Text>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Win %
            </Text>
          </Card>
        </View>

        {team.isCaptain ? (
          <CaptainControls
            team={team}
            onBrowseLeagues={() =>
              navigation.navigate('LeagueBrowse', { mode: 'captain', teamId: team.id })
            }
            onShareLeague={() => setShareSheetOpen(true)}
            onStartPoll={() => setPollSheetOpen(true)}
            onInvite={() => navigation.navigate('PlayerDirectory')}
          />
        ) : null}

        <Tabs
          variant="underline"
          items={[
            { key: 'roster', label: `Roster (${team.roster.length}/${team.rosterMax})` },
            { key: 'schedule', label: 'Schedule' },
            { key: 'about', label: 'About' },
          ]}
          value={tab}
          onChange={(k) => setTab(k as Tab)}
        />

        {tab === 'roster' ? (
          <View style={styles.rosterList}>
            {team.isCaptain && team.pendingApplications.length > 0 ? (
              <Card style={styles.appCard}>
                <View style={styles.appCardHead}>
                  <Text variant="h3" color={colors.text.primary}>
                    Pending applications
                  </Text>
                  <Tag
                    tone="warning"
                    size="sm"
                    label={`${team.pendingApplications.length} new`}
                  />
                </View>
                {team.pendingApplications.map((app) => (
                  <PendingApplicationRow
                    key={app.id}
                    app={app}
                    onApprove={() => handleApprove(app)}
                    onDecline={() => handleDecline(app)}
                  />
                ))}
              </Card>
            ) : null}

            {team.roster.map((m) => (
              <RosterRow
                key={m.id}
                member={m}
                isCaptainView={team.isCaptain}
                costMode={team.costMode}
                onNudge={handleNudge}
                onMessage={handleMessage}
                captainHandlers={{ onRemove: setRemoveTarget }}
              />
            ))}
            <Button
              label="Invite players"
              variant="soft"
              fullWidth
              leadingIcon={
                <UserPlus
                  size={16}
                  color={colors.brand.deep}
                  strokeWidth={2.5}
                />
              }
              onPress={() => navigation.navigate('PlayerDirectory')}
            />
          </View>
        ) : null}

        {tab === 'schedule' ? (
          <View style={styles.scheduleList}>
            {team.schedule.length === 0 ? (
              <EmptyState
                icon={
                  <CalendarClock
                    size={28}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                }
                title="No games scheduled"
                description="Add a friendly or wait for the league to publish fixtures."
              />
            ) : (
              team.schedule.map((g) => <ScheduleRow key={g.id} item={g} />)
            )}
          </View>
        ) : null}

        {tab === 'about' ? (
          <View style={styles.aboutBlock}>
            <Card style={styles.aboutCard}>
              <Text variant="h3" color={colors.text.primary}>
                About {team.name}
              </Text>
              <Text variant="body" color={colors.text.primary}>
                {team.description}
              </Text>
            </Card>
            <Card style={styles.aboutCard}>
              <Text variant="h3" color={colors.text.primary}>
                Season fee
              </Text>
              <View style={styles.feeRow}>
                <Text variant="body" color={colors.text.secondary}>
                  Total
                </Text>
                <Text variant="button" color={colors.text.primary}>
                  {team.feeTotalCents === 0 ? 'Free' : formatCurrency(team.feeTotalCents)}
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text variant="body" color={colors.text.secondary}>
                  Per player ({team.roster.length} on roster)
                </Text>
                <Text variant="button" color={colors.brand.primary}>
                  {team.perPlayerCents === 0 ? 'Free' : formatCurrency(team.perPlayerCents)}
                </Text>
              </View>
            </Card>
            {teamPoll ? (
              <Card style={styles.aboutCard}>
                <View style={styles.appCardHead}>
                  <Text variant="h3" color={colors.text.primary}>
                    Active poll
                  </Text>
                  <Tag tone="brand" size="sm" label={teamPoll.leagueName} />
                </View>
                <Text variant="body" color={colors.text.primary}>
                  {teamPoll.question}
                </Text>
                <View style={styles.pollSummary}>
                  {(['in', 'maybe', 'out'] as const).map((k) => {
                    const count = Object.values(teamPoll.responses).filter((v) => v === k).length;
                    return (
                      <View key={k} style={styles.pollSummaryItem}>
                        <Text variant="display" color={colors.text.primary}>
                          {count}
                        </Text>
                        <Text variant="caption" color={colors.text.secondary}>
                          {k === 'in' ? "I'm in" : k === 'out' ? "Can't" : 'Maybe'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            ) : null}
            {youMember && !team.isCaptain ? (
              <Button
                label="Leave team"
                variant="ghost"
                onPress={() => setConfirmLeave(true)}
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={chatCtaLabel}
          variant={chatLocked ? 'solid' : 'gradient'}
          size="lg"
          fullWidth
          disabled={team.membership === 'pending'}
          leadingIcon={chatCtaIcon}
          onPress={handleChatCta}
        />
      </View>

      <Modal
        visible={confirmLeave}
        onRequestClose={() => setConfirmLeave(false)}
        variant="destructive"
        title={`Leave ${team.name}?`}
        description="You'll forfeit your spot. The captain will be notified."
        primaryAction={{
          label: 'Leave team',
          onPress: () => {
            setConfirmLeave(false);
            toast.show({
              variant: 'info',
              title: `You left ${team.name}`,
            });
            navigation.goBack();
          },
        }}
        secondaryAction={{
          label: 'Stay',
          onPress: () => setConfirmLeave(false),
        }}
      />

      <Modal
        visible={!!removeTarget}
        onRequestClose={() => setRemoveTarget(null)}
        variant="destructive"
        title={`Remove ${removeTarget?.name}?`}
        description="They lose access to chat, fixtures, and any unpaid balance becomes the captain's to settle."
        primaryAction={{ label: 'Remove player', onPress: handleRemoveConfirm }}
        secondaryAction={{ label: 'Cancel', onPress: () => setRemoveTarget(null) }}
      />

      <BottomSheet
        visible={shareSheetOpen}
        onRequestClose={() => setShareSheetOpen(false)}
        title="Share a league with the team"
        snapPoints={['72%']}
      >
        <ScrollView contentContainerStyle={styles.sheetContent}>
          <Text variant="bodySm" color={colors.text.secondary}>
            {"We'll post a card in the team chat so everyone can review the league."}
          </Text>
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
        visible={pollSheetOpen}
        onRequestClose={() => setPollSheetOpen(false)}
        title="Pick a league for the poll"
        snapPoints={['72%']}
      >
        <ScrollView contentContainerStyle={styles.sheetContent}>
          <Text variant="bodySm" color={colors.text.secondary}>
            {"Squad members vote In, Maybe, or Can't — you'll see the tally in chat."}
          </Text>
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
        styles.pickerRow,
        pressed ? styles.pickerRowPressed : null,
      ]}
    >
      <View style={styles.pickerIcon}>
        <Icon size={20} color={colors.brand.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.pickerBody}>
        <Text variant="button" color={colors.text.primary}>
          {league.name}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {league.sport} · {league.startDate.replace('Starts ', '')}
        </Text>
      </View>
      <ChevronRight size={16} color={colors.text.muted} strokeWidth={2.25} />
    </Pressable>
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heroBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  lockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#F4D6D2',
    backgroundColor: '#FDE7E2',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#FCE3B6',
    backgroundColor: '#FFF7E6',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#CDEBD2',
    backgroundColor: '#E2F4E4',
  },
  lockBody: {
    flex: 1,
    gap: 4,
  },
  lockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  rosterList: {
    gap: spacing.sm,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  rosterAvatarShell: {
    position: 'relative',
  },
  captainBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface.card,
  },
  rosterBody: {
    flex: 1,
    gap: 2,
  },
  rosterHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rosterActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  scheduleList: {
    gap: spacing.sm,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  scheduleDate: {
    width: 64,
    gap: 2,
  },
  scheduleBody: {
    flex: 1,
    gap: 2,
  },
  aboutBlock: {
    gap: spacing.md,
  },
  aboutCard: {
    gap: spacing.sm,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollSummary: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  pollSummaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.bg,
    borderRadius: radii.md,
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
  captainCard: {
    gap: spacing.md,
    backgroundColor: colors.brand.soft,
  },
  captainHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  captainHeadBody: {
    flex: 1,
    gap: 2,
  },
  regCard: {
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  regHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  captainActionGrid: {
    gap: spacing.sm,
  },
  captainAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface.card,
  },
  captainActionPressed: {
    opacity: 0.7,
  },
  captainActionDisabled: {
    opacity: 0.45,
  },
  captainActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captainActionBody: {
    flex: 1,
    gap: 2,
  },
  appCard: {
    gap: spacing.md,
    backgroundColor: '#FFF7E6',
  },
  appCardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface.card,
  },
  appBody: {
    flex: 1,
    gap: 2,
  },
  appMessage: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  appActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface.card,
    ...shadows.soft,
  },
  pickerRowPressed: {
    opacity: 0.75,
  },
  pickerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerBody: {
    flex: 1,
    gap: 2,
  },
});
