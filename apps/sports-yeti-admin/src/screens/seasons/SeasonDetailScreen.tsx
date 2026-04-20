import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { SeasonPill, SkillLevelPill } from '@sports-yeti/ui';
import {
  divisionsForSeason,
  gamesForDivision,
  leagueById,
  organizationById,
  seasonById,
  teamsByDivision,
  type Division,
  type DivisionStatus,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Tabs, Tag, Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, spacing } from '../../theme';
import { formatCurrency, formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const DIVISION_STATUS_TONE: Record<
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

const DIVISION_STATUS_LABEL: Record<DivisionStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  closed: 'Closed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const TABS = [
  { key: 'divisions', label: 'Divisions' },
  { key: 'teams', label: 'Teams' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'standings', label: 'Standings' },
];

export function SeasonDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const seasonId = route.params?.id;
  const season = useMemo(() => seasonById(seasonId), [seasonId]);
  const league = useMemo(
    () => (season ? leagueById(season.leagueId) : undefined),
    [season],
  );
  const org = useMemo(
    () => (season ? organizationById(season.organizationId) : undefined),
    [season],
  );
  const divisions = useMemo(
    () => (season ? divisionsForSeason(season.id) : []),
    [season],
  );
  const [tab, setTab] = useState('divisions');

  if (!season || !league || !org) {
    return (
      <PageScroll>
        <PageHeader title="Season not found" />
      </PageScroll>
    );
  }

  const totalTeams = divisions.reduce(
    (sum, d) => sum + teamsByDivision(d.id).length,
    0,
  );
  const totalGames = divisions.reduce(
    (sum, d) => sum + gamesForDivision(d.id).length,
    0,
  );

  const inner = (
    <PageScroll>
      <PageHeader
        title={`${league.name} · ${season.label}`}
        subtitle={`${league.sportTagline} · ${formatDate(season.startIso)} – ${formatDate(season.endIso)}`}
        crumbs={[
          { label: 'Competition' },
          { label: 'Leagues', route: 'Leagues' },
          { label: league.name, route: 'LeagueDetail' },
          { label: season.label },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <View style={[styles.headerTrail, { gap: spacing.sm }]}>
            <SeasonPill cycle={season.cycle} year={season.year} />
            <Button
              size="sm"
              variant="outline"
              label="Edit season"
              onPress={() =>
                navigation.navigate('SeasonForm', { id: season.id })
              }
            />
          </View>
        }
      />

      <View style={[styles.statRow, { gap: spacing.md }]}>
        <StatCard
          label="Divisions"
          value={String(divisions.length)}
          tone="brand"
        />
        <StatCard label="Teams" value={String(totalTeams)} tone="success" />
        <StatCard label="Games" value={String(totalGames)} tone="alpine" />
        <StatCard
          label="Format"
          value={season.format.replace(/_/g, ' ')}
          tone="neutral"
        />
      </View>

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'divisions' ? (
        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <Text variant="h3">Divisions</Text>
            <Button
              size="sm"
              variant="solid"
              label="New division"
              leadingIcon={
                <Plus size={14} color={colors.text.inverse} strokeWidth={2.4} />
              }
              onPress={() => navigation.navigate('DivisionForm')}
            />
          </View>
          {divisions.length === 0 ? (
            <Text variant="body" color={colors.text.secondary}>
              No divisions yet. Add one to start accepting team applications.
            </Text>
          ) : (
            divisions.map((d: Division) => (
              <View
                key={d.id}
                style={[styles.divisionRow, { gap: spacing.sm }]}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodySm" weight="600">
                    {d.name}
                  </Text>
                  <View style={[styles.metaRow, { gap: spacing.xs }]}>
                    <SkillLevelPill level={d.skillLevel} />
                    {d.ageBand ? (
                      <Tag size="sm" tone="neutral" label={d.ageBand} />
                    ) : null}
                    <Tag
                      size="sm"
                      tone={DIVISION_STATUS_TONE[d.status]}
                      label={DIVISION_STATUS_LABEL[d.status]}
                      leadingDot
                    />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text variant="bodySm" color={colors.text.primary}>
                    {d.registeredTeams} / {d.maxTeams} teams
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {formatCurrency(d.registrationFeeCents)} per team
                  </Text>
                </View>
                <Button
                  size="sm"
                  variant="ghost"
                  label="Open"
                  onPress={() =>
                    navigation.navigate('DivisionDetail', { id: d.id })
                  }
                />
              </View>
            ))
          )}
        </Card>
      ) : null}

      {tab === 'teams' ? (
        <Card padded>
          <Text variant="h3">Teams</Text>
          <Text variant="body" color={colors.text.secondary}>
            Roll-up of every team across divisions in this season. Drill into
            a division to manage that division's team list.
          </Text>
        </Card>
      ) : null}

      {tab === 'schedule' ? (
        <Card padded>
          <Text variant="h3">Schedule</Text>
          <Text variant="body" color={colors.text.secondary}>
            {totalGames} game{totalGames === 1 ? '' : 's'} scheduled this
            season.
          </Text>
          <Button
            size="sm"
            variant="solid"
            label="Open schedule"
            onPress={() => navigation.navigate('Schedule')}
          />
        </Card>
      ) : null}

      {tab === 'standings' ? (
        <Card padded>
          <Text variant="h3">Standings</Text>
          <Text variant="body" color={colors.text.secondary}>
            Standings update after each game. Sport-specific tiebreakers come
            from the per-sport stat template.
          </Text>
        </Card>
      ) : null}
    </PageScroll>
  );

  return <OrgBrandingProvider org={org}>{inner}</OrgBrandingProvider>;
}

const styles = StyleSheet.create({
  headerTrail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  divisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
