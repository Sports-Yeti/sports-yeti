import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  CalendarRange,
  Edit3,
  Trophy,
  Users,
  Wallet,
  Wand2,
} from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { leagueById } from '../../mocks/leagues';
import { teamsByLeague } from '../../mocks/teams';
import { formatCurrency, formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

export function LeagueDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const league = leagueById(route.params.id);

  if (!league) {
    return (
      <PageScroll>
        <PageHeader
          title="League not found"
          crumbs={[{ label: 'Leagues', route: 'Leagues' }, { label: '—' }]}
          onNavigate={(r) => navigation.navigate(r)}
        />
        <EmptyState
          title="League not found"
          description="It may have been deleted or the link is stale."
          primaryAction={{
            label: 'Back to leagues',
            onPress: () => navigation.navigate('Leagues'),
          }}
        />
      </PageScroll>
    );
  }

  const teams = teamsByLeague(league.id);
  const collected = teams.reduce((acc, t) => acc + t.feeCollectedCents, 0);

  return (
    <PageScroll>
      <PageHeader
        title={league.name}
        subtitle={`${league.sportLabel} · ${league.city}`}
        crumbs={[{ label: 'Leagues', route: 'Leagues' }, { label: league.name }]}
        onNavigate={(r) => navigation.navigate(r)}
        meta={`${league.seasonName} · registration closes ${formatDate(league.registrationCloseIso)}`}
        trailing={
          <>
            <Button
              label="Edit"
              variant="ghost"
              size="sm"
              leadingIcon={<Edit3 size={14} color={colors.brand.primary} strokeWidth={2.25} />}
              onPress={() => navigation.navigate('LeagueForm', { id: league.id })}
            />
            <Button
              label="Open schedule"
              variant="solid"
              size="sm"
              onPress={() => navigation.navigate('Schedule')}
            />
          </>
        }
      />

      <View style={styles.statsRow}>
        <StatCard
          label="Teams"
          value={`${league.registeredTeams} / ${league.maxTeams}`}
          helper={`${league.maxTeams - league.registeredTeams} spots open`}
          tone="brand"
          icon={<Users size={14} color={colors.brand.deep} strokeWidth={2.25} />}
        />
        <StatCard
          label="Players"
          value={String(league.registeredPlayers)}
          helper="across active rosters"
          tone="success"
          icon={<Trophy size={14} color={colors.status.success} strokeWidth={2.25} />}
        />
        <StatCard
          label="Registration fee"
          value={league.feeCents === 0 ? 'Free' : formatCurrency(league.feeCents)}
          helper="per team"
          tone="brand"
          icon={<Wallet size={14} color={colors.brand.deep} strokeWidth={2.25} />}
        />
        <StatCard
          label="Fees collected"
          value={formatCurrency(collected)}
          helper={`of ${formatCurrency(league.feeCents * teams.length)} expected`}
          tone="success"
          icon={<Wallet size={14} color={colors.status.success} strokeWidth={2.25} />}
        />
      </View>

      <View style={styles.twoCol}>
        <Card style={styles.col}>
          <Text variant="h3" color={colors.text.primary}>
            About this league
          </Text>
          <Text variant="body" color={colors.text.primary}>
            {league.description}
          </Text>
          <View style={styles.metaGrid}>
            <View style={styles.metaCell}>
              <Text variant="caption" color={colors.text.muted}>
                FORMAT
              </Text>
              <Text variant="bodySm" color={colors.text.primary}>
                {league.formatLabel}
              </Text>
            </View>
            <View style={styles.metaCell}>
              <Text variant="caption" color={colors.text.muted}>
                STATUS
              </Text>
              <Tag size="sm" tone={league.status === 'published' ? 'success' : 'warning'} label={league.status} leadingDot />
            </View>
            <View style={styles.metaCell}>
              <Text variant="caption" color={colors.text.muted}>
                SEASON
              </Text>
              <Text variant="bodySm" color={colors.text.primary}>
                {formatDate(league.seasonStartIso)} – {formatDate(league.seasonEndIso)}
              </Text>
            </View>
            <View style={styles.metaCell}>
              <Text variant="caption" color={colors.text.muted}>
                REGISTRATION CLOSES
              </Text>
              <Text variant="bodySm" color={colors.text.primary}>
                {formatDate(league.registrationCloseIso)}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.col}>
          <View style={styles.cardHead}>
            <Text variant="h3" color={colors.text.primary}>
              Teams ({teams.length})
            </Text>
            <Button
              label="View all teams"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('Teams')}
            />
          </View>
          {teams.length === 0 ? (
            <Text variant="bodySm" color={colors.text.muted}>
              No teams have registered yet.
            </Text>
          ) : (
            teams.map((t) => (
              <View key={t.id} style={styles.teamRow}>
                <View style={styles.teamRowBody}>
                  <Text variant="bodySm" color={colors.text.primary} weight="600">
                    {t.name}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {t.roster.length} on roster · {t.wins}-{t.losses}-{t.ties}
                  </Text>
                </View>
                <Tag
                  size="sm"
                  tone={t.status === 'pending' ? 'warning' : 'success'}
                  label={t.status === 'pending' ? 'Pending' : 'Active'}
                />
                <Button
                  label="Open"
                  variant="ghost"
                  size="sm"
                  onPress={() => navigation.navigate('TeamDetail', { id: t.id })}
                />
              </View>
            ))
          )}
        </Card>
      </View>

      <Card>
        <View style={styles.cardHead}>
          <Text variant="h3" color={colors.text.primary}>
            Schedule
          </Text>
          <View style={styles.cardActions}>
            <Button
              label="Generate fixtures"
              variant="solid"
              size="sm"
              leadingIcon={
                <Wand2 size={14} color={colors.text.inverse} strokeWidth={2.25} />
              }
              onPress={() =>
                navigation.navigate('FixtureGenerator', { id: league.id })
              }
            />
            <Button
              label="Open calendar"
              variant="ghost"
              size="sm"
              leadingIcon={
                <CalendarRange size={14} color={colors.brand.primary} strokeWidth={2.25} />
              }
              onPress={() => navigation.navigate('Schedule')}
            />
          </View>
        </View>
        <Text variant="bodySm" color={colors.text.muted}>
          Generate an entire round-robin or playoff bracket in one pass, or
          create matches one-off from the Schedule. Match scores flow back into
          standings automatically.
        </Text>
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  col: {
    flex: 1,
    minWidth: 320,
    gap: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  metaCell: {
    minWidth: 140,
    gap: 2,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  teamRowBody: {
    flex: 1,
    gap: 2,
  },
});
