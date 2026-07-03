import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Flag } from 'lucide-react-native';
import { RoleBadge, Tag, Tabs } from '@sports-yeti/ui';
import {
  DEMO_ORG_ID,
  DEMO_REFEREE_ID,
  facilityById,
  gameById,
  marketplaceGamesForReferee,
  refereeById,
  spaceById,
  type Game,
  type RefereeAssignment,
} from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import { useRoleStack } from '../../features/role-stack';
import { RoleSwitcher } from '../../features/role-switcher';
import { WaiverProgressCard } from '../../features/waiver-gate';
import { useRefereeAssignments, useRefereeStore } from '../../features/referee-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'completed', label: 'Completed' },
];

export function RefereeHomeScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { roles } = useRoleStack();
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const referee = useMemo(() => refereeById(DEMO_REFEREE_ID), []);
  // Seeded assignments + session accept/decline/report transitions.
  const assignments = useRefereeAssignments();
  const acceptAssignment = useRefereeStore((s) => s.accept);
  const declineAssignment = useRefereeStore((s) => s.decline);
  const bidGameIds = useRefereeStore((s) => s.bidGameIds);
  const marketplace = useMemo(() => marketplaceGamesForReferee(), []);

  const handleAccept = (a: RefereeAssignment) => {
    acceptAssignment(a.id);
    toast.show({
      variant: 'success',
      title: 'Assignment accepted',
      description: 'Moved to your Accepted list — submit the report after the game.',
    });
  };

  const handleDecline = (a: RefereeAssignment) => {
    declineAssignment(a.id);
    toast.show({
      variant: 'info',
      title: 'Invitation declined',
      description: 'The organizer will offer the slot to another referee.',
    });
  };

  // Referee waiver gate (org-wide). Shown via WaiverProgressCard below;
  // the per-action `guard()` is wired on the marketplace bid CTA inside
  // <MarketplaceGameDetailScreen>.
  const refScopes = useMemo(
    () => [{ kind: 'organization' as const, scopeId: DEMO_ORG_ID }],
    [],
  );

  const pending = assignments.filter((a) => a.status === 'invited');
  const accepted = assignments.filter((a) => a.status === 'accepted');
  const completed = assignments.filter((a) => a.status === 'completed');

  const totalEarnedCents = completed.reduce((sum, a) => sum + a.rateCents, 0);
  const pendingPayoutCents = accepted
    .filter((a) => a.payoutStatus === 'pending')
    .reduce((sum, a) => sum + a.rateCents, 0);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + 120,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerAvatar}>
            <Flag size={20} color={colors.brand.primary} strokeWidth={2.25} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="eyebrow" color={colors.text.muted}>
              REFEREE
            </Text>
            <Text variant="bodySm" color={colors.text.primary} style={styles.bold}>
              {referee?.totalGames ?? 0} games · {referee?.rating?.toFixed(1) ?? '—'} ★
            </Text>
          </View>
          {roles.length > 1 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch role"
              onPress={() => setSwitcherOpen(true)}
              style={styles.switchPill}
            >
              <RoleBadge role="referee" />
              <ChevronDown size={14} color={colors.text.muted} />
            </Pressable>
          ) : null}
        </View>

        <Text variant="display" color={colors.text.primary} style={styles.title}>
          Officiate the game
        </Text>

        <View style={[styles.statRow, { gap: spacing.md }]}>
          <Stat label="Earned" value={fmt(totalEarnedCents)} tone="success" />
          <Stat label="Pending payout" value={fmt(pendingPayoutCents)} tone="warning" />
          <Stat label="Active games" value={String(accepted.length)} tone="brand" />
        </View>

        <WaiverProgressCard
          scopes={refScopes}
          action="accept marketplace assignments"
        />

        <Tabs
          items={TABS.map((t) => {
            const count =
              t.key === 'pending'
                ? pending.length
                : t.key === 'marketplace'
                ? marketplace.length
                : t.key === 'accepted'
                ? accepted.length
                : completed.length;
            return { ...t, badge: count > 0 ? String(count) : undefined };
          })}
          value={tab}
          onChange={setTab}
          variant="segmented"
          scrollable
        />

        {tab === 'pending'
          ? renderAssignments(pending, navigation, 'No invitations right now.', {
              onAccept: handleAccept,
              onDecline: handleDecline,
            })
          : null}

        {tab === 'marketplace'
          ? renderMarketplace(marketplace, navigation, bidGameIds)
          : null}

        {tab === 'accepted'
          ? renderAssignments(accepted, navigation, 'No accepted assignments.')
          : null}

        {tab === 'completed'
          ? renderAssignments(completed, navigation, 'No completed games yet.')
          : null}
      </ScrollView>

      <RoleSwitcher
        visible={switcherOpen}
        onRequestClose={() => setSwitcherOpen(false)}
        onSwitch={() => toast.show({ variant: 'info', title: 'Role switched' })}
      />
    </View>
  );
}

function renderAssignments(
  list: RefereeAssignment[],
  navigation: Navigation,
  emptyCopy: string,
  inviteHandlers?: {
    onAccept: (a: RefereeAssignment) => void;
    onDecline: (a: RefereeAssignment) => void;
  },
) {
  if (list.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text variant="body" color={colors.text.secondary}>
          {emptyCopy}
        </Text>
      </View>
    );
  }
  return list.map((a) => {
    const game = gameById(a.gameId);
    if (!game) return null;
    const space = spaceById(game.spaceId);
    const facility = space ? facilityById(space.facilityId) : undefined;
    const isCompleted = a.status === 'completed';
    return (
      <View key={a.id} style={styles.card}>
        <View style={[styles.cardHead, { gap: spacing.xs }]}>
          <Text variant="bodyLg" style={styles.bold}>
            {game.sport} · {facility?.name ?? '—'}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {space?.name ?? '—'} · {fmtDate(game.startIso)}
          </Text>
        </View>
        <View style={[styles.metaRow, { gap: spacing.xs }]}>
          <Tag size="sm" tone="info" label={fmt(a.rateCents)} />
          <Tag
            size="sm"
            tone={
              a.status === 'invited'
                ? 'warning'
                : a.status === 'accepted'
                ? 'success'
                : 'neutral'
            }
            label={a.status}
            leadingDot
          />
          {a.payoutStatus !== 'pending' ? (
            <Tag size="sm" tone="success" label="Paid" />
          ) : null}
        </View>
        {a.status === 'invited' && inviteHandlers ? (
          <View style={[styles.actionRow, { gap: spacing.sm }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decline assignment"
              hitSlop={6}
              onPress={() => inviteHandlers.onDecline(a)}
              style={({ pressed }) => [
                styles.ghostBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text variant="bodySm" color={colors.text.primary}>
                Decline
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Accept assignment"
              hitSlop={6}
              onPress={() => inviteHandlers.onAccept(a)}
              style={({ pressed }) => [
                styles.primaryBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text variant="bodySm" color={colors.text.inverse} style={styles.bold}>
                Accept
              </Text>
            </Pressable>
          </View>
        ) : a.status === 'accepted' && !a.reportSubmitted ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Submit game report"
            onPress={() =>
              navigation.navigate('GameReport', { assignmentId: a.id })
            }
            style={({ pressed }) => [
              styles.primaryBtn,
              { alignSelf: 'flex-start', opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text variant="bodySm" color={colors.text.inverse} style={styles.bold}>
              Submit report
            </Text>
          </Pressable>
        ) : isCompleted ? (
          <Tag size="sm" tone="success" label="Report submitted" />
        ) : null}
      </View>
    );
  });
}

function renderMarketplace(
  games: Game[],
  navigation: Navigation,
  bidGameIds: Record<string, true>,
) {
  if (games.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text variant="body" color={colors.text.secondary}>
          No marketplace games right now. Check back soon.
        </Text>
      </View>
    );
  }
  return games.map((g) => {
    const space = spaceById(g.spaceId);
    const facility = space ? facilityById(space.facilityId) : undefined;
    const hasBid = !!bidGameIds[g.id];
    return (
      <Pressable
        key={g.id}
        accessibilityRole="button"
        accessibilityLabel={
          hasBid
            ? `View your bid on the ${g.sport} game at ${facility?.name ?? 'venue'}`
            : `Bid on ${g.sport} game at ${facility?.name ?? 'venue'}`
        }
        onPress={() =>
          navigation.navigate('MarketplaceGameDetail', { gameId: g.id })
        }
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}
      >
        <View style={[styles.cardHead, { gap: spacing.xs }]}>
          <Text variant="bodyLg" style={styles.bold}>
            {g.sport} · {facility?.name ?? '—'}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {fmtDate(g.startIso)} · {space?.name ?? '—'}
          </Text>
        </View>
        <View style={[styles.metaRow, { gap: spacing.xs }]}>
          {g.refereeBaseRateCents ? (
            <Tag
              size="sm"
              tone="info"
              label={`Base ${fmt(g.refereeBaseRateCents)}`}
            />
          ) : null}
          {hasBid ? (
            <Tag size="sm" tone="success" label="Bid placed" leadingDot />
          ) : (
            <Tag size="sm" tone="warning" label="Open to bid" leadingDot />
          )}
        </View>
        {/* Visual affordance only — the whole card is the button (nesting a
            second pressable with the same target confuses screen readers). */}
        <View
          style={[
            hasBid ? styles.ghostBtn : styles.primaryBtn,
            { alignSelf: 'flex-start' },
          ]}
        >
          <Text
            variant="bodySm"
            color={hasBid ? colors.text.primary : colors.text.inverse}
            style={styles.bold}
          >
            {hasBid ? 'View bid' : 'Bid'}
          </Text>
        </View>
      </Pressable>
    );
  });
}

interface StatProps {
  label: string;
  value: string;
  tone: 'brand' | 'success' | 'warning';
}
function Stat({ label, value, tone }: StatProps) {
  const accent =
    tone === 'success'
      ? colors.status.success
      : tone === 'warning'
      ? colors.status.warning
      : colors.brand.primary;
  return (
    <View style={[styles.statCard, { gap: 4 }]}>
      <Text variant="eyebrow" color={colors.text.muted}>
        {label}
      </Text>
      <Text variant="h2" color={accent} style={styles.bold}>
        {value}
      </Text>
    </View>
  );
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.soft,
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.6,
    marginTop: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.soft,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  cardHead: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  ghostBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  emptyCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.soft,
  },
  bold: {
    fontWeight: '600',
  },
});
