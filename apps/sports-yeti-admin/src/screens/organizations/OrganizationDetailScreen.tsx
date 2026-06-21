import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { OrgAvatar, SocialChannelChip } from '@sports-yeti/ui';
import {
  organizationById,
  leaguesByOrg,
  facilitiesByOrg,
  activeSeasonsForOrg,
  publishedArticlesForOrg,
  type SocialChannel,
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
import { formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'leagues', label: 'Leagues' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'social', label: 'Social' },
  { key: 'news', label: 'News' },
];

export function OrganizationDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const orgId = route.params?.id;
  const org = useMemo(() => organizationById(orgId), [orgId]);
  const [tab, setTab] = useState('overview');

  if (!org) {
    return (
      <PageScroll>
        <PageHeader title="Organization not found" />
      </PageScroll>
    );
  }

  const leagues = leaguesByOrg(org.id);
  const facilities = facilitiesByOrg(org.id);
  const seasons = activeSeasonsForOrg(org.id);
  const news = publishedArticlesForOrg(org.id);

  return (
    <OrgBrandingProvider org={org}>
      <PageScroll>
        <PageHeader
          title={org.name}
          subtitle={`${org.city}, ${org.state} · ${org.slug}`}
          meta={`Created ${formatDate(org.createdAtIso)}`}
          crumbs={[
            { label: 'Workspace' },
            { label: 'Organizations', route: 'Organizations' },
            { label: org.name },
          ]}
          onNavigate={(r) => navigation.navigate(r)}
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
                label="Edit"
                onPress={() => undefined}
              />
            </View>
          }
        />

        <View style={[styles.statRow, { gap: spacing.md }]}>
          <StatCard
            label="Leagues"
            value={String(leagues.length)}
            tone="brand"
          />
          <StatCard
            label="Facilities"
            value={String(facilities.length)}
            tone="neutral"
          />
          <StatCard
            label="Active seasons"
            value={String(seasons.length)}
            tone="success"
          />
          <StatCard
            label="Published news"
            value={String(news.length)}
            tone="alpine"
          />
        </View>

        <Tabs items={TABS} value={tab} onChange={setTab} />

        {tab === 'overview' ? (
          <Card padded>
            <Text variant="h3">About</Text>
            <Text variant="body" color={colors.text.secondary}>
              {org.name} runs {leagues.length} league
              {leagues.length === 1 ? '' : 's'} across {facilities.length}{' '}
              facility{facilities.length === 1 ? '' : 'ies'} in {org.city}.
            </Text>
            <View style={[styles.brandRow, { gap: spacing.md }]}>
              <View
                style={[
                  styles.brandSwatch,
                  { backgroundColor: org.brandColor },
                ]}
              />
              <Text variant="bodySm" color={colors.text.primary}>
                Brand · {org.brandColor}
              </Text>
              {org.brandColorAccent ? (
                <>
                  <View
                    style={[
                      styles.brandSwatch,
                      { backgroundColor: org.brandColorAccent },
                    ]}
                  />
                  <Text variant="bodySm" color={colors.text.primary}>
                    Accent · {org.brandColorAccent}
                  </Text>
                </>
              ) : null}
            </View>
          </Card>
        ) : null}

        {tab === 'leagues' ? (
          <Card padded>
            <Text variant="h3">Leagues</Text>
            {leagues.map((l) => (
              <View key={l.id} style={[styles.leagueRow, { gap: spacing.sm }]}>
                <Text variant="bodySm" weight="600">
                  {l.name}
                </Text>
                <Tag size="sm" tone="info" label={l.sportTagline} />
                <Button
                  size="sm"
                  variant="ghost"
                  label="Open"
                  onPress={() =>
                    navigation.navigate('LeagueDetail', { id: l.id })
                  }
                />
              </View>
            ))}
          </Card>
        ) : null}

        {tab === 'facilities' ? (
          <Card padded>
            <Text variant="h3">Facilities</Text>
            {facilities.map((f) => (
              <View key={f.id} style={[styles.leagueRow, { gap: spacing.sm }]}>
                <Text variant="bodySm" weight="600">
                  {f.name}
                </Text>
                <Tag
                  size="sm"
                  tone="neutral"
                  label={`${f.city}, ${f.state}`}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  label="Open"
                  onPress={() =>
                    navigation.navigate('FacilityDetail', { id: f.id })
                  }
                />
              </View>
            ))}
          </Card>
        ) : null}

        {tab === 'social' ? (
          <Card padded>
            <Text variant="h3">Connected channels</Text>
            <View style={[styles.channelRow, { gap: spacing.sm }]}>
              {(
                ['x', 'facebook', 'instagram', 'linkedin'] as SocialChannel[]
              ).map((ch) => (
                <SocialChannelChip
                  key={ch}
                  channel={ch}
                  status={
                    org.socialIntegrationStatus[ch] ?? 'disconnected'
                  }
                />
              ))}
            </View>
          </Card>
        ) : null}

        {tab === 'news' ? (
          <Card padded>
            <Text variant="h3">Recent news</Text>
            {news.map((n) => (
              <View key={n.id} style={[styles.leagueRow, { gap: spacing.sm }]}>
                <Text variant="bodySm" weight="600">
                  {n.title}
                </Text>
                <Tag size="sm" tone="success" label="Published" />
                {n.publishedAtIso ? (
                  <Text variant="caption" color={colors.text.muted}>
                    {formatDate(n.publishedAtIso)}
                  </Text>
                ) : null}
              </View>
            ))}
          </Card>
        ) : null}
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  brandSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  channelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
});
