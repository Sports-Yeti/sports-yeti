import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CalendarDays } from 'lucide-react-native';
import { SeasonPill } from '@sports-yeti/ui';
import {
  SEASONS,
  divisionsForSeason,
  leagueById,
  type Season,
  type SeasonStatus,
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
import { formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE: Record<SeasonStatus, 'success' | 'warning' | 'neutral'> = {
  draft: 'warning',
  registration_open: 'success',
  in_progress: 'success',
  completed: 'neutral',
  archived: 'neutral',
};

const STATUS_LABEL: Record<SeasonStatus, string> = {
  draft: 'Draft',
  registration_open: 'Registration open',
  in_progress: 'In progress',
  completed: 'Completed',
  archived: 'Archived',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'registration_open', label: 'Registration open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const CYCLE_OPTIONS = [
  { value: 'all', label: 'All cycles' },
  { value: 'spring_summer', label: 'Spring/Summer' },
  { value: 'fall_winter', label: 'Fall/Winter' },
];

export function SeasonListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [cycle, setCycle] = useState<string>('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SEASONS.filter((s) => {
      if (status !== 'all' && s.status !== status) return false;
      if (cycle !== 'all' && s.cycle !== cycle) return false;
      if (!q) return true;
      const league = leagueById(s.leagueId);
      const haystack = `${s.label} ${league?.name ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [search, status, cycle]);

  const columns: DataTableColumn<Season>[] = [
    {
      id: 'season',
      header: 'Season',
      width: 240,
      sortable: true,
      accessor: (s) => (
        <View style={[styles.cellStack, { gap: 4 }]}>
          <Text variant="bodySm" weight="600" color={colors.text.primary}>
            {s.label}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {leagueById(s.leagueId)?.name ?? '—'}
          </Text>
        </View>
      ),
    },
    {
      id: 'cycle',
      header: 'Cycle',
      width: 180,
      accessor: (s) => <SeasonPill cycle={s.cycle} year={s.year} />,
    },
    {
      id: 'status',
      header: 'Status',
      width: 160,
      accessor: (s) => (
        <Tag size="sm" tone={STATUS_TONE[s.status]} label={STATUS_LABEL[s.status]} leadingDot />
      ),
    },
    {
      id: 'window',
      header: 'Window',
      width: 220,
      accessor: (s) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {formatDate(s.startIso, { month: 'short', day: 'numeric' })} —{' '}
          {formatDate(s.endIso, { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      ),
    },
    {
      id: 'divisions',
      header: 'Divisions',
      width: 120,
      align: 'right',
      accessor: (s) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {divisionsForSeason(s.id).length}
        </Text>
      ),
    },
  ];

  return (
    <PageScroll>
      <PageHeader
        title="Seasons"
        subtitle="Each league runs Spring/Summer + Fall/Winter cycles. A season hosts the divisions where teams actually play."
        crumbs={[{ label: 'Competition' }, { label: 'Seasons' }]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <Button
            variant="solid"
            size="sm"
            label="New season"
            onPress={() => navigation.navigate('SeasonForm')}
          />
        }
      />
      <View style={[styles.toolbar, { gap: spacing.sm }]}>
        <View style={{ flex: 2 }}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search season or league…"
            size="sm"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            value={cycle}
            onChange={setCycle}
            options={CYCLE_OPTIONS}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />
        </View>
      </View>
      <DataTable<Season>
        columns={columns}
        rows={visible}
        rowKey={(s) => s.id}
        onRowPress={(s) => navigation.navigate('SeasonDetail', { id: s.id })}
        emptyTitle="No seasons match"
        emptyDescription="Try a different filter — or create the next season."
        emptyIcon={<CalendarDays size={32} color={colors.text.muted} />}
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
