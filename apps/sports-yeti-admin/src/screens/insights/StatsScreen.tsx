import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Activity, Trophy } from 'lucide-react-native';
import {
  DataTable,
  PageHeader,
  PageScroll,
  type DataTableColumn,
} from '../../admin';
import { Avatar, Card, Tabs, Tag, Text } from '../../ui';
import { colors, spacing } from '../../theme';
import { TEAMS, type Team } from '../../mocks/teams';
import { peopleByKind, type Person } from '../../mocks/people';
import { LEAGUES } from '../../mocks/leagues';
import { formatPercent } from '../../lib/format';

const TABS = [
  { key: 'teams', label: 'Team standings' },
  { key: 'players', label: 'Player leaders' },
];

export function StatsScreen() {
  const [tab, setTab] = useState('teams');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');

  const teamRows = useMemo(() => {
    const rows = leagueFilter === 'all' ? TEAMS : TEAMS.filter((t) => t.leagueId === leagueFilter);
    return [...rows].sort((a, b) => b.wins - a.wins);
  }, [leagueFilter]);

  const teamColumns: DataTableColumn<Team>[] = [
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
    { id: 'wins', header: 'W', width: 60, align: 'right', sortable: true, accessor: (t) => <Text variant="bodySm" color={colors.text.primary}>{t.wins}</Text> },
    { id: 'losses', header: 'L', width: 60, align: 'right', sortable: true, accessor: (t) => <Text variant="bodySm" color={colors.text.primary}>{t.losses}</Text> },
    { id: 'ties', header: 'T', width: 60, align: 'right', sortable: true, accessor: (t) => <Text variant="bodySm" color={colors.text.primary}>{t.ties}</Text> },
    {
      id: 'pct',
      header: 'Win %',
      width: 100,
      align: 'right',
      sortable: true,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {formatPercent(t.wins, t.wins + t.losses + t.ties)}
        </Text>
      ),
    },
    {
      id: 'streak',
      header: 'Streak',
      width: 80,
      accessor: (t) => (
        <Tag
          size="sm"
          tone={t.streak.startsWith('W') ? 'success' : t.streak.startsWith('L') ? 'live' : 'neutral'}
          label={t.streak}
        />
      ),
    },
  ];

  const players = peopleByKind('player');

  const playerColumns: DataTableColumn<Person>[] = [
    {
      id: 'name',
      header: 'Player',
      width: 280,
      accessor: (p) => (
        <View style={styles.cellRow}>
          <Avatar uri={p.avatar} initials={p.name.charAt(0)} size={28} />
          <View style={styles.cellBody}>
            <Text variant="bodySm" color={colors.text.primary} weight="600">
              {p.name}
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              {p.position ?? '—'}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'team',
      header: 'Team',
      width: 220,
      accessor: (p) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {p.teams?.[0]?.name ?? '—'}
        </Text>
      ),
    },
    {
      id: 'experience',
      header: 'Experience',
      width: 130,
      accessor: (p) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {p.experience}
        </Text>
      ),
    },
  ];

  return (
    <PageScroll>
      <PageHeader
        title="Stats"
        subtitle="Standings, leaders, and roster tables"
        meta={`${LEAGUES.length} leagues · ${TEAMS.length} teams · ${players.length} players`}
      />

      <Tabs items={TABS} value={tab} onChange={setTab} variant="segmented" />

      {tab === 'teams' ? (
        <DataTable
          columns={teamColumns}
          rows={teamRows}
          rowKey={(t) => t.id}
          emptyTitle="No teams"
          emptyIcon={<Trophy size={20} color={colors.brand.primary} strokeWidth={2.25} />}
        />
      ) : (
        <DataTable
          columns={playerColumns}
          rows={players.slice(0, 20)}
          rowKey={(p) => p.id}
          emptyIcon={<Activity size={20} color={colors.brand.primary} strokeWidth={2.25} />}
        />
      )}

      <Card>
        <Text variant="h3" color={colors.text.primary}>
          Coming soon
        </Text>
        <Text variant="bodySm" color={colors.text.muted}>
          Per-game stats, MVP voting, and exportable league reports land in the next phase.
        </Text>
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  cellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cellBody: {
    flex: 1,
    gap: 2,
  },
});
