import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Download } from 'lucide-react-native';
import { SeasonPill, Tag } from '@sports-yeti/ui';
import {
  bookingsForSpace,
  buildOrgTree,
  DEMO_ORG_ID,
  facilitiesByOrg,
  organizationById,
  spacesByFacility,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Text, useToast } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, spacing } from '../../theme';
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

export function OrgMoneyScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const org = useMemo(() => organizationById(DEMO_ORG_ID), []);
  const tree = useMemo(() => buildOrgTree(DEMO_ORG_ID), []);

  // Mock revenue: sum of registration fees × registered teams + external rentals
  const revenueByLeague = useMemo(() => {
    if (!tree) return [];
    return tree.leagues.map(({ league, seasons }) => {
      const totals = seasons.flatMap((s) =>
        s.divisions.map((d) => ({
          season: s.season,
          division: d,
          revenueCents: d.registrationFeeCents * d.registeredTeams,
        })),
      );
      const grossCents = totals.reduce((sum, t) => sum + t.revenueCents, 0);
      const platformFeeCents = Math.round(grossCents * 0.05);
      const netCents = grossCents - platformFeeCents;
      return { league, totals, grossCents, platformFeeCents, netCents };
    });
  }, [tree]);

  const externalRevenueCents = useMemo(() => {
    return facilitiesByOrg(DEMO_ORG_ID)
      .flatMap((f) => spacesByFacility(f.id).flatMap((s) => bookingsForSpace(s.id)))
      .filter((b) => b.kind === 'external_rental' && b.status === 'approved')
      .reduce((sum, b) => sum + b.amountCents, 0);
  }, []);

  const totalGross = revenueByLeague.reduce(
    (sum, l) => sum + l.grossCents,
    0,
  );
  const totalPlatform = revenueByLeague.reduce(
    (sum, l) => sum + l.platformFeeCents,
    0,
  );
  const totalNet = revenueByLeague.reduce((sum, l) => sum + l.netCents, 0);
  const outstandingCents = Math.round(totalGross * 0.12); // mock 12% outstanding

  if (!org) {
    return (
      <PageScroll>
        <PageHeader title="Org not found" />
      </PageScroll>
    );
  }

  return (
    <OrgBrandingProvider org={org}>
      <PageScroll>
        <PageHeader
          variant="flatHero"
          eyebrow="ORG ADMIN · MONEY"
          title="Money"
          subtitle="Gross, platform fees, net, and outstanding by league × season. Plus external rental revenue."
          crumbs={[
            { label: 'Organization' },
            { label: org.name, route: 'OrganizationDetail' },
            { label: 'Money' },
          ]}
          onNavigate={(r) => navigation.navigate(r)}
          trailing={
            <Button
              size="sm"
              variant="outline"
              label="Export CSV"
              leadingIcon={
                <Download size={14} color={colors.text.primary} strokeWidth={2.4} />
              }
              onPress={() =>
                toast.show({
                  variant: 'info',
                  title: 'CSV export queued (mock)',
                  description: 'You\u2019ll get an email when it\u2019s ready.',
                })
              }
            />
          }
        />

        <View style={[styles.statRow, { gap: spacing.md }]}>
          <StatCard
            label="Gross"
            value={formatCurrency(totalGross)}
            tone="brand"
          />
          <StatCard
            label="Platform fee"
            value={formatCurrency(totalPlatform)}
            tone="warning"
          />
          <StatCard
            label="Net"
            value={formatCurrency(totalNet)}
            tone="success"
          />
          <StatCard
            label="Outstanding (mock)"
            value={formatCurrency(outstandingCents)}
            tone="alpine"
            urgent={outstandingCents > 0}
          />
        </View>

        <View style={[styles.statRow, { gap: spacing.md }]}>
          <StatCard
            label="External rental revenue"
            value={formatCurrency(externalRevenueCents)}
            tone="success"
          />
        </View>

        {revenueByLeague.map(({ league, totals, grossCents, netCents }) => (
          <Card key={league.id} padded>
            <View style={[styles.cardHead, { gap: spacing.sm }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="h3">{league.name}</Text>
                <Text variant="caption" color={colors.text.muted}>
                  Gross {formatCurrency(grossCents)} · Net{' '}
                  {formatCurrency(netCents)}
                </Text>
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
            {totals.map((t) => (
              <View key={t.division.id} style={[styles.row, { gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodySm" weight="600">
                    {t.division.name}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {t.division.registeredTeams} teams ·{' '}
                    {formatCurrency(t.division.registrationFeeCents)} per team
                  </Text>
                </View>
                <SeasonPill cycle={t.season.cycle} year={t.season.year} />
                <Tag
                  size="sm"
                  tone="brand"
                  label={formatCurrency(t.revenueCents)}
                />
              </View>
            ))}
          </Card>
        ))}
      </PageScroll>
    </OrgBrandingProvider>
  );
}

const styles = StyleSheet.create({
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
});
