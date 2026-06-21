import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CheckCircle2,
  ClipboardList,
  Coins,
  MailPlus,
  MessageCircle,
  MoreVertical,
  Plus,
  Users,
  XCircle,
} from 'lucide-react-native';
import {
  BulkActionBar,
  DataTable,
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import {
  Avatar,
  Button,
  Card,
  Input,
  Select,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { type WebPressableState } from '../../lib/pressable';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  STATUS_LABEL,
  TEAMS,
  type Team,
  type TeamStatus,
} from '../../mocks/teams';
import { LEAGUES } from '../../mocks/leagues';
import { peopleByKind } from '../../mocks/people';
import { formatCurrency, formatRelative } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE: Record<TeamStatus, 'success' | 'warning' | 'live' | 'neutral'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'live',
  archived: 'neutral',
};

const TABS = [
  { key: 'all', label: 'All teams' },
  { key: 'pending', label: 'Approvals' },
  { key: 'approved', label: 'Active' },
  { key: 'archived', label: 'Archived' },
];

const VIEW_TABS = [
  { key: 'cards', label: 'Cards' },
  { key: 'table', label: 'Table' },
];

export function TeamListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [view, setView] = useState<string>('cards');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TEAMS.filter((t) => {
      if (tab !== 'all' && t.status !== tab) return false;
      if (leagueFilter !== 'all' && t.leagueId !== leagueFilter) return false;
      if (q && !`${t.name} ${t.leagueName} ${t.abbreviation}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, leagueFilter, search]);

  // Per-league filter pills (Stitch reference: All Divisions / Premier
  // / Division 1 / Rec League).
  const leagueChips = useMemo(
    () => [
      { key: 'all', label: 'All divisions' },
      ...LEAGUES.slice(0, 4).map((l) => ({ key: l.id, label: l.name })),
    ],
    [],
  );

  // Stat-card row at the top — JTBD for league operators is "what
  // needs my attention right now". Total / Pending / Revenue mirrors
  // the Stitch Teams Management hero stats.
  const totals = useMemo(() => {
    const all = TEAMS;
    const pending = all.filter((t) => t.status === 'pending').length;
    const revenueCollected = all.reduce(
      (acc, t) => acc + t.feeCollectedCents,
      0,
    );
    const revenueTotal = all.reduce((acc, t) => acc + t.feeTotalCents, 0);
    const collectionPct =
      revenueTotal === 0 ? 1 : revenueCollected / revenueTotal;
    return {
      total: all.length,
      pending,
      revenueCollected,
      revenueTotal,
      collectionPct,
    };
  }, []);

  const columns: DataTableColumn<Team>[] = [
    {
      id: 'name',
      header: 'Team',
      width: 280,
      sortable: true,
      accessor: (t) => (
        <View style={styles.cellRow}>
          <Avatar initials={t.abbreviation} size={28} />
          <View style={styles.cellBody}>
            <Text variant="bodySm" color={colors.text.primary} weight="600">
              {t.name}
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              {t.leagueName}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 120,
      accessor: (t) => (
        <Tag size="sm" tone={STATUS_TONE[t.status]} leadingDot label={STATUS_LABEL[t.status]} />
      ),
    },
    {
      id: 'roster',
      header: 'Roster',
      width: 110,
      align: 'right',
      sortable: true,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {t.roster.length} / {t.rosterMax}
        </Text>
      ),
    },
    {
      id: 'record',
      header: 'Record',
      width: 110,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {t.wins}-{t.losses}-{t.ties} · {t.streak}
        </Text>
      ),
    },
    {
      id: 'collected',
      header: 'Fees collected',
      width: 160,
      align: 'right',
      sortable: true,
      accessor: (t) => (
        <View style={styles.feeCell}>
          <Text variant="bodySm" color={colors.text.primary}>
            {formatCurrency(t.feeCollectedCents)}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            of {formatCurrency(t.feeTotalCents)}
          </Text>
        </View>
      ),
    },
    {
      id: 'applied',
      header: 'Applied',
      width: 130,
      sortable: true,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.muted}>
          {formatRelative(t.appliedAtIso)}
        </Text>
      ),
    },
  ];

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === visible.length ? new Set() : new Set(visible.map((t) => t.id)),
    );

  return (
    <PageScroll>
      <PageHeader
        variant="hero"
        eyebrow="ROSTER MANAGEMENT"
        heroImage={{
          uri: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1600&q=70',
        }}
        title="Teams Management"
        subtitle="Approvals, rosters, dues, and division standings."
        meta={`${totals.pending} awaiting your review`}
        trailing={
          <Button
            label="Invite players"
            variant="ghost"
            size="sm"
            leadingIcon={<MailPlus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() => navigation.navigate('Players')}
          />
        }
      />

      <View style={styles.statsRow}>
        <StatCard
          label="Total Teams"
          value={String(totals.total)}
          tone="brand"
          icon={<Users size={18} color={colors.brand.primary} strokeWidth={2.25} />}
          trendCopy="+3 from last season"
        />
        <StatCard
          label="Pending Rosters"
          value={String(totals.pending)}
          tone="alpine"
          icon={
            <ClipboardList
              size={18}
              color={colors.brand.alpine}
              strokeWidth={2.25}
            />
          }
          progress={totals.total === 0 ? 0 : totals.pending / totals.total}
          urgent={totals.pending > 0}
        />
        <StatCard
          label="Revenue Collected"
          value={formatCurrency(totals.revenueCollected)}
          tone="neutral"
          icon={
            <Coins
              size={18}
              color={colors.text.primary}
              strokeWidth={2.25}
            />
          }
          trendCopy={`${Math.round(totals.collectionPct * 100)}% of projected total`}
        />
      </View>

      <Tabs items={TABS} value={tab} onChange={setTab} variant="segmented" />

      <View style={styles.filterPillsRow}>
        <Tabs
          items={leagueChips}
          value={leagueChips.some((c) => c.key === leagueFilter) ? leagueFilter : 'all'}
          onChange={setLeagueFilter}
          variant="pillDark"
        />
        <View style={styles.filterRight}>
          <Tabs
            items={VIEW_TABS}
            value={view}
            onChange={setView}
            variant="segmented"
          />
          <Button
            label="New Team"
            variant="solid"
            size="sm"
            leadingIcon={<Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() =>
              toast.show({ variant: 'info', title: 'Team creator coming soon' })
            }
          />
        </View>
      </View>

      <View style={styles.toolbar}>
        <Input
          variant="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search teams or league…"
          containerStyle={styles.searchField}
        />
        <Select
          options={[
            { value: 'all', label: 'All leagues' },
            ...LEAGUES.map((l) => ({ value: l.id, label: l.name })),
          ]}
          value={leagueFilter}
          onChange={setLeagueFilter}
          width={220}
        />
      </View>

      {view === 'cards' ? (
        <View style={styles.bentoGrid}>
          {visible.map((t) => (
            <TeamBentoCard
              key={t.id}
              team={t}
              onPress={() => navigation.navigate('TeamDetail', { id: t.id })}
              onMessage={() =>
                toast.show({
                  variant: 'info',
                  title: `Captain message draft for ${t.name}`,
                })
              }
            />
          ))}
        </View>
      ) : (
        <DataTable
          columns={columns}
          rows={visible}
          rowKey={(t) => t.id}
          selectable
          selectedIds={selected}
          onToggleSelect={(id) =>
            setSelected((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onToggleSelectAll={toggleAll}
          onRowPress={(t) => navigation.navigate('TeamDetail', { id: t.id })}
          emptyTitle="No teams match"
          emptyDescription="Try widening filters or check the Approvals tab."
          emptyIcon={<Users size={20} color={colors.brand.primary} strokeWidth={2.25} />}
        />
      )}

      <BulkActionBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        actions={[
          {
            label: 'Approve',
            onPress: () => {
              toast.show({
                variant: 'success',
                title: `Approved ${selected.size} team${selected.size === 1 ? '' : 's'}`,
              });
              setSelected(new Set());
            },
          },
          {
            label: 'Reject',
            tone: 'destructive',
            onPress: () => {
              toast.show({
                variant: 'info',
                title: `Rejected ${selected.size}`,
              });
              setSelected(new Set());
            },
          },
        ]}
      />
    </PageScroll>
  );
}

interface TeamBentoCardProps {
  team: Team;
  onPress: () => void;
  onMessage: () => void;
}

function TeamBentoCard({ team, onPress, onMessage }: TeamBentoCardProps) {
  const captain = team.roster.find((m) => m.role === 'captain');
  const captainName =
    captain?.name ?? peopleByKind('player').find((p) => p.id === team.captainId)?.name ?? 'Captain TBD';

  const rosterApproved = team.roster.length;
  const isFull = rosterApproved === team.rosterMax && team.status === 'approved';
  const isPending = team.status === 'pending';
  const balanceCents = Math.max(
    0,
    team.feeTotalCents - team.feeCollectedCents,
  );
  const duesPaid = balanceCents === 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${team.name}, ${team.leagueName}`}
      style={({ hovered, pressed }: WebPressableState) => [
        styles.bentoCard,
        isPending ? styles.bentoCardUrgent : null,
        hovered ? styles.bentoCardHover : null,
        pressed ? styles.bentoCardPressed : null,
      ]}
    >
      <View style={styles.bentoHead}>
        <View style={styles.bentoHeadLeft}>
          <Avatar initials={team.abbreviation} size={48} />
          <View style={styles.bentoHeadBody}>
            <Text variant="h3" color={colors.text.primary}>
              {team.name}
            </Text>
            <View style={styles.bentoLeagueChip}>
              <Text variant="caption" color={colors.brand.primary} weight="600">
                {team.leagueName.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`More options for ${team.name}`}
          hitSlop={6}
          style={styles.moreBtn}
        >
          <MoreVertical
            size={16}
            color={colors.text.muted}
            strokeWidth={2.25}
          />
        </Pressable>
      </View>

      <View style={styles.bentoStats}>
        <BentoStatRow
          label="Captain"
          value={captainName}
        />
        <BentoStatRow
          label="Roster"
          value={`${rosterApproved}/${team.rosterMax} ${
            isFull ? 'Approved' : isPending ? 'Pending' : 'Approved'
          }`}
          tone={isPending ? 'warning' : 'success'}
        />
        <BentoStatRow
          label="Dues"
          value={
            duesPaid
              ? 'Paid in Full'
              : `${formatCurrency(balanceCents)} balance`
          }
          tone={duesPaid ? 'success' : 'neutral'}
        />
      </View>

      <View style={styles.bentoActions}>
        <Button
          label="Manage"
          variant="ghost"
          size="sm"
          fullWidth
          onPress={onPress}
        />
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onMessage();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Message captain of ${team.name}`}
          hitSlop={4}
          style={({ hovered }: WebPressableState) => [
            styles.messageBtn,
            hovered ? styles.messageBtnHover : null,
          ]}
        >
          <MessageCircle
            size={16}
            color={colors.brand.primary}
            strokeWidth={2.25}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

interface BentoStatRowProps {
  label: string;
  value: string;
  tone?: 'success' | 'warning' | 'neutral';
}

function BentoStatRow({ label, value, tone = 'neutral' }: BentoStatRowProps) {
  const valueColor =
    tone === 'success'
      ? colors.status.success
      : tone === 'warning'
      ? colors.brand.alpine
      : colors.text.primary;
  const valueBg =
    tone === 'success'
      ? '#E2F4E4'
      : tone === 'warning'
      ? colors.brand.alpineSoft
      : colors.surface.containerLow;

  return (
    <View style={styles.bentoStatRow}>
      <Text variant="bodySm" color={colors.text.muted}>
        {label}
      </Text>
      <View style={[styles.bentoStatPill, { backgroundColor: valueBg }]}>
        <Text variant="caption" color={valueColor} weight="600">
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  searchField: {
    flex: 1,
    minWidth: 240,
  },
  cellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cellBody: {
    flex: 1,
    gap: 2,
  },
  feeCell: {
    alignItems: 'flex-end',
    gap: 2,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  bentoCard: {
    flexBasis: 320,
    flexGrow: 1,
    maxWidth: 420,
    minHeight: 260,
    backgroundColor: colors.surface.card,
    borderRadius: radii.cardLg,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.glow,
  },
  bentoCardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand.alpine,
  },
  bentoCardHover: {
    transform: [{ translateY: -2 }],
  },
  bentoCardPressed: {
    opacity: 0.92,
  },
  bentoHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  bentoHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  bentoHeadBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  bentoLeagueChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: colors.brand.soft,
  },
  moreBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoStats: {
    gap: spacing.sm,
  },
  bentoStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bentoStatPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  bentoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  messageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBtnHover: {
    backgroundColor: colors.brand.accent + '33',
  },
});
