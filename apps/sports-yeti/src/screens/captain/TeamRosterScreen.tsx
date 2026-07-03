import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, UserPlus } from 'lucide-react-native';
import { Tag } from '@sports-yeti/ui';
import type { RootStackParamList } from '../../navigation/MainNavigator';
import {
  divisionById,
  leagueById,
  playerById,
  rosterForTeam,
  seasonById,
  teamById,
  type RosterMember,
} from '@sports-yeti/mocks';
import { EmptyState, ProgressBar, Text } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';

const PAYMENT_TONE: Record<RosterMember['paymentStatus'], 'success' | 'warning' | 'error' | 'neutral'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'warning',
  refunded: 'neutral',
};

const PAYMENT_LABEL: Record<RosterMember['paymentStatus'], string> = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Unpaid',
  refunded: 'Refunded',
};

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function TeamRosterScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<{ params: { teamId: string } }, 'params'>>();
  const team = useMemo(() => teamById(route.params.teamId), [route.params.teamId]);
  const roster = useMemo(
    () => (team ? rosterForTeam(team.id) : []),
    [team],
  );
  const division = team?.divisionId ? divisionById(team.divisionId) : undefined;
  const season = division ? seasonById(division.seasonId) : undefined;
  const league = division ? leagueById(division.leagueId) : undefined;

  if (!team) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Team not found"
          description="It may have been disbanded or you opened a stale link."
          primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  // Registration fee progress — computed inline from the roster instead of
  // deep-linking into the player-world TeamPayment screen (different mock
  // universe; the ids don't resolve there).
  const paidCount = roster.filter((m) => m.paymentStatus === 'paid').length;
  const perPlayerCents =
    team.perPlayerOverrideCents ??
    (team.rosterMax > 0
      ? Math.ceil(team.registrationFeeCents / team.rosterMax)
      : 0);
  const collectedCents = paidCount * perPlayerCents;
  const feeProgress =
    team.registrationFeeCents > 0
      ? Math.min(1, collectedCents / team.registrationFeeCents)
      : 1;

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
          Roster
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Invite player"
          hitSlop={8}
          onPress={() => navigation.navigate('PlayerDirectory')}
          style={styles.backBtn}
        >
          <UserPlus size={22} color={colors.brand.primary} strokeWidth={2.25} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View style={styles.headCard}>
          <Text variant="h2" color={colors.text.primary}>
            {team.name}
          </Text>
          <Text variant="body" color={colors.text.secondary}>
            {team.sport} · {team.skillLevel} · {team.city}
          </Text>
          <View style={[styles.metaRow, { gap: spacing.xs }]}>
            {league ? <Tag size="sm" tone="info" label={league.name} /> : null}
            {season ? <Tag size="sm" tone="neutral" label={season.label} /> : null}
            {division ? (
              <Tag size="sm" tone="brand" label={division.name} />
            ) : (
              <Tag size="sm" tone="warning" label="Independent" leadingDot />
            )}
          </View>
        </View>

        {team.divisionId ? (
          <View style={styles.paymentCard}>
            <View style={styles.paymentHead}>
              <Text variant="h3">Registration fee</Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {paidCount}/{roster.length} paid
              </Text>
            </View>
            <ProgressBar
              value={feeProgress}
              tone="success"
              size="md"
              showLabel
              accessibilityLabel="Registration fee collection progress"
            />
            <Text variant="caption" color={colors.text.muted}>
              ${(collectedCents / 100).toFixed(0)} of $
              {(team.registrationFeeCents / 100).toFixed(0)} collected · $
              {(perPlayerCents / 100).toFixed(0)}/player. Nudge unpaid players
              from the roster below.
            </Text>
          </View>
        ) : (
          <View style={[styles.actionRow, { gap: spacing.sm }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Apply to division"
              onPress={() => navigation.navigate('DivisionApply')}
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: colors.brand.primary,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              <Text variant="body" color={colors.text.inverse} style={styles.bold}>
                Apply to a division
              </Text>
              <Text variant="caption" color={colors.text.inverse}>
                Pick a registration window.
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.rosterCard}>
          <Text variant="h3">Roster ({roster.length} / {team.rosterMax})</Text>
          {roster.map((m) => {
            const player = playerById(m.playerId);
            return (
              <View key={m.id} style={[styles.rosterRow, { gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="body" style={styles.bold}>
                    {player?.name ?? 'Unknown player'}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {m.role.replace('_', ' ')} · {player?.position ?? '—'}
                  </Text>
                </View>
                <Tag
                  size="sm"
                  tone={PAYMENT_TONE[m.paymentStatus]}
                  label={PAYMENT_LABEL[m.paymentStatus]}
                />
                <Tag
                  size="sm"
                  tone={m.waiversSigned ? 'success' : 'error'}
                  label={m.waiversSigned ? 'Waivers ✓' : 'Waivers ✗'}
                  leadingDot
                />
              </View>
            );
          })}
        </View>
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
    padding: spacing.lg,
    gap: 8,
    ...shadows.card,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: 220,
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: 4,
    ...shadows.soft,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  paymentHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  rosterCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  bold: {
    fontWeight: '600',
  },
});
