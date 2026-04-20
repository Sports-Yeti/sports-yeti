import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { SkillLevelPill } from '@sports-yeti/ui';
import {
  divisionById,
  gamesForDivision,
  leagueById,
  organizationById,
  seasonById,
  teamsByDivision,
  type DivisionStatus,
  type Team,
  type TeamStatus,
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

const TEAM_STATUS_TONE: Record<
  TeamStatus,
  'success' | 'warning' | 'neutral' | 'error'
> = {
  forming: 'warning',
  pending_review: 'warning',
  approved: 'success',
  rejected: 'error',
  withdrawn: 'neutral',
};

const TEAM_STATUS_LABEL: Record<TeamStatus, string> = {
  forming: 'Forming',
  pending_review: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const TABS = [
  { key: 'pending', label: 'Pending applications' },
  { key: 'roster', label: 'Approved teams' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'stats', label: 'Stats' },
];

export function DivisionDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const divisionId = route.params?.id;
  const division = useMemo(() => divisionById(divisionId), [divisionId]);
  const season = useMemo(
    () => (division ? seasonById(division.seasonId) : undefined),
    [division],
  );
  const league = useMemo(
    () => (division ? leagueById(division.leagueId) : undefined),
    [division],
  );
  const org = useMemo(
    () => (division ? organizationById(division.organizationId) : undefined),
    [division],
  );
  const teams = useMemo(
    () => (division ? teamsByDivision(division.id) : []),
    [division],
  );
  const games = useMemo(
    () => (division ? gamesForDivision(division.id) : []),
    [division],
  );
  const [tab, setTab] = useState('pending');

  if (!division || !season || !league || !org) {
    return (
      <PageScroll>
        <PageHeader title="Division not found" />
      </PageScroll>
    );
  }

  const pendingTeams = teams.filter((t) => t.status === 'pending_review');
  const approvedTeams = teams.filter((t) => t.status === 'approved');

  const inner = (
    <PageScroll>
      <PageHeader
        title={`${league.name} · ${division.name}`}
        subtitle={`${season.label} · Registration ${formatDate(division.registrationOpensIso)} – ${formatDate(division.registrationClosesIso)}`}
        crumbs={[
          { label: 'Competition' },
          { label: 'Leagues', route: 'Leagues' },
          { label: league.name, route: 'LeagueDetail' },
          { label: season.label, route: 'SeasonDetail' },
          { label: division.name },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <View style={[styles.headerTrail, { gap: spacing.sm }]}>
            <SkillLevelPill level={division.skillLevel} />
            <Tag
              size="sm"
              tone={STATUS_TONE[division.status]}
              label={STATUS_LABEL[division.status]}
              leadingDot
            />
            <Button
              size="sm"
              variant="outline"
              label="Edit division"
              onPress={() =>
                navigation.navigate('DivisionForm', { id: division.id })
              }
            />
          </View>
        }
      />

      <View style={[styles.statRow, { gap: spacing.md }]}>
        <StatCard
          label="Teams"
          value={`${division.registeredTeams} / ${division.maxTeams}`}
          tone="brand"
        />
        <StatCard
          label="Pending applications"
          value={String(pendingTeams.length)}
          tone="warning"
          urgent={pendingTeams.length > 0}
        />
        <StatCard
          label="Registration fee"
          value={formatCurrency(division.registrationFeeCents)}
          tone="neutral"
        />
        <StatCard
          label="Games scheduled"
          value={String(games.length)}
          tone="success"
        />
      </View>

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'pending' ? (
        <Card padded>
          <Text variant="h3">Pending applications</Text>
          {pendingTeams.length === 0 ? (
            <Text variant="body" color={colors.text.secondary}>
              No applications waiting for review.
            </Text>
          ) : (
            pendingTeams.map((t: Team) => (
              <View key={t.id} style={[styles.teamRow, { gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodySm" weight="600">
                    {t.name}
                  </Text>
                  <View style={[styles.metaRow, { gap: spacing.xs }]}>
                    <Tag size="sm" tone="neutral" label={`${t.rosterSize} on roster`} />
                    <Tag
                      size="sm"
                      tone={TEAM_STATUS_TONE[t.status]}
                      label={TEAM_STATUS_LABEL[t.status]}
                      leadingDot
                    />
                  </View>
                </View>
                <Button
                  size="sm"
                  variant="ghost"
                  label="View"
                  onPress={() =>
                    navigation.navigate('TeamDetail', { id: t.id })
                  }
                />
                <Button
                  size="sm"
                  variant="solid"
                  label="Approve"
                  onPress={() => undefined}
                />
              </View>
            ))
          )}
        </Card>
      ) : null}

      {tab === 'roster' ? (
        <Card padded>
          <Text variant="h3">Approved teams</Text>
          {approvedTeams.length === 0 ? (
            <Text variant="body" color={colors.text.secondary}>
              No approved teams yet.
            </Text>
          ) : (
            approvedTeams.map((t) => (
              <View key={t.id} style={[styles.teamRow, { gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodySm" weight="600">
                    {t.name}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    Captain · player {t.captainPlayerId}
                  </Text>
                </View>
                <Tag size="sm" tone="success" label="Approved" leadingDot />
                <Button
                  size="sm"
                  variant="ghost"
                  label="Open"
                  onPress={() =>
                    navigation.navigate('TeamDetail', { id: t.id })
                  }
                />
              </View>
            ))
          )}
        </Card>
      ) : null}

      {tab === 'schedule' ? (
        <Card padded>
          <Text variant="h3">Schedule</Text>
          <Text variant="body" color={colors.text.secondary}>
            {games.length} game{games.length === 1 ? '' : 's'} scheduled in
            this division.
          </Text>
          <Button
            size="sm"
            variant="solid"
            label="Open schedule"
            onPress={() => navigation.navigate('Schedule')}
          />
        </Card>
      ) : null}

      {tab === 'stats' ? (
        <Card padded>
          <Text variant="h3">Stats</Text>
          <Text variant="body" color={colors.text.secondary}>
            Per-sport stat templates drive the entry form. Sport: {league.sport}.
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
    flexWrap: 'wrap',
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  teamRow: {
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
