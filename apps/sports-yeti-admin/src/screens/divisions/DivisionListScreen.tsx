import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Trophy } from 'lucide-react-native';
import { SkillLevelPill } from '@sports-yeti/ui';
import {
  DIVISIONS,
  leagueById,
  seasonById,
  type Division,
  type DivisionStatus,
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
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_TONE: Record<
  DivisionStatus,
  'success' | 'warning' | 'neutral'
> = {
  draft: 'warning',
  open: 'success',
  closed: 'neutral',
  in_progress: 'success',
  completed: 'neutral',
  cancelled: 'neutral',
};

const STATUS_LABEL: Record<DivisionStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  closed: 'Closed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function DivisionListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DIVISIONS.filter((d) => {
      if (status !== 'all' && d.status !== status) return false;
      if (!q) return true;
      const league = leagueById(d.leagueId);
      const season = seasonById(d.seasonId);
      const haystack =
        `${d.name} ${league?.name ?? ''} ${season?.label ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [search, status]);

  const columns: DataTableColumn<Division>[] = [
    {
      id: 'name',
      header: 'Division',
      width: 240,
      sortable: true,
      accessor: (d) => (
        <View style={[styles.cellStack, { gap: 4 }]}>
          <Text variant="bodySm" weight="600" color={colors.text.primary}>
            {d.name}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {leagueById(d.leagueId)?.name ?? '—'} ·{' '}
            {seasonById(d.seasonId)?.label ?? '—'}
          </Text>
        </View>
      ),
    },
    {
      id: 'skill',
      header: 'Skill',
      width: 160,
      accessor: (d) => <SkillLevelPill level={d.skillLevel} />,
    },
    {
      id: 'teams',
      header: 'Teams',
      width: 120,
      align: 'right',
      sortable: true,
      accessor: (d) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {d.registeredTeams} / {d.maxTeams}
        </Text>
      ),
    },
    {
      id: 'fee',
      header: 'Fee',
      width: 140,
      align: 'right',
      accessor: (d) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {formatCurrency(d.registrationFeeCents)}
        </Text>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 160,
      accessor: (d) => (
        <Tag
          size="sm"
          tone={STATUS_TONE[d.status]}
          label={STATUS_LABEL[d.status]}
          leadingDot
        />
      ),
    },
  ];

  return (
    <PageScroll>
      <PageHeader
        title="Divisions"
        subtitle="Skill-leveled buckets inside a season. Each division has its own registration window, fee, and team cap."
        crumbs={[{ label: 'Competition' }, { label: 'Divisions' }]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <Button
            variant="solid"
            size="sm"
            label="New division"
            onPress={() => navigation.navigate('DivisionForm')}
          />
        }
      />
      <View style={[styles.toolbar, { gap: spacing.sm }]}>
        <View style={{ flex: 2 }}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search division, league, or season…"
            size="sm"
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
      <DataTable<Division>
        columns={columns}
        rows={visible}
        rowKey={(d) => d.id}
        onRowPress={(d) =>
          navigation.navigate('DivisionDetail', { id: d.id })
        }
        emptyTitle="No divisions match"
        emptyDescription="Create a division to start accepting team applications."
        emptyIcon={<Trophy size={32} color={colors.text.muted} />}
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
