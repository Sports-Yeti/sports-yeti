import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OrgAvatar, SeasonPill, Tag } from '@sports-yeti/ui';
import {
  buildOrgTree,
  DEMO_ORG_ID,
  facilitiesByOrg,
  pendingExternalRentals,
  pendingTeams,
  publishedArticlesForOrg,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

export function OrgPulseScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const tree = useMemo(() => buildOrgTree(DEMO_ORG_ID), []);
  const facilities = useMemo(() => facilitiesByOrg(DEMO_ORG_ID), []);
  const pending = useMemo(() => pendingTeams(), []);
  const rentals = useMemo(() => pendingExternalRentals(), []);
  const news = useMemo(() => publishedArticlesForOrg(DEMO_ORG_ID), []);

  if (!tree) {
    return (
      <PageScroll>
        <PageHeader title="Org not found" />
      </PageScroll>
    );
  }

  const { org, leagues } = tree;
  const totalSeasons = leagues.reduce(
    (sum, l) => sum + l.seasons.length,
    0,
  );
  const totalDivisions = leagues.reduce(
    (sum, l) => sum + l.seasons.reduce((s, ss) => s + ss.divisions.length, 0),
    0,
  );

  return (
    <OrgBrandingProvider org={org}>
      <PageScroll>
        <PageHeader
          variant="hero"
          eyebrow="ORG ADMIN"
          title={`${org.name} pulse`}
          subtitle="Cross-league + cross-facility view of what needs attention right now."
          meta={`${leagues.length} leagues · ${totalSeasons} seasons · ${totalDivisions} divisions`}
          trailing={
            <View style={[styles.headerTrail, { gap: spacing.sm }]}>
              <OrgAvatar
                name={org.name}
                logoUrl={org.logoUrl}
                brandColor={org.brandColor}
                size="lg"
              />
              <Button
                size="sm"
                variant="outline"
                label="Edit branding"
                onPress={() =>
                  navigation.navigate('OrgBranding', { id: org.id })
                }
              />
            </View>
          }
        />

        <View style={[styles.statRow, { gap: spacing.md }]}>
          <StatCard
            label="Pending team apps"
            value={String(pending.length)}
            tone="warning"
            urgent={pending.length > 0}
            onPress={() => navigation.navigate('Approvals')}
          />
          <StatCard
            label="Pending rentals"
            value={String(rentals.length)}
            tone="warning"
            urgent={rentals.length > 0}
            onPress={() => navigation.navigate('Approvals')}
          />
          <StatCard
            label="Active divisions"
            value={String(totalDivisions)}
            tone="brand"
          />
          <StatCard
            label="Facilities"
            value={String(facilities.length)}
            tone="success"
            onPress={() => navigation.navigate('Facilities')}
          />
        </View>

        <Card padded>
          <Text variant="h3">Leagues at a glance</Text>
          {leagues.map(({ league, seasons }) => {
            const active = seasons.filter(
              (s) =>
                s.season.status === 'in_progress' ||
                s.season.status === 'registration_open',
            );
            return (
              <View key={league.id} style={[styles.row, { gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodySm" weight="600">
                    {league.name}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {league.sportTagline} · {seasons.length} seasons
                  </Text>
                </View>
                <View style={[styles.metaRow, { gap: spacing.xs }]}>
                  {active.map(({ season }) => (
                    <SeasonPill
                      key={season.id}
                      cycle={season.cycle}
                      year={season.year}
                    />
                  ))}
                </View>
                <Button
                  size="sm"
                  variant="ghost"
                  label="Open"
                  onPress={() =>
                    navigation.navigate('LeagueDetail', { id: league.id })
                  }
                />
              </View>
            );
          })}
        </Card>

        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="h3">Recent news</Text>
              <Text variant="caption" color={colors.text.muted}>
                Cross-posted to your social channels.
              </Text>
            </View>
            <Button
              size="sm"
              variant="solid"
              label="Compose"
              onPress={() => navigation.navigate('NewsComposer')}
            />
          </View>
          {news.slice(0, 3).map((n) => (
            <View key={n.id} style={[styles.row, { gap: spacing.sm }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodySm" weight="600">
                  {n.title}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {n.publishedAtIso ? new Date(n.publishedAtIso).toLocaleDateString() : '—'}
                </Text>
              </View>
              <Tag size="sm" tone="success" label="Published" leadingDot />
            </View>
          ))}
        </Card>
      </PageScroll>
    </OrgBrandingProvider>
  );
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});
