import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Trophy } from 'lucide-react-native';
import { SeasonPill } from '@sports-yeti/ui';
import {
  divisionsForSeason,
  LEAGUES,
  organizationById,
  seasonById,
  seasonsByLeague,
  SPORT_OPTIONS,
  type League,
  type Season,
} from '@sports-yeti/mocks';
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

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const SPORT_FILTER_OPTIONS = [
  { value: 'all', label: 'All sports' },
  ...SPORT_OPTIONS,
];

export function LeagueListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<League | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LEAGUES.filter((l) => {
      if (sport !== 'all' && l.sport !== sport) return false;
      if (
        q &&
        !`${l.name} ${l.city} ${l.sportTagline}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [search, sport]);

  function activeSeasonFor(l: League): Season | undefined {
    if (l.activeSeasonId) return seasonById(l.activeSeasonId);
    return seasonsByLeague(l.id)[0];
  }

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
            {l.sportTagline} · {l.city}
          </Text>
        </View>
      ),
    },
    {
      id: 'org',
      header: 'Organization',
      width: 200,
      accessor: (l) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {organizationById(l.organizationId)?.name ?? '—'}
        </Text>
      ),
    },
    {
      id: 'season',
      header: 'Active season',
      width: 220,
      accessor: (l) => {
        const s = activeSeasonFor(l);
        if (!s) {
          return (
            <Tag size="sm" tone="warning" label="No active season" />
          );
        }
        return (
          <View style={[styles.seasonStack, { gap: 4 }]}>
            <SeasonPill cycle={s.cycle} year={s.year} />
            <Text variant="caption" color={colors.text.muted}>
              {s.label}
            </Text>
          </View>
        );
      },
    },
    {
      id: 'divisions',
      header: 'Divisions',
      width: 120,
      align: 'right',
      accessor: (l) => {
        const s = activeSeasonFor(l);
        const count = s ? divisionsForSeason(s.id).length : 0;
        return (
          <Text variant="bodySm" color={colors.text.primary}>
            {count}
          </Text>
        );
      },
    },
    {
      id: 'seasons',
      header: 'Seasons',
      width: 100,
      align: 'right',
      accessor: (l) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {seasonsByLeague(l.id).length}
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
        variant="hero"
        eyebrow="COMPETITION"
        title="Leagues"
        subtitle="Every league across your organizations. Each league hosts seasons; each season hosts divisions."
        meta={`${visible.length} of ${LEAGUES.length} shown`}
        trailing={
          <Button
            label="New league"
            variant="solid"
            size="sm"
            leadingIcon={
              <Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />
            }
            onPress={() => navigation.navigate('LeagueForm')}
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
          options={SPORT_FILTER_OPTIONS}
          value={sport}
          onChange={setSport}
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
  seasonStack: {
    flexDirection: 'column',
  },
});
