import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Activity, Award, Download, Share2, Trophy } from 'lucide-react-native';
import {
  DataTable,
  PageHeader,
  PageScroll,
  StatCard,
  type DataTableColumn,
} from '../../admin';
import {
  Avatar,
  Button,
  Card,
  Select,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { TEAMS, type Team } from '../../mocks/teams';
import { peopleByKind, type Person } from '../../mocks/people';
import { LEAGUES } from '../../mocks/leagues';
import { useAllGames } from '../../stores';
import { formatPercent } from '../../lib/format';

const TABS = [
  { key: 'standings', label: 'Standings' },
  { key: 'leaders', label: 'Leaders' },
  { key: 'mvp', label: 'MVP voting' },
];

interface PlayerStats {
  goals: number;
  assists: number;
  mvpVotes: number;
  attendance: number; // 0–100
}

// Deterministic per-player synthetic stats (mock-only).
function statsFor(person: Person): PlayerStats {
  let h = 0;
  for (const c of person.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return {
    goals: 4 + (h % 18),
    assists: 2 + ((h >>> 4) % 14),
    mvpVotes: ((h >>> 8) % 12),
    attendance: 70 + ((h >>> 12) % 30),
  };
}

export function StatsScreen() {
  const toast = useToast();
  const allGames = useAllGames();
  const [tab, setTab] = useState('standings');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');

  const players = useMemo(() => peopleByKind('player'), []);
  const playersWithStats = useMemo(
    () =>
      players.map((p) => ({
        person: p,
        stats: statsFor(p),
      })),
    [players],
  );

  const teamRows = useMemo(() => {
    const rows =
      leagueFilter === 'all'
        ? TEAMS
        : TEAMS.filter((t) => t.leagueId === leagueFilter);
    return [...rows].sort((a, b) => {
      const aPts = a.wins * 3 + a.ties;
      const bPts = b.wins * 3 + b.ties;
      if (bPts !== aPts) return bPts - aPts;
      return b.wins - a.wins;
    });
  }, [leagueFilter]);

  const completedGames = useMemo(
    () =>
      allGames.filter(
        (g) =>
          g.status === 'completed' &&
          (leagueFilter === 'all' || g.leagueId === leagueFilter),
      ),
    [allGames, leagueFilter],
  );

  const totalGoalsScored = completedGames.reduce(
    (acc, g) => acc + (g.homeScore ?? 0) + (g.awayScore ?? 0),
    0,
  );
  const avgAttendance =
    playersWithStats.reduce((acc, p) => acc + p.stats.attendance, 0) /
    Math.max(playersWithStats.length, 1);
  const totalMvpVotes = playersWithStats.reduce(
    (acc, p) => acc + p.stats.mvpVotes,
    0,
  );

  const teamRank = useMemo(() => {
    const map = new Map<string, number>();
    teamRows.forEach((t, i) => map.set(t.id, i + 1));
    return map;
  }, [teamRows]);

  const teamColumns: DataTableColumn<Team>[] = [
    {
      id: 'rank',
      header: '#',
      width: 48,
      align: 'right',
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.muted}>
          {teamRank.get(t.id) ?? '—'}
        </Text>
      ),
    },
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
      id: 'wins',
      header: 'W',
      width: 50,
      align: 'right',
      sortable: true,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {t.wins}
        </Text>
      ),
    },
    {
      id: 'losses',
      header: 'L',
      width: 50,
      align: 'right',
      sortable: true,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {t.losses}
        </Text>
      ),
    },
    {
      id: 'ties',
      header: 'T',
      width: 50,
      align: 'right',
      sortable: true,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {t.ties}
        </Text>
      ),
    },
    {
      id: 'pct',
      header: 'Win %',
      width: 80,
      align: 'right',
      sortable: true,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {formatPercent(t.wins, t.wins + t.losses + t.ties)}
        </Text>
      ),
    },
    {
      id: 'pts',
      header: 'Pts',
      width: 60,
      align: 'right',
      sortable: true,
      accessor: (t) => (
        <Text variant="bodySm" color={colors.brand.primary} weight="600">
          {t.wins * 3 + t.ties}
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
          tone={
            t.streak.startsWith('W')
              ? 'success'
              : t.streak.startsWith('L')
              ? 'live'
              : 'neutral'
          }
          label={t.streak}
        />
      ),
    },
  ];

  const topScorers = useMemo(
    () =>
      [...playersWithStats]
        .sort((a, b) => b.stats.goals - a.stats.goals)
        .slice(0, 10),
    [playersWithStats],
  );

  const topAssists = useMemo(
    () =>
      [...playersWithStats]
        .sort((a, b) => b.stats.assists - a.stats.assists)
        .slice(0, 10),
    [playersWithStats],
  );

  const topAttendance = useMemo(
    () =>
      [...playersWithStats]
        .sort((a, b) => b.stats.attendance - a.stats.attendance)
        .slice(0, 10),
    [playersWithStats],
  );

  const mvpLeaders = useMemo(
    () =>
      [...playersWithStats]
        .filter((p) => p.stats.mvpVotes > 0)
        .sort((a, b) => b.stats.mvpVotes - a.stats.mvpVotes)
        .slice(0, 8),
    [playersWithStats],
  );

  const handleExport = () => {
    toast.show({
      variant: 'success',
      title: 'CSV export queued',
      description:
        leagueFilter === 'all'
          ? `${teamRows.length} teams · ${playersWithStats.length} players`
          : `${teamRows.length} teams · ${LEAGUES.find((l) => l.id === leagueFilter)?.name}`,
    });
  };

  return (
    <PageScroll>
      <PageHeader
        variant="hero"
        eyebrow="SEASON LEADERBOARD"
        title="Stats"
        subtitle="Standings, leaders, and MVP voting · scoped to a league or org-wide."
        meta={`${LEAGUES.length} leagues · ${TEAMS.length} teams · ${players.length} players`}
        trailing={
          <>
            <Select
              options={[
                { value: 'all', label: 'All leagues' },
                ...LEAGUES.map((l) => ({ value: l.id, label: l.name })),
              ]}
              value={leagueFilter}
              onChange={setLeagueFilter}
              width={220}
            />
            <Button
              label="Export CSV"
              variant="ghost"
              size="sm"
              leadingIcon={
                <Download size={14} color={colors.brand.primary} strokeWidth={2.25} />
              }
              onPress={handleExport}
            />
            <Button
              label="Share board link"
              variant="ghost"
              size="sm"
              leadingIcon={
                <Share2 size={14} color={colors.brand.primary} strokeWidth={2.25} />
              }
              onPress={() =>
                toast.show({
                  variant: 'info',
                  title: 'Public board link copied',
                  description:
                    'Share this link with parents and fans (mock for now).',
                })
              }
            />
          </>
        }
      />

      <View style={styles.statsRow}>
        <StatCard
          label="Games played"
          value={String(completedGames.length)}
          helper={`${allGames.filter((g) => g.status === 'scheduled').length} scheduled`}
          tone="brand"
          icon={<Trophy size={14} color={colors.brand.deep} strokeWidth={2.25} />}
        />
        <StatCard
          label="Total goals scored"
          value={String(totalGoalsScored)}
          helper="across completed matches"
          tone="success"
          icon={<Activity size={14} color={colors.status.success} strokeWidth={2.25} />}
        />
        <StatCard
          label="Avg attendance"
          value={`${Math.round(avgAttendance)}%`}
          helper="per player, last 4 weeks"
          tone="brand"
          icon={<Activity size={14} color={colors.brand.deep} strokeWidth={2.25} />}
        />
        <StatCard
          label="MVP votes cast"
          value={String(totalMvpVotes)}
          helper={`${mvpLeaders.length} candidates`}
          tone="warning"
          icon={<Award size={14} color={colors.status.warning} strokeWidth={2.25} />}
        />
      </View>

      <Tabs items={TABS} value={tab} onChange={setTab} variant="segmented" />

      {tab === 'standings' ? (
        <DataTable
          columns={teamColumns}
          rows={teamRows}
          rowKey={(t) => t.id}
          emptyTitle="No teams in this league"
          emptyIcon={<Trophy size={20} color={colors.brand.primary} strokeWidth={2.25} />}
        />
      ) : null}

      {tab === 'leaders' ? (
        <View style={styles.boardsGrid}>
          <LeaderCard
            title="Top scorers"
            unit="goals"
            tone="success"
            entries={topScorers.map((p) => ({
              person: p.person,
              value: p.stats.goals,
            }))}
          />
          <LeaderCard
            title="Top assists"
            unit="assists"
            tone="brand"
            entries={topAssists.map((p) => ({
              person: p.person,
              value: p.stats.assists,
            }))}
          />
          <LeaderCard
            title="Best attendance"
            unit="%"
            tone="info"
            entries={topAttendance.map((p) => ({
              person: p.person,
              value: p.stats.attendance,
            }))}
          />
        </View>
      ) : null}

      {tab === 'mvp' ? (
        <Card>
          <View style={styles.mvpHead}>
            <Award size={18} color={colors.status.warning} strokeWidth={2.25} />
            <View style={styles.mvpHeadBody}>
              <Text variant="h3" color={colors.text.primary}>
                Season MVP voting
              </Text>
              <Text variant="bodySm" color={colors.text.muted}>
                Captains cast 1 vote per match. Voting closes at the end of the
                regular season.
              </Text>
            </View>
            <Tag tone="warning" size="sm" leadingDot label="Voting open" />
          </View>
          {mvpLeaders.length === 0 ? (
            <Text variant="bodySm" color={colors.text.muted}>
              No votes yet. Captains cast votes from the post-game card.
            </Text>
          ) : (
            mvpLeaders.map((entry, index) => {
              const max = mvpLeaders[0]!.stats.mvpVotes || 1;
              const widthPct = (entry.stats.mvpVotes / max) * 100;
              return (
                <View key={entry.person.id} style={styles.mvpRow}>
                  <Text variant="caption" color={colors.text.muted} style={styles.mvpRank}>
                    {index + 1}
                  </Text>
                  <Avatar
                    uri={entry.person.avatar}
                    initials={entry.person.name.charAt(0)}
                    size={32}
                  />
                  <View style={styles.mvpBody}>
                    <Text variant="bodySm" color={colors.text.primary} weight="600">
                      {entry.person.name}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {entry.person.teams?.[0]?.name ?? '—'}
                    </Text>
                    <View style={styles.mvpBarWrap}>
                      <View
                        style={[
                          styles.mvpBarFill,
                          { width: `${widthPct}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <Text
                    variant="bodySm"
                    color={colors.brand.primary}
                    weight="600"
                    style={styles.mvpVotes}
                  >
                    {entry.stats.mvpVotes}
                  </Text>
                </View>
              );
            })
          )}
        </Card>
      ) : null}
    </PageScroll>
  );
}

interface LeaderCardProps {
  title: string;
  unit: string;
  tone: 'brand' | 'success' | 'info';
  entries: { person: Person; value: number }[];
}

function LeaderCard({ title, unit, tone, entries }: LeaderCardProps) {
  return (
    <Card style={styles.leaderCard}>
      <View style={styles.leaderHead}>
        <Tag size="sm" tone={tone} label={title} />
        <Text variant="caption" color={colors.text.muted}>
          {unit}
        </Text>
      </View>
      {entries.map((entry, index) => (
        <View key={entry.person.id} style={styles.leaderRow}>
          <Text variant="caption" color={colors.text.muted} style={styles.leaderRank}>
            {index + 1}
          </Text>
          <Avatar
            uri={entry.person.avatar}
            initials={entry.person.name.charAt(0)}
            size={24}
          />
          <View style={styles.leaderBody}>
            <Text variant="bodySm" color={colors.text.primary} numberOfLines={1}>
              {entry.person.name}
            </Text>
            <Text variant="caption" color={colors.text.muted} numberOfLines={1}>
              {entry.person.teams?.[0]?.name ?? '—'}
            </Text>
          </View>
          <Text variant="bodySm" color={colors.brand.primary} weight="600">
            {entry.value}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
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
  boardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  leaderCard: {
    flex: 1,
    minWidth: 280,
    gap: spacing.sm,
  },
  leaderHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  leaderRank: {
    width: 18,
    textAlign: 'right',
  },
  leaderBody: {
    flex: 1,
    gap: 2,
  },
  mvpHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mvpHeadBody: { flex: 1, gap: 2 },
  mvpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  mvpRank: {
    width: 24,
    textAlign: 'right',
  },
  mvpBody: {
    flex: 1,
    gap: 4,
  },
  mvpBarWrap: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface.bg,
    overflow: 'hidden',
  },
  mvpBarFill: {
    height: '100%',
    backgroundColor: colors.status.warning,
    borderRadius: 2,
  },
  mvpVotes: {
    minWidth: 32,
    textAlign: 'right',
  },
});
