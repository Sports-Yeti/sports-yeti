import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  Bell,
  Check,
  CreditCard,
  MessageCircle,
  Trophy,
  X,
} from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Modal,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, spacing } from '../../theme';
import {
  PAYMENT_LABEL,
  STATUS_LABEL,
  teamById,
  type RosterMember,
  type TeamStatus,
} from '../../mocks/teams';
import { formatCurrency, formatPercent, formatRelative } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const PAYMENT_TONE = {
  paid: 'success' as const,
  pending: 'warning' as const,
  overdue: 'live' as const,
};

const STATUS_TONE: Record<TeamStatus, 'success' | 'warning' | 'live' | 'neutral'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'live',
  archived: 'neutral',
};

const TABS = [
  { key: 'roster', label: 'Roster' },
  { key: 'fees', label: 'Fees' },
  { key: 'about', label: 'About' },
];

export function TeamDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const team = teamById(route.params.id);
  const [tab, setTab] = useState('roster');
  const [confirmReject, setConfirmReject] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [statusOverride, setStatusOverride] = useState<TeamStatus | null>(null);

  if (!team) {
    return (
      <PageScroll>
        <PageHeader
          title="Team not found"
          crumbs={[{ label: 'Teams', route: 'Teams' }, { label: '—' }]}
          onNavigate={(r) => navigation.navigate(r)}
        />
        <EmptyState
          title="Team not found"
          description="It may have been removed or the link is stale."
          primaryAction={{
            label: 'Back to teams',
            onPress: () => navigation.navigate('Teams'),
          }}
        />
      </PageScroll>
    );
  }

  const status = statusOverride ?? team.status;
  const paid = team.roster.filter((r) => r.paymentStatus === 'paid').length;
  const totalGames = team.wins + team.losses + team.ties;

  return (
    <PageScroll>
      <PageHeader
        title={team.name}
        subtitle={`${team.leagueName} · ${team.sport}`}
        crumbs={[
          { label: 'Teams', route: 'Teams' },
          { label: team.name },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        meta={`Applied ${formatRelative(team.appliedAtIso)}`}
        trailing={
          <>
            <Button
              label="Open team chat"
              variant="ghost"
              size="sm"
              leadingIcon={
                <MessageCircle size={14} color={colors.brand.primary} strokeWidth={2.25} />
              }
              onPress={() => toast.show({ variant: 'info', title: 'Chat opens in mobile app' })}
            />
            {status === 'pending' ? (
              <>
                <Button
                  label="Reject"
                  variant="ghost"
                  size="sm"
                  leadingIcon={<X size={14} color={colors.status.error} strokeWidth={2.5} />}
                  onPress={() => setConfirmReject(true)}
                />
                <Button
                  label="Approve"
                  variant="solid"
                  size="sm"
                  leadingIcon={<Check size={14} color={colors.text.inverse} strokeWidth={2.5} />}
                  onPress={() => setConfirmApprove(true)}
                />
              </>
            ) : null}
          </>
        }
      />

      <View style={styles.heroRow}>
        <Tag size="md" tone={STATUS_TONE[status]} leadingDot label={STATUS_LABEL[status]} />
        {team.leagueId ? (
          <Button
            label="Open league"
            variant="ghost"
            size="sm"
            leadingIcon={
              <Trophy size={14} color={colors.brand.primary} strokeWidth={2.25} />
            }
            onPress={() => navigation.navigate('LeagueDetail', { id: team.leagueId })}
          />
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label="Roster"
          value={`${team.roster.length} / ${team.rosterMax}`}
          helper={`${team.rosterMax - team.roster.length} spots open`}
          tone="brand"
        />
        <StatCard
          label="Record"
          value={`${team.wins}-${team.losses}-${team.ties}`}
          helper={`Win rate ${formatPercent(team.wins, totalGames)}`}
          tone="success"
        />
        <StatCard
          label="Fees collected"
          value={formatCurrency(team.feeCollectedCents)}
          helper={`of ${formatCurrency(team.feeTotalCents)}`}
          tone="brand"
          icon={<CreditCard size={14} color={colors.brand.deep} strokeWidth={2.25} />}
        />
        <StatCard
          label="Paid players"
          value={`${paid} / ${team.roster.length}`}
          helper={`${team.roster.length - paid} pending`}
          tone="warning"
        />
      </View>

      <Tabs items={TABS} value={tab} onChange={setTab} variant="segmented" />

      {tab === 'roster' ? (
        <Card>
          <View style={styles.cardHead}>
            <Text variant="h3" color={colors.text.primary}>
              Roster ({team.roster.length})
            </Text>
            <Button
              label="Invite players"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('Players')}
            />
          </View>
          {team.roster.map((m) => (
            <RosterRow key={m.id} member={m} onNudge={() =>
              toast.show({ variant: 'success', title: `Nudged ${m.name}` })
            } />
          ))}
        </Card>
      ) : null}

      {tab === 'fees' ? (
        <Card>
          <Text variant="h3" color={colors.text.primary}>
            Fee breakdown
          </Text>
          <View style={styles.feeRow}>
            <Text variant="body" color={colors.text.secondary}>
              Total team fee
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {formatCurrency(team.feeTotalCents)}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text variant="body" color={colors.text.secondary}>
              Per player ({team.roster.length})
            </Text>
            <Text variant="bodySm" color={colors.brand.primary}>
              {formatCurrency(team.feePerPlayerCents)}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text variant="body" color={colors.text.secondary}>
              Collected
            </Text>
            <Text variant="bodySm" color={colors.status.success}>
              {formatCurrency(team.feeCollectedCents)}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text variant="body" color={colors.text.secondary}>
              Outstanding
            </Text>
            <Text variant="bodySm" color={colors.status.warning}>
              {formatCurrency(team.feeTotalCents - team.feeCollectedCents)}
            </Text>
          </View>
        </Card>
      ) : null}

      {tab === 'about' ? (
        <Card>
          <Text variant="h3" color={colors.text.primary}>
            About this team
          </Text>
          <Text variant="body" color={colors.text.primary}>
            {team.description}
          </Text>
        </Card>
      ) : null}

      <Modal
        visible={confirmApprove}
        onRequestClose={() => setConfirmApprove(false)}
        variant="success"
        title={`Approve ${team.name}?`}
        description="The team will appear publicly and the captain will be notified."
        primaryAction={{
          label: 'Approve',
          onPress: () => {
            setConfirmApprove(false);
            setStatusOverride('approved');
            toast.show({ variant: 'success', title: `${team.name} approved` });
          },
        }}
        secondaryAction={{ label: 'Cancel', onPress: () => setConfirmApprove(false) }}
      />

      <Modal
        visible={confirmReject}
        onRequestClose={() => setConfirmReject(false)}
        variant="destructive"
        title={`Reject ${team.name}?`}
        description="The captain receives an email with your decision and a chance to re-apply."
        primaryAction={{
          label: 'Reject application',
          onPress: () => {
            setConfirmReject(false);
            setStatusOverride('rejected');
            toast.show({ variant: 'info', title: `${team.name} rejected` });
          },
        }}
        secondaryAction={{ label: 'Cancel', onPress: () => setConfirmReject(false) }}
      />
    </PageScroll>
  );
}

function RosterRow({
  member,
  onNudge,
}: {
  member: RosterMember;
  onNudge: () => void;
}) {
  return (
    <View style={styles.rosterRow}>
      <Avatar uri={member.avatar} initials={member.name.charAt(0)} size={32} />
      <View style={styles.rosterBody}>
        <Text variant="bodySm" color={colors.text.primary} weight="600">
          {member.name}
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          {member.position}
        </Text>
      </View>
      <Tag size="sm" tone={PAYMENT_TONE[member.paymentStatus]} label={PAYMENT_LABEL[member.paymentStatus]} />
      {member.paymentStatus !== 'paid' ? (
        <Button
          label="Nudge"
          variant="ghost"
          size="sm"
          leadingIcon={<Bell size={12} color={colors.brand.primary} strokeWidth={2.5} />}
          onPress={onNudge}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  rosterBody: {
    flex: 1,
    gap: 2,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
});
