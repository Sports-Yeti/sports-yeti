import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Trophy } from 'lucide-react-native';
import {
  BulkActionBar,
  DataTable,
  PageHeader,
  PageScroll,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import { Button, Input, Modal, Select, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import {
  LEAGUES,
  SPORT_OPTIONS,
  type League,
  type LeagueStatus,
} from '../../mocks/leagues';
import { formatCurrency, formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_OPTIONS: { value: LeagueStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_TONE: Record<LeagueStatus, 'success' | 'warning' | 'neutral'> = {
  published: 'success',
  draft: 'warning',
  archived: 'neutral',
};

const STATUS_LABEL: Record<LeagueStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

export function LeagueListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState<string>('all');
  const [status, setStatus] = useState<LeagueStatus | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<League | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LEAGUES.filter((l) => {
      if (sport !== 'all' && l.sport !== sport) return false;
      if (status !== 'all' && l.status !== status) return false;
      if (q && !`${l.name} ${l.city} ${l.sportLabel}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, sport, status]);

  const columns: DataTableColumn<League>[] = [
    {
      id: 'name',
      header: 'League',
      width: 280,
      sortable: true,
      accessor: (l) => (
        <View style={styles.nameCell}>
          <Text variant="bodySm" color={colors.text.primary} weight="600">
            {l.name}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {l.sportLabel} · {l.city}
          </Text>
        </View>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 120,
      accessor: (l) => (
        <Tag size="sm" tone={STATUS_TONE[l.status]} label={STATUS_LABEL[l.status]} leadingDot />
      ),
    },
    {
      id: 'season',
      header: 'Season',
      width: 200,
      accessor: (l) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {l.seasonName} · {formatDate(l.seasonStartIso, { month: 'short', day: 'numeric' })} – {formatDate(l.seasonEndIso, { month: 'short', day: 'numeric' })}
        </Text>
      ),
    },
    {
      id: 'teams',
      header: 'Teams',
      width: 100,
      align: 'right',
      sortable: true,
      accessor: (l) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {l.registeredTeams} / {l.maxTeams}
        </Text>
      ),
    },
    {
      id: 'players',
      header: 'Players',
      width: 100,
      align: 'right',
      sortable: true,
      accessor: (l) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {l.registeredPlayers}
        </Text>
      ),
    },
    {
      id: 'fee',
      header: 'Fee',
      width: 110,
      align: 'right',
      sortable: true,
      accessor: (l) => (
        <Text variant="bodySm" color={colors.brand.primary}>
          {l.feeCents === 0 ? 'Free' : formatCurrency(l.feeCents)}
        </Text>
      ),
    },
  ];

  const toggleAll = () =>
    setSelected((prev) => {
      if (prev.size === visible.length) return new Set();
      return new Set(visible.map((l) => l.id));
    });

  return (
    <PageScroll>
      <PageHeader
        title="Leagues"
        subtitle="Every league across your organization"
        meta={`${visible.length} of ${LEAGUES.length} shown`}
        trailing={
          <Button
            label="Create league"
            variant="solid"
            size="sm"
            leadingIcon={
              <Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />
            }
            onPress={() => navigation.navigate('LeagueForm', undefined)}
          />
        }
      />

      <View style={styles.filters}>
        <Input
          variant="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search leagues, sport, or city…"
          containerStyle={styles.searchField}
        />
        <Select
          options={[
            { value: 'all', label: 'All sports' },
            ...SPORT_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
          ]}
          value={sport}
          onChange={setSport}
          width={180}
        />
        <Select
          options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
          value={status}
          onChange={(v) => setStatus(v as LeagueStatus | 'all')}
          width={180}
        />
      </View>

      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(l) => l.id}
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
        onRowPress={(l) => navigation.navigate('LeagueDetail', { id: l.id })}
        emptyTitle="No leagues match"
        emptyDescription="Try widening your filters, or create a new league."
        emptyIcon={<Trophy size={20} color={colors.brand.primary} strokeWidth={2.25} />}
      />

      <BulkActionBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        actions={[
          {
            label: 'Publish',
            onPress: () =>
              toast.show({
                variant: 'success',
                title: `Published ${selected.size} league${selected.size === 1 ? '' : 's'}`,
              }),
          },
          {
            label: 'Archive',
            onPress: () =>
              toast.show({
                variant: 'info',
                title: `Archived ${selected.size}`,
              }),
          },
        ]}
      />

      <Modal
        visible={!!confirmDelete}
        onRequestClose={() => setConfirmDelete(null)}
        variant="destructive"
        title={`Delete ${confirmDelete?.name ?? ''}?`}
        description="This is irreversible. Type the league's name to confirm."
        primaryAction={{
          label: 'Delete league',
          disabled: confirmName !== confirmDelete?.name,
          onPress: () => {
            if (!confirmDelete) return;
            const name = confirmDelete.name;
            setConfirmDelete(null);
            setConfirmName('');
            toast.show({
              variant: 'success',
              title: `Deleted ${name}`,
            });
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmDelete(null),
        }}
      >
        <Input
          autoFocus
          value={confirmName}
          onChangeText={setConfirmName}
          placeholder={confirmDelete?.name}
        />
      </Modal>
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
  nameCell: {
    gap: 2,
  },
});
