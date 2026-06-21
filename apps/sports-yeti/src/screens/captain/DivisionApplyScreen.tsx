import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { OrgAvatar, SeasonPill, SkillLevelPill, Tag } from '@sports-yeti/ui';
import {
  DEMO_ORG_ID,
  DEMO_PLAYER_ID,
  DIVISIONS,
  leagueById,
  organizationById,
  seasonById,
  teamsCaptainedBy,
  type Division,
} from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import { useWaiverGate } from '../../features/waiver-gate';

export function DivisionApplyScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const teams = useMemo(() => teamsCaptainedBy(DEMO_PLAYER_ID), []);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    teams[0]?.id ?? null,
  );

  const open = useMemo(
    () => DIVISIONS.filter((d) => d.status === 'open'),
    [],
  );

  // Waiver gate scopes: org-wide org waiver. Per-division waivers can
  // be added to the array if they exist in the mocks for that division.
  const gateScopes = useMemo(
    () => [{ kind: 'organization' as const, scopeId: DEMO_ORG_ID }],
    [],
  );
  const { guard } = useWaiverGate(gateScopes);

  function apply(d: Division) {
    if (!selectedTeam) {
      toast.show({
        variant: 'warning',
        title: 'Pick a team first',
        description: 'Create a team or pick one to apply with.',
      });
      return;
    }
    guard(`apply ${selectedTeam ? 'your team' : 'a team'} to ${d.name}`, () => {
      toast.show({
        variant: 'success',
        title: `Applied to ${d.name}`,
        description:
          'Pending admin review. Check the team for waivers + payment status.',
      });
      navigation.goBack();
    });
  }

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          Apply to division
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View style={styles.headCard}>
          <Text variant="eyebrow" color={colors.text.muted}>
            APPLY WITH
          </Text>
          <View style={[styles.teamPicker, { gap: spacing.xs }]}>
            {teams.map((t) => {
              const active = selectedTeam === t.id;
              return (
                <Pressable
                  key={t.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => setSelectedTeam(t.id)}
                  style={({ pressed }) => [
                    styles.teamChip,
                    {
                      backgroundColor: active
                        ? colors.brand.primary
                        : colors.surface.card,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text
                    variant="bodySm"
                    color={active ? colors.text.inverse : colors.text.primary}
                    style={styles.bold}
                  >
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {open.map((d) => {
          const season = seasonById(d.seasonId);
          const league = leagueById(d.leagueId);
          const org = league ? organizationById(league.organizationId) : undefined;
          const remaining = d.maxTeams - d.registeredTeams;
          return (
            <View key={d.id} style={styles.divCard}>
              <View style={[styles.headerRow, { gap: spacing.sm }]}>
                {org ? (
                  <OrgAvatar
                    name={org.name}
                    logoUrl={org.logoUrl}
                    brandColor={org.brandColor}
                    size="md"
                  />
                ) : null}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyLg" style={styles.bold}>
                    {league?.name ?? '—'} · {d.name}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {season?.label ?? '—'}
                  </Text>
                </View>
              </View>
              <View style={[styles.metaRow, { gap: spacing.xs }]}>
                {season ? (
                  <SeasonPill cycle={season.cycle} year={season.year} />
                ) : null}
                <SkillLevelPill level={d.skillLevel} />
                {d.ageBand ? (
                  <Tag size="sm" tone="neutral" label={d.ageBand} />
                ) : null}
                <Tag
                  size="sm"
                  tone={remaining > 0 ? 'success' : 'error'}
                  label={`${remaining} spots left`}
                />
              </View>
              <View style={styles.feeRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="caption" color={colors.text.muted}>
                    Per team
                  </Text>
                  <Text variant="h3" color={colors.brand.primary}>
                    ${(d.registrationFeeCents / 100).toFixed(0)}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Apply to ${d.name}`}
                  onPress={() => apply(d)}
                  style={({ pressed }) => [
                    styles.applyBtn,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text variant="bodySm" color={colors.text.inverse} style={styles.bold}>
                    Apply
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  headCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.md,
    gap: 8,
    ...shadows.soft,
  },
  teamPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teamChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  divCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  applyBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  bold: {
    fontWeight: '600',
  },
});
