import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  leagueById,
  organizationById,
  tournamentById,
  type TournamentStatus,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Tag, Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
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

export function TournamentDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const tournamentId = route.params?.id;
  const tournament = useMemo(
    () => tournamentById(tournamentId),
    [tournamentId],
  );
  const league = useMemo(
    () => (tournament ? leagueById(tournament.leagueId) : undefined),
    [tournament],
  );
  const org = useMemo(
    () => (tournament ? organizationById(tournament.organizationId) : undefined),
    [tournament],
  );

  if (!tournament || !league || !org) {
    return (
      <PageScroll>
        <PageHeader title="Tournament not found" />
      </PageScroll>
    );
  }

  const spotsLeft = Math.max(tournament.maxTeams - tournament.registeredTeams, 0);

  const inner = (
    <PageScroll>
      <PageHeader
        title={`${league.name} · ${tournament.name}`}
        subtitle={`${league.sportTagline} · ${formatDate(tournament.startIso)} – ${formatDate(tournament.endIso)}`}
        crumbs={[
          { label: 'Competition' },
          { label: 'Tournaments', route: 'Tournaments' },
          { label: tournament.name },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <View style={[styles.headerTrail, { gap: spacing.sm }]}>
            <Tag
              size="sm"
              tone={STATUS_TONE[tournament.status]}
              label={STATUS_LABEL[tournament.status]}
              leadingDot
            />
            <Button
              size="sm"
              variant="outline"
              label="Edit tournament"
              onPress={() =>
                navigation.navigate('TournamentForm', { id: tournament.id })
              }
            />
          </View>
        }
      />

      <View style={[styles.statRow, { gap: spacing.md }]}>
        <StatCard
          label="Teams registered"
          value={`${tournament.registeredTeams} / ${tournament.maxTeams}`}
          tone="brand"
        />
        <StatCard label="Spots left" value={String(spotsLeft)} tone="success" />
        <StatCard
          label="Format"
          value={tournament.format.replace(/_/g, ' ')}
          tone="alpine"
        />
        <StatCard
          label="Entry fee"
          value={tournament.feeCents === 0 ? 'Free' : formatCurrency(tournament.feeCents)}
          tone="neutral"
        />
      </View>

      <Card padded>
        <Text variant="h3">Details</Text>
        <View style={[styles.detailRow, { gap: spacing.sm }]}>
          <Text variant="bodySm" color={colors.text.muted}>
            Venue
          </Text>
          <Text variant="bodySm" color={colors.text.primary}>
            {tournament.venue} · {tournament.city}
          </Text>
        </View>
        <View style={[styles.detailRow, { gap: spacing.sm }]}>
          <Text variant="bodySm" color={colors.text.muted}>
            Registration closes
          </Text>
          <Text variant="bodySm" color={colors.text.primary}>
            {formatDate(tournament.registrationClosesIso)}
          </Text>
        </View>
        <View style={[styles.detailRow, { gap: spacing.sm }]}>
          <Text variant="bodySm" color={colors.text.muted}>
            Dates
          </Text>
          <Text variant="bodySm" color={colors.text.primary}>
            {formatDate(tournament.startIso)} – {formatDate(tournament.endIso)}
          </Text>
        </View>
        <Text variant="body" color={colors.text.secondary} style={styles.description}>
          {tournament.description}
        </Text>
      </Card>

      <Card padded>
        <Text variant="h3">Registered teams</Text>
        <Text variant="body" color={colors.text.secondary}>
          {tournament.registeredTeams === 0
            ? 'No teams have registered yet.'
            : `${tournament.registeredTeams} team${tournament.registeredTeams === 1 ? '' : 's'} registered so far. Team management arrives with the live bracket.`}
        </Text>
      </Card>
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  description: {
    marginTop: spacing.sm,
  },
});
