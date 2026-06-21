import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { Tag } from '@sports-yeti/ui';
import {
  DEMO_ORG_ID,
  facilityById,
  gameById,
  organizationById,
  spaceById,
} from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import { useWaiverGate } from '../../features/waiver-gate';

export function MarketplaceGameDetailScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<{ params: { gameId: string } }, 'params'>>();
  const toast = useToast();
  const game = useMemo(
    () => gameById(route.params.gameId),
    [route.params.gameId],
  );
  const space = useMemo(
    () => (game ? spaceById(game.spaceId) : undefined),
    [game],
  );
  const facility = useMemo(
    () => (space ? facilityById(space.facilityId) : undefined),
    [space],
  );
  const org = useMemo(
    () => (game?.organizationId ? organizationById(game.organizationId) : undefined),
    [game],
  );

  const baseCents = game?.refereeBaseRateCents ?? 6500;
  const [bidCents, setBidCents] = useState(baseCents);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Waiver gate: org-wide org waiver. Bid blocked until signed.
  const gateScopes = useMemo(
    () => [{ kind: 'organization' as const, scopeId: DEMO_ORG_ID }],
    [],
  );
  const { guard } = useWaiverGate(gateScopes);

  if (!game) {
    return (
      <View style={styles.root}>
        <Text variant="body">Game not found.</Text>
      </View>
    );
  }

  const adjust = (delta: number) =>
    setBidCents((v) => Math.max(0, v + delta));

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
          Marketplace
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View style={styles.heroCard}>
          <Text variant="display" color={colors.text.primary} style={styles.title}>
            {game.sport}
          </Text>
          <Text variant="bodyLg" color={colors.text.secondary}>
            {facility?.name ?? '—'} · {space?.name ?? '—'}
          </Text>
          <View style={[styles.iconRow, { gap: spacing.xs }]}>
            <MapPin size={14} color={colors.text.muted} />
            <Text variant="bodySm" color={colors.text.muted}>
              {facility?.address ?? '—'}, {facility?.city ?? '—'}
            </Text>
          </View>
          <View style={[styles.metaRow, { gap: spacing.xs }]}>
            {org ? <Tag size="sm" tone="info" label={org.name} /> : null}
            <Tag size="sm" tone="warning" label="Open to bid" leadingDot />
            {game.refereeBaseRateCents ? (
              <Tag
                size="sm"
                tone="success"
                label={`Base ${fmt(game.refereeBaseRateCents)}`}
              />
            ) : null}
          </View>
          <Text variant="body" color={colors.text.primary}>
            {fmtDate(game.startIso)} – {fmtTime(game.endIso)}
          </Text>
        </View>

        <View style={styles.bidCard}>
          <Text variant="h3">Your bid</Text>
          <Text variant="caption" color={colors.text.muted}>
            Base rate: {fmt(baseCents)}. Bid lower to be more competitive.
          </Text>
          <View style={[styles.bidRow, { gap: spacing.md }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease bid by $5"
              onPress={() => adjust(-500)}
              style={styles.stepBtn}
            >
              <Text variant="h2" color={colors.text.primary}>
                −
              </Text>
            </Pressable>
            <Text variant="display" color={colors.brand.primary} style={styles.bidValue}>
              {fmt(bidCents)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase bid by $5"
              onPress={() => adjust(500)}
              style={styles.stepBtn}
            >
              <Text variant="h2" color={colors.text.primary}>
                +
              </Text>
            </Pressable>
          </View>
          <Text variant="caption" color={colors.text.muted}>
            Optional message — give the captain a reason to pick you.
          </Text>
          <Pressable
            accessibilityRole="text"
            onPress={() => setMessage((m) => `${m}!`)}
            style={styles.msgBox}
          >
            <Text variant="body" color={colors.text.primary}>
              {message ||
                '“Available 30 min early. USSF Grade 7 with 5 seasons of co-ed.”'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={submitted ? 'Bid submitted' : 'Submit bid'}
            disabled={submitted}
            onPress={() => {
              guard('submit your bid', () => {
                setSubmitted(true);
                toast.show({
                  variant: 'success',
                  title: 'Bid submitted',
                  description: `Captain will be notified. You\u2019ll hear back within 24h.`,
                });
                setTimeout(() => navigation.goBack(), 800);
              });
            }}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: submitted
                  ? colors.status.success
                  : colors.brand.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text variant="body" color={colors.text.inverse} style={styles.bold}>
              {submitted ? 'Submitted ✓' : `Submit bid · ${fmt(bidCents)}`}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
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
  heroCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.sm,
    ...shadows.card,
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  bidCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidValue: {
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.8,
    minWidth: 140,
    textAlign: 'center',
  },
  msgBox: {
    backgroundColor: colors.surface.chip,
    borderRadius: radii.lg,
    padding: spacing.md,
    minHeight: 64,
  },
  primaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  bold: {
    fontWeight: '600',
  },
});
