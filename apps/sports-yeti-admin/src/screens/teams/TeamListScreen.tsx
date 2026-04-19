import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, MailPlus, Users, XCircle } from 'lucide-react-native';
import {
  BulkActionBar,
  DataTable,
  PageHeader,
  PageScroll,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import { Avatar, Button, Input, Select, Tabs, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import {
  STATUS_LABEL,
  TEAMS,
  type Team,
  type TeamStatus,
} from '../../mocks/teams';
import { LEAGUES } from '../../mocks/leagues';
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

export function TeamListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
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

  const pendingCount = TEAMS.filter((t) => t.status === 'pending').length;

  return (
    <PageScroll>
      <PageHeader
        variant="hero"
        eyebrow="ROSTER MANAGEMENT"
        heroImage={{
          uri: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1600&q=70',
        }}
        title="Teams"
        subtitle="Approvals, rosters, and per-team fees"
        meta={`${pendingCount} awaiting your review`}
        trailing={
          <Button
            label="Invite players"
            variant="solid"
            size="sm"
            leadingIcon={<MailPlus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() => navigation.navigate('Players')}
          />
        }
      />

      <Tabs items={TABS} value={tab} onChange={setTab} variant="segmented" />

      <View style={styles.filters}>
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

const styles = StyleSheet.create({
  filters: {
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
});
