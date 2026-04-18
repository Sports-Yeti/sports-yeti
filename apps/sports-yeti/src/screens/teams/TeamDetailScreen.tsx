import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  CalendarClock,
  ChevronLeft,
  CreditCard,
  Crown,
  MessageCircle,
  Share2,
  UserPlus,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
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
  TEAM_DETAILS,
  type RosterMember,
  type TeamSchedule,
} from '../../mocks/teams';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeamDetails'>;
type Route = RouteProp<RootStackParamList, 'TeamDetails'>;

type Tab = 'roster' | 'schedule' | 'about';

const PAYMENT_TONE = {
  paid: 'success' as const,
  pending: 'warning' as const,
  overdue: 'live' as const,
};

const PAYMENT_LABEL = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
};

function RosterRow({
  member,
  isCaptainView,
  onNudge,
  onMessage,
}: {
  member: RosterMember;
  isCaptainView: boolean;
  onNudge: (m: RosterMember) => void;
  onMessage: (m: RosterMember) => void;
}) {
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
          <Tag
            tone={PAYMENT_TONE[member.paymentStatus]}
            size="sm"
            label={PAYMENT_LABEL[member.paymentStatus]}
          />
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
        {isCaptainView && member.paymentStatus !== 'paid' ? (
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

export function TeamDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const team = TEAM_DETAILS[route.params.id];
  const [tab, setTab] = useState<Tab>('roster');
  const [confirmLeave, setConfirmLeave] = useState(false);

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
  const yourPaymentStatus = youMember?.paymentStatus ?? 'pending';
  const totalGames = team.stats.wins + team.stats.losses + team.stats.ties;
  const winPct = totalGames === 0 ? '—' : `${Math.round((team.stats.wins / totalGames) * 100)}%`;

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
            {team.league ? <Tag tone="info" label={team.league.name} size="sm" /> : null}
          </View>
        </View>

        {team.hasUnpaidShare && yourPaymentStatus !== 'paid' ? (
          <Card style={styles.payAlert}>
            <View style={styles.payAlertBody}>
              <Text variant="button" color={colors.status.live}>
                Your share is {PAYMENT_LABEL[yourPaymentStatus].toLowerCase()}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {formatCurrency(team.perPlayerCents)} due for {team.league?.name ?? 'this season'}.
              </Text>
            </View>
            <Button
              label={`Pay ${formatCurrency(team.perPlayerCents)}`}
              variant="gradient"
              size="md"
              onPress={() =>
                navigation.navigate('TeamPayment', { teamId: team.id })
              }
            />
          </Card>
        ) : null}

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
            {team.roster.map((m) => (
              <RosterRow
                key={m.id}
                member={m}
                isCaptainView={team.isCaptain}
                onNudge={handleNudge}
                onMessage={handleMessage}
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
            {youMember ? (
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
          label="Open team chat"
          variant="gradient"
          size="lg"
          fullWidth
          leadingIcon={
            <MessageCircle
              size={18}
              color={colors.text.inverse}
              strokeWidth={2.5}
            />
          }
          onPress={() =>
            navigation.navigate('Chat', {
              chatId: `chat-${team.id}`,
              title: `${team.name} Chat`,
            })
          }
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
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  payAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#F4D6D2',
    backgroundColor: '#FDE7E2',
  },
  payAlertBody: {
    flex: 1,
    gap: 4,
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
});
