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
  BadgeCheck,
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
  Input,
  Modal,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  OPEN_LEAGUES,
  isLeagueTeam,
  type CommitPoll,
  type OpenLeague,
  type PendingApplication,
  type RosterMember,
  type TeamDetail,
  type TeamSchedule,
} from '../../mocks/teams';
import { dmChatIdForPlayer, type ChatCard } from '../../mocks/messages';
import { formatCurrency } from '../../lib/format';
import { useTeamChat } from '../../features/team-chat-store';
import { useTeamMembershipStore } from '../../features/team-membership-store';
import { useTeamDetailById } from '../../features/created-squads-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeamDetails'>;
type Route = RouteProp<RootStackParamList, 'TeamDetails'>;
type Tab = 'roster' | 'schedule' | 'fee';

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

type LeagueTagTone = 'success' | 'warning' | 'live' | 'neutral' | 'info';

interface LeagueInfo {
  title: string;
  subtitle: string;
  tagLabel: string;
  tone?: LeagueTagTone;
}

/** Surfaces the team's league affiliation as a "provider" card, mirroring the
 *  venue/vendor block on the event detail page. */
function describeLeague(team: TeamDetail): LeagueInfo {
  const reg = team.leagueRegistration;
  if (reg) {
    switch (reg.status) {
      case 'approved':
        return {
          title: reg.leagueName,
          subtitle: `${team.sport} · registered for league play`,
          tagLabel: 'Registered',
          tone: 'success',
        };
      case 'pending_admin':
        return {
          title: reg.leagueName,
          subtitle: 'Registration under review by the league',
          tagLabel: 'Pending',
          tone: 'warning',
        };
      case 'rejected':
        return {
          title: reg.leagueName,
          subtitle: 'Registration was not approved',
          tagLabel: 'Rejected',
          tone: 'live',
        };
      default:
        return {
          title: reg.leagueName,
          subtitle: 'Draft registration — not submitted yet',
          tagLabel: 'Draft',
          tone: 'neutral',
        };
    }
  }
  if (team.league) {
    return {
      title: team.league.name,
      subtitle: `${team.sport} · league play`,
      tagLabel: 'League',
      tone: 'info',
    };
  }
  return {
    title: 'Custom league',
    subtitle: 'Independent squad — the captain settles any league fee directly',
    tagLabel: 'Custom',
    tone: 'neutral',
  };
}

interface CaptainHandlers {
  onRemove: (m: RosterMember) => void;
}

function RosterRow({
  member,
  isCaptainView,
  costMode,
  captainCollectsPayment,
  onMessage,
  onNudge,
  onMarkPaid,
  captainHandlers,
}: {
  member: RosterMember;
  isCaptainView: boolean;
  costMode: 'free' | 'paid';
  /** Custom-league teams: the captain confirms payment manually. */
  captainCollectsPayment: boolean;
  onMessage: (m: RosterMember) => void;
  onNudge: (m: RosterMember) => void;
  onMarkPaid: (m: RosterMember) => void;
  captainHandlers: CaptainHandlers;
}) {
  const showPaymentTag = costMode === 'paid';
  const owesPayment =
    member.paymentStatus === 'pending' || member.paymentStatus === 'overdue';
  const canMarkPaid =
    isCaptainView && captainCollectsPayment && costMode === 'paid' && owesPayment;
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
        {canMarkPaid ? (
          <Pressable
            onPress={() => onMarkPaid(member)}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${member.name} as paid`}
            accessibilityHint="Confirms you collected their share for this custom-league squad"
            hitSlop={6}
            style={styles.iconButton}
          >
            <BadgeCheck size={18} color={colors.status.success} strokeWidth={2.25} />
          </Pressable>
        ) : null}
        {isCaptainView && !captainCollectsPayment && member.paymentStatus === 'overdue' ? (
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
  onViewProfile,
}: {
  app: PendingApplication;
  onApprove: () => void;
  onDecline: () => void;
  onViewProfile: () => void;
}) {
  return (
    <View style={styles.appRow}>
      <Pressable
        onPress={onViewProfile}
        accessibilityRole="button"
        accessibilityLabel={`View ${app.name}'s profile`}
        accessibilityHint="Review their profile before approving the request"
        style={styles.appProfileTap}
      >
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
          <View style={styles.appProfileHint}>
            <Text variant="caption" color={colors.brand.primary}>
              View profile
            </Text>
            <ChevronRight size={12} color={colors.brand.primary} strokeWidth={2.5} />
          </View>
        </View>
      </Pressable>
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

export function TeamDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  // Seeded fixture or a squad created in the wizard this session.
  const baseTeam = useTeamDetailById(route.params.id);
  const postCard = useTeamChat((s) => s.postCard);
  const removeMessageAuthor = useTeamChat((s) => s.removeMessageAuthor);
  const polls = useTeamChat((s) => s.pollsById);
  const registrationsByTeam = useTeamChat((s) => s.registrationsByTeam);
  // Session membership (join/leave) is shared with ChatScreen + SquadsScreen
  // through the membership store so all three surfaces agree.
  const membershipOverride = useTeamMembershipStore(
    (s) => s.overrides[route.params.id],
  );
  const requestJoin = useTeamMembershipStore((s) => s.requestJoin);
  const leaveTeam = useTeamMembershipStore((s) => s.leave);

  // Derive a mutable team copy so captain actions (remove player, approve app)
  // reflect immediately during the demo without mutating the mock module.
  const [teamState, setTeam] = useState<TeamDetail | undefined>(baseTeam);
  // Membership is resolved at render time (not baked into state) so store
  // writes — from this screen or anywhere else — always reflect.
  const team = teamState
    ? membershipOverride
      ? { ...teamState, membership: membershipOverride }
      : teamState
    : undefined;

  const [tab, setTab] = useState<Tab>('roster');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RosterMember | null>(null);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [pollSheetOpen, setPollSheetOpen] = useState(false);
  const [joinSheetOpen, setJoinSheetOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  // Re-pull the team (seed or session-created) if the user navigates back
  // to a fresh detail.
  useFocusEffect(
    React.useCallback(() => {
      if (baseTeam) {
        setTeam((prev) => prev ?? baseTeam);
      }
    }, [baseTeam]),
  );

  const teamPoll: CommitPoll | undefined = useMemo(() => {
    const leagueId = team?.leagueRegistration?.leagueId;
    if (!leagueId) return undefined;
    return Object.values(polls).find((p) => p.leagueId === leagueId);
  }, [polls, team?.leagueRegistration?.leagueId]);

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
  // Live league-registration status (set when a captain submits an entry).
  // It overrides the seeded mock so the chat card, banners, and payment lock
  // all read one source of truth as the league reviews → approves.
  const liveReg = registrationsByTeam[team.id];
  const effectiveRegStatus: 'pending' | 'approved' | undefined =
    liveReg?.status ??
    (team.leagueRegistration
      ? team.leagueRegistration.status === 'approved'
        ? 'approved'
        : 'pending'
      : undefined);
  const hasPendingLeagueReg = effectiveRegStatus === 'pending';
  const registrationLeagueName =
    liveReg?.leagueName ??
    team.leagueRegistration?.leagueName ??
    team.league?.name ??
    'the league';
  // League teams collect fees through the platform (player pays the league
  // directly). Custom squads collect in person and the captain marks players
  // paid manually — so members can't self-serve a payment for those. A team
  // mid-registration is neither yet: league payments stay locked until approved.
  const isLeague = isLeagueTeam(team) || effectiveRegStatus === 'approved';
  const captainCollectsPayment =
    team.costMode === 'paid' && !isLeague && !hasPendingLeagueReg;
  // Chat is gated on approval, not payment. An unpaid member still gets full
  // chat access; this just surfaces a non-blocking reminder to settle the fee.
  const paymentDue = isMember && !youArePaid;
  const captains = team.roster.filter((m) => m.role === 'captain');
  const leagueInfo = describeLeague(team);
  const chatId = `chat-${team.id}`;

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
    navigation.navigate('Chat', {
      chatId: dmChatIdForPlayer(m.playerId),
      title: m.name,
      avatar: m.avatar,
    });
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
    const description =
      team.costMode === 'free'
        ? "They've got team chat and the fixtures."
        : isLeague
        ? `They're in with full chat access. They'll pay their ${formatCurrency(team.perPlayerCents)} share to ${team.league?.name ?? 'the league'} directly.`
        : `They're in with full chat access. Collect their ${formatCurrency(team.perPlayerCents)} share and mark them paid when settled.`;
    toast.show({
      variant: 'success',
      title: `${app.name} is on the squad`,
      description,
    });
  };

  const handleMarkPaid = (m: RosterMember) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTeam((prev) =>
      prev
        ? {
            ...prev,
            roster: prev.roster.map((r) =>
              r.id === m.id ? { ...r, paymentStatus: 'paid' } : r,
            ),
          }
        : prev,
    );
    toast.show({
      variant: 'success',
      title: `Marked ${m.name} as paid`,
      description: 'Their share is settled. You handle the league fee externally.',
    });
  };

  const handleSubmitJoin = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setJoinSheetOpen(false);
    setJoinMessage('');
    setTeam((prev) => (prev ? { ...prev, membership: 'pending' } : prev));
    requestJoin(team.id);
    toast.show({
      variant: 'success',
      title: `Request sent to ${team.name}`,
      description:
        team.costMode === 'paid'
          ? isLeague
            ? `The captain reviews your request. Once approved, you're in the chat and can pay your ${formatCurrency(team.perPlayerCents)} share to the league.`
            : `The captain reviews your request. Once approved, you're in the chat — settle your ${formatCurrency(team.perPlayerCents)} share with the captain.`
          : 'The captain will respond within 48 hours.',
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
    // Player's own join request is pending captain review.
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
    // Team is registered with a league but not yet approved → league payments
    // are locked until the league signs off.
    if (hasPendingLeagueReg) {
      return (
        <Card style={styles.pendingBanner}>
          <Lock size={20} color={colors.status.warning} strokeWidth={2.25} />
          <View style={styles.lockBody}>
            <Text variant="button" color={colors.text.primary}>
              Registration pending
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              {`${registrationLeagueName} is reviewing ${team.name}. Player payments to the league unlock automatically once you're approved.`}
            </Text>
          </View>
        </Card>
      );
    }
    // Custom squad: captain collects in person. Non-blocking reminder only —
    // the member already has full chat access.
    if (paymentDue && captainCollectsPayment) {
      return (
        <Card style={styles.pendingBanner}>
          <CreditCard size={20} color={colors.status.warning} strokeWidth={2.25} />
          <View style={styles.lockBody}>
            <Text variant="button" color={colors.text.primary}>
              {`${formatCurrency(team.perPlayerCents)} share due`}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              {`This squad collects its share in person — settle up with the captain and they'll mark you paid.`}
            </Text>
          </View>
        </Card>
      );
    }
    // League team: player pays the league directly. Reminder with a pay action,
    // but chat is not blocked.
    if (paymentDue) {
      return (
        <Card style={styles.pendingBanner}>
          <View style={styles.lockBody}>
            <View style={styles.lockHeader}>
              <CreditCard size={16} color={colors.status.warning} strokeWidth={2.25} />
              <Text variant="button" color={colors.text.primary}>
                {`${formatCurrency(team.perPlayerCents)} share due`}
              </Text>
            </View>
            <Text variant="bodySm" color={colors.text.secondary}>
              Your share is {PAYMENT_LABEL[yourPaymentStatus].toLowerCase()} for{' '}
              {team.league?.name ?? 'this season'}. Payment goes directly to the
              league.
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
    if (effectiveRegStatus === 'approved' && team.costMode === 'paid') {
      return (
        <Card style={styles.successBanner}>
          <CheckCircle2 size={20} color="#2E7D32" strokeWidth={2.25} />
          <View style={styles.lockBody}>
            <Text variant="button" color={colors.text.primary}>
              {registrationLeagueName} approved
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

  // Chat opens as soon as a player is approved onto the roster — payment never
  // blocks access.
  const chatCtaLabel =
    team.membership === 'none'
      ? 'Offer to join'
      : team.membership === 'pending'
      ? 'Request pending'
      : 'Open team chat';

  const chatCtaDisabled = team.membership === 'pending';

  const chatCtaIcon =
    team.membership === 'none' ? (
      <UserPlus size={18} color={colors.text.inverse} strokeWidth={2.5} />
    ) : (
      <MessageCircle size={18} color={colors.text.inverse} strokeWidth={2.5} />
    );

  const handleChatCta = () => {
    if (team.membership === 'pending') return;
    if (team.membership === 'none') {
      setJoinSheetOpen(true);
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
            {team.isCaptain ? (
              <Tag tone="brand" size="sm" label="You captain" />
            ) : null}
          </View>
        </View>

        {renderHeroBanner()}

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            About
          </Text>
          <Card style={styles.aboutCard}>
            <Text variant="body" color={colors.text.primary}>
              {team.description}
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            League
          </Text>
          <View style={styles.providerRow}>
            <IconBadge size={48} tone="brand">
              <Trophy size={20} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.providerBody}>
              <Text variant="h3" color={colors.text.primary}>
                {leagueInfo.title}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {leagueInfo.subtitle}
              </Text>
            </View>
            {leagueInfo.tone ? (
              <Tag tone={leagueInfo.tone} size="sm" label={leagueInfo.tagLabel} />
            ) : null}
          </View>
          {team.isCaptain ? (
            <View style={styles.captainLeagueTools}>
              <Button
                label="Share a league"
                variant="soft"
                size="md"
                style={styles.captainToolBtn}
                leadingIcon={
                  <Share2
                    size={16}
                    color={colors.brand.deep}
                    strokeWidth={2.5}
                  />
                }
                onPress={() => setShareSheetOpen(true)}
              />
              <Button
                label="Commit poll"
                variant="soft"
                size="md"
                style={styles.captainToolBtn}
                leadingIcon={
                  <Vote size={16} color={colors.brand.deep} strokeWidth={2.5} />
                }
                onPress={() => setPollSheetOpen(true)}
              />
            </View>
          ) : null}
        </View>

        {captains.length > 0 ? (
          <View style={styles.section}>
            <Text variant="h2" color={colors.text.primary}>
              {captains.length > 1 ? 'Captains' : 'Captain'}
            </Text>
            {captains.map((captain) => (
              <Pressable
                key={captain.id}
                accessibilityRole="button"
                accessibilityLabel={`View ${captain.name}'s profile`}
                style={styles.providerRow}
                onPress={() =>
                  navigation.navigate('PlayerProfile', { playerId: captain.playerId })
                }
              >
                <View style={styles.captainAvatarShell}>
                  <Avatar uri={captain.avatar} initials={captain.name.charAt(0)} size={48} />
                  <View style={styles.captainCrown}>
                    <Crown size={10} color={colors.text.inverse} strokeWidth={3} />
                  </View>
                </View>
                <View style={styles.providerBody}>
                  <Text variant="h3" color={colors.text.primary}>
                    {captain.name}
                    {captain.isYou ? ' · You' : ''}
                  </Text>
                  <Text variant="bodySm" color={colors.text.secondary}>
                    {captain.position}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2.25} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <Tabs
          variant="underline"
          items={[
            { key: 'roster', label: `Roster (${team.roster.length}/${team.rosterMax})` },
            { key: 'schedule', label: 'Schedule' },
            ...(team.costMode === 'paid'
              ? [{ key: 'fee', label: 'Fee' }]
              : []),
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
                    onViewProfile={() =>
                      navigation.navigate('PlayerProfile', { playerId: app.playerId })
                    }
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
                captainCollectsPayment={captainCollectsPayment}
                onNudge={handleNudge}
                onMessage={handleMessage}
                onMarkPaid={handleMarkPaid}
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
          <View style={styles.aboutBlock}>
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
            {teamPoll ? (
              <Card style={styles.aboutCard}>
                <View style={styles.appCardHead}>
                  <Text variant="h3" color={colors.text.primary}>
                    Active poll
                  </Text>
                  <Tag tone="brand" size="sm" label={teamPoll.leagueName ?? 'League'} />
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

        {tab === 'fee' ? (
          <View style={styles.aboutBlock}>
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
                  Per player (split {team.rosterMax} ways)
                </Text>
                <Text variant="button" color={colors.brand.primary}>
                  {team.perPlayerCents === 0 ? 'Free' : formatCurrency(team.perPlayerCents)}
                </Text>
              </View>
            </Card>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={chatCtaLabel}
          variant="gradient"
          size="lg"
          fullWidth
          disabled={chatCtaDisabled}
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
            leaveTeam(team.id);
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

      <BottomSheet
        visible={joinSheetOpen}
        onRequestClose={() => setJoinSheetOpen(false)}
        title={`Offer to join ${team.name}`}
        snapPoints={['62%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="bodySm" color={colors.text.secondary}>
            {team.costMode === 'free'
              ? "Tell the captain why you're a fit. They'll review your profile and approve your spot."
              : isLeague
              ? `Tell the captain why you're a fit. Approval gets you into the chat; you'll pay your ${formatCurrency(team.perPlayerCents)} share directly to ${team.league?.name ?? 'the league'}.`
              : `Tell the captain why you're a fit. Approval gets you into the chat; settle your ${formatCurrency(team.perPlayerCents)} share with the captain in person.`}
          </Text>
          <Input
            label="Message to captain (optional)"
            variant="multiline"
            placeholder="Positions you play, availability, experience…"
            value={joinMessage}
            onChangeText={setJoinMessage}
            maxLength={280}
          />
          <Button
            label="Send request"
            variant="gradient"
            size="lg"
            fullWidth
            leadingIcon={
              <UserPlus size={18} color={colors.text.inverse} strokeWidth={2.5} />
            }
            onPress={handleSubmitJoin}
          />
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
  section: {
    gap: spacing.md,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  captainLeagueTools: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  captainToolBtn: {
    flex: 1,
  },
  providerBody: {
    flex: 1,
    gap: 2,
  },
  captainAvatarShell: {
    position: 'relative',
  },
  captainCrown: {
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
  appProfileTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  appBody: {
    flex: 1,
    gap: 2,
  },
  appMessage: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  appProfileHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
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
  sheetContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
