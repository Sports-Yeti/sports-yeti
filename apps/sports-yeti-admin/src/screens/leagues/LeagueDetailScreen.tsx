import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { CalendarDays, Edit3, Plus } from 'lucide-react-native';
import { OrgAvatar, SeasonPill } from '@sports-yeti/ui';
import {
  divisionsForSeason,
  leagueById,
  organizationById,
  seasonsByLeague,
  type SeasonStatus,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Tabs, Tag, Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, spacing } from '../../theme';
import { formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

const TABS = [
  { key: 'seasons', label: 'Seasons' },
  { key: 'about', label: 'About' },
  { key: 'rules', label: 'Rules' },
];

const STATUS_LABEL: Record<SeasonStatus, string> = {
  draft: 'Draft',
  registration_open: 'Registration open',
  in_progress: 'In progress',
  completed: 'Completed',
  archived: 'Archived',
};

const STATUS_TONE: Record<SeasonStatus, 'success' | 'warning' | 'neutral'> = {
  draft: 'warning',
  registration_open: 'success',
  in_progress: 'success',
  completed: 'neutral',
  archived: 'neutral',
};

export function LeagueDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const league = useMemo(() => leagueById(route.params.id), [route.params.id]);
  const org = useMemo(
    () => (league ? organizationById(league.organizationId) : undefined),
    [league],
  );
  const seasons = useMemo(
    () => (league ? seasonsByLeague(league.id) : []),
    [league],
  );
  const [tab, setTab] = useState('seasons');

  if (!league || !org) {
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

  const inner = (
    <PageScroll>
      <PageHeader
        title={league.name}
        subtitle={`${league.sportTagline} · ${league.city}`}
        crumbs={[
          { label: 'Competition' },
          { label: 'Leagues', route: 'Leagues' },
          { label: league.name },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <View style={[styles.headerTrail, { gap: spacing.sm }]}>
            <OrgAvatar
              name={org.name}
              logoUrl={org.logoUrl}
              brandColor={org.brandColor}
              size="md"
            />
            <Button
              size="sm"
              variant="outline"
              label="Edit league"
              leadingIcon={
                <Edit3 size={14} color={colors.text.primary} strokeWidth={2.4} />
              }
              onPress={() =>
                navigation.navigate('LeagueForm', { id: league.id })
              }
            />
          </View>
        }
      />

      <View style={[styles.statRow, { gap: spacing.md }]}>
        <StatCard
          label="Seasons"
          value={String(seasons.length)}
          tone="brand"
        />
        <StatCard
          label="Active divisions"
          value={String(
            seasons
              .filter(
                (s) =>
                  s.status === 'registration_open' ||
                  s.status === 'in_progress',
              )
              .reduce((sum, s) => sum + divisionsForSeason(s.id).length, 0),
          )}
          tone="success"
        />
        <StatCard
          label="Sport"
          value={league.sport.replace('_', ' ')}
          tone="alpine"
        />
        <StatCard
          label="Organization"
          value={org.name}
          tone="neutral"
          onPress={() =>
            navigation.navigate('OrganizationDetail', { id: org.id })
          }
        />
      </View>

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'seasons' ? (
        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <Text variant="h3">Seasons</Text>
            <Button
              size="sm"
              variant="solid"
              label="New season"
              leadingIcon={
                <Plus size={14} color={colors.text.inverse} strokeWidth={2.4} />
              }
              onPress={() => navigation.navigate('SeasonForm')}
            />
          </View>
          {seasons.length === 0 ? (
            <View style={[styles.emptyBlock, { gap: spacing.sm }]}>
              <CalendarDays size={28} color={colors.text.muted} />
              <Text variant="body" color={colors.text.secondary}>
                No seasons yet. Add one to start scheduling games.
              </Text>
            </View>
          ) : (
            seasons.map((s) => {
              const divCount = divisionsForSeason(s.id).length;
              return (
                <View key={s.id} style={[styles.seasonRow, { gap: spacing.sm }]}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text variant="bodySm" weight="600">
                      {s.label}
                    </Text>
                    <View style={[styles.metaRow, { gap: spacing.xs }]}>
                      <SeasonPill cycle={s.cycle} year={s.year} />
                      <Tag
                        size="sm"
                        tone={STATUS_TONE[s.status]}
                        label={STATUS_LABEL[s.status]}
                        leadingDot
                      />
                      <Text variant="caption" color={colors.text.muted}>
                        {formatDate(s.startIso)} – {formatDate(s.endIso)}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodySm" color={colors.text.primary}>
                    {divCount} division{divCount === 1 ? '' : 's'}
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    label="Open"
                    onPress={() =>
                      navigation.navigate('SeasonDetail', { id: s.id })
                    }
                  />
                </View>
              );
            })
          )}
        </Card>
      ) : null}

      {tab === 'about' ? (
        <Card padded>
          <Text variant="h3">About</Text>
          <Text variant="body" color={colors.text.secondary}>
            {league.description}
          </Text>
        </Card>
      ) : null}

      {tab === 'rules' ? (
        <Card padded>
          <Text variant="h3">Rules</Text>
          {league.rulesUrl ? (
            <Text variant="body" color={colors.brand.primary}>
              {league.rulesUrl}
            </Text>
          ) : (
            <Text variant="body" color={colors.text.secondary}>
              No rules document attached. Edit the league to add one.
            </Text>
          )}
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
  seasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  emptyBlock: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
