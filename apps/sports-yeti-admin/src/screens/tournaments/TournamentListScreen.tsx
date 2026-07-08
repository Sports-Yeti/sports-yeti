import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Swords } from 'lucide-react-native';
import {
  TOURNAMENTS,
  leagueById,
  type Tournament,
  type TournamentStatus,
} from '@sports-yeti/mocks';
import {
  DataTable,
  PageHeader,
  PageScroll,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import { Button, Input, Select, Tag, Text } from '../../ui';
import { colors, spacing } from '../../theme';
import { formatCurrency, formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE: Record<TournamentStatus, 'success' | 'warning' | 'neutral'> = {
  draft: 'warning',
  registration_open: 'success',
  in_progress: 'success',
  completed: 'neutral',
};

const STATUS_LABEL: Record<TournamentStatus, string> = {
  draft: 'Draft',
  registration_open: 'Registration open',
  in_progress: 'In progress',
  completed: 'Completed',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'registration_open', label: 'Registration open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

const FORMAT_LABEL: Record<Tournament['format'], string> = {
  round_robin: 'Round-robin',
  single_elim: 'Single elim',
  double_elim: 'Double elim',
  round_robin_playoff: 'Round-robin · Playoff',
  self_scheduled: 'Self-scheduled',
};

export function TournamentListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TOURNAMENTS.filter((t) => {
      if (status !== 'all' && t.status !== status) return false;
      if (!q) return true;
      const league = leagueById(t.leagueId);
      const haystack = `${t.name} ${t.city} ${league?.name ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [search, status]);

  const columns: DataTableColumn<Tournament>[] = [
    {
      id: 'tournament',
      header: 'Tournament',
      width: 260,
      sortable: true,
      accessor: (t) => (
        <View style={[styles.cellStack, { gap: 4 }]}>
          <Text variant="bodySm" weight="600" color={colors.text.primary}>
            {t.name}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {leagueById(t.leagueId)?.name ?? '—'} · {t.city}
          </Text>
        </View>
      ),
    },
    {
      id: 'format',
      header: 'Format',
      width: 180,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {FORMAT_LABEL[t.format]}
        </Text>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 160,
      accessor: (t) => (
        <Tag size="sm" tone={STATUS_TONE[t.status]} label={STATUS_LABEL[t.status]} leadingDot />
      ),
    },
    {
      id: 'window',
      header: 'Dates',
      width: 200,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {formatDate(t.startIso, { month: 'short', day: 'numeric' })} —{' '}
          {formatDate(t.endIso, { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      ),
    },
    {
      id: 'teams',
      header: 'Teams',
      width: 120,
      align: 'right',
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {t.registeredTeams} / {t.maxTeams}
        </Text>
      ),
    },
    {
      id: 'fee',
      header: 'Entry fee',
      width: 120,
      align: 'right',
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {t.feeCents === 0 ? 'Free' : formatCurrency(t.feeCents)}
        </Text>
      ),
    },
  ];

  return (
    <PageScroll>
      <PageHeader
        title="Tournaments"
        subtitle="One-off bracketed events a league runs for teams to register into, separate from recurring seasons."
        crumbs={[{ label: 'Competition' }, { label: 'Tournaments' }]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <Button
            variant="solid"
            size="sm"
            label="New tournament"
            onPress={() => navigation.navigate('TournamentForm')}
          />
        }
      />
      <View style={[styles.toolbar, { gap: spacing.sm }]}>
        <View style={{ flex: 2 }}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search tournament, city, or league…"
            size="sm"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </View>
      </View>
      <DataTable<Tournament>
        columns={columns}
        rows={visible}
        rowKey={(t) => t.id}
        onRowPress={(t) => navigation.navigate('TournamentDetail', { id: t.id })}
        emptyTitle="No tournaments match"
        emptyDescription="Try a different filter — or create the next tournament."
        emptyIcon={<Swords size={32} color={colors.text.muted} />}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  cellStack: {
    flexDirection: 'column',
  },
});
