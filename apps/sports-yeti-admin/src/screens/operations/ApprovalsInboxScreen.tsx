import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check, Inbox, Square } from 'lucide-react-native';
import { SkillLevelPill } from '@sports-yeti/ui';
import {
  divisionById,
  leagueById,
  pendingExternalRentals,
  pendingTeams,
  seasonById,
  spaceById,
  facilityById,
  type Booking,
  type Team,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Tabs, Tag, Text } from '../../ui';
import { colors, spacing } from '../../theme';
import { formatCurrency, formatRange, formatRelative } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const TABS = [
  { key: 'teams', label: 'Team applications' },
  { key: 'rentals', label: 'External rentals' },
];

export function ApprovalsInboxScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const teams = useMemo(() => pendingTeams(), []);
  const rentals = useMemo(() => pendingExternalRentals(), []);
  const [tab, setTab] = useState<'teams' | 'rentals'>('teams');
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelectedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <PageScroll>
      <PageHeader
        title="Approvals"
        subtitle="Pending team applications and external facility rental requests in one inbox."
        crumbs={[{ label: 'Operations' }, { label: 'Approvals' }]}
        onNavigate={(r) => navigation.navigate(r)}
      />

      <Tabs
        items={TABS.map((t) => ({
          ...t,
          badge:
            t.key === 'teams'
              ? String(teams.length)
              : String(rentals.length),
        }))}
        value={tab}
        onChange={(k) => setTab(k as 'teams' | 'rentals')}
      />

      {tab === 'teams' ? (
        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <Text variant="h3">{teams.length} pending application{teams.length === 1 ? '' : 's'}</Text>
            {selectedTeams.size > 0 ? (
              <View style={[styles.bulkRow, { gap: spacing.sm }]}>
                <Text variant="bodySm" color={colors.text.secondary}>
                  {selectedTeams.size} selected
                </Text>
                <Button
                  size="sm"
                  variant="solid"
                  label="Approve all"
                  onPress={() => setSelectedTeams(new Set())}
                />
                <Button
                  size="sm"
                  variant="outline"
                  label="Reject all"
                  onPress={() => setSelectedTeams(new Set())}
                />
              </View>
            ) : null}
          </View>
          {teams.length === 0 ? (
            <View style={[styles.emptyBlock, { gap: spacing.sm }]}>
              <Inbox size={28} color={colors.text.muted} />
              <Text variant="body" color={colors.text.secondary}>
                No applications waiting. Nice work.
              </Text>
            </View>
          ) : (
            teams.map((t: Team) => {
              const division = t.divisionId
                ? divisionById(t.divisionId)
                : undefined;
              const season = division
                ? seasonById(division.seasonId)
                : undefined;
              const league = division
                ? leagueById(division.leagueId)
                : undefined;
              const checked = selectedTeams.has(t.id);
              return (
                <View key={t.id} style={[styles.row, { gap: spacing.sm }]}>
                  <Button
                    size="sm"
                    variant={checked ? 'solid' : 'outline'}
                    label=""
                    leadingIcon={
                      checked ? (
                        <Check size={14} color={colors.text.inverse} strokeWidth={2.75} />
                      ) : (
                        <Square size={14} color={colors.text.muted} strokeWidth={2.25} />
                      )
                    }
                    accessibilityLabel={`${checked ? 'Deselect' : 'Select'} ${t.name}`}
                    onPress={() => toggleSelect(t.id)}
                  />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text variant="bodySm" weight="600">
                      {t.name}
                    </Text>
                    <View style={[styles.metaRow, { gap: spacing.xs }]}>
                      {league ? (
                        <Tag size="sm" tone="info" label={league.name} />
                      ) : null}
                      {season ? (
                        <Tag size="sm" tone="neutral" label={season.label} />
                      ) : null}
                      {division ? (
                        <SkillLevelPill level={division.skillLevel} />
                      ) : null}
                      <Tag
                        size="sm"
                        tone="neutral"
                        label={`${t.rosterSize} on roster`}
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
              );
            })
          )}
        </Card>
      ) : null}

      {tab === 'rentals' ? (
        <Card padded>
          <Text variant="h3">{rentals.length} external rental request{rentals.length === 1 ? '' : 's'}</Text>
          {rentals.length === 0 ? (
            <View style={[styles.emptyBlock, { gap: spacing.sm }]}>
              <Inbox size={28} color={colors.text.muted} />
              <Text variant="body" color={colors.text.secondary}>
                No rental requests waiting.
              </Text>
            </View>
          ) : (
            rentals.map((b: Booking) => {
              const space = spaceById(b.spaceId);
              const facility = space
                ? facilityById(space.facilityId)
                : undefined;
              return (
                <View key={b.id} style={[styles.row, { gap: spacing.sm }]}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text variant="bodySm" weight="600">
                      {b.externalRenter?.organizationName ?? 'Unknown renter'}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {facility?.name ?? '—'} · {space?.name ?? '—'} ·{' '}
                      {formatRange(b.startIso, b.endIso)}
                    </Text>
                    {b.externalRenter?.intendedUse ? (
                      <Text variant="caption" color={colors.text.muted}>
                        “{b.externalRenter.intendedUse}”
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text variant="bodySm" color={colors.text.primary}>
                      {formatCurrency(b.amountCents)}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      Requested {formatRelative(b.startIso)}
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    variant="ghost"
                    label="Reject"
                    onPress={() => undefined}
                  />
                  <Button
                    size="sm"
                    variant="solid"
                    label="Approve"
                    onPress={() => undefined}
                  />
                </View>
              );
            })
          )}
        </Card>
      ) : null}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  bulkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  },
  emptyBlock: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
