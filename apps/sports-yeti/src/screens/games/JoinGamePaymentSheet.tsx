import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Tag, BottomSheet } from '@sports-yeti/ui';
import {
  DEMO_ORG_ID,
  facilityById,
  gameById,
  spaceById,
} from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { useWaiverGate } from '../../features/waiver-gate';

/**
 * Mounted as a modal-presented stack screen — appears as a bottom sheet
 * over the current game detail context. Confirms payment for an open
 * play game with `perPlayerFeeCents > 0`.
 */
export function JoinGamePaymentSheet() {
  const navigation = useNavigation();
  const route = useRoute<
    RouteProp<{ params: { gameId: string } }, 'params'>
  >();
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

  // Waiver gate: org + facility scopes must be signed before joining.
  const gateScopes = useMemo(
    () =>
      facility
        ? [
            { kind: 'organization' as const, scopeId: DEMO_ORG_ID },
            { kind: 'facility' as const, scopeId: facility.id },
          ]
        : [{ kind: 'organization' as const, scopeId: DEMO_ORG_ID }],
    [facility],
  );
  const { guard } = useWaiverGate(gateScopes);

  if (!game) return null;

  const fee = game.perPlayerFeeCents ?? 0;
  const platformFee = Math.round(fee * 0.05);
  const total = fee + platformFee;

  return (
    <BottomSheet
      visible
      onRequestClose={() => navigation.goBack()}
      title="Join game"
      snapPoints={['65%']}
    >
      <View style={[styles.body, { gap: spacing.md }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="bodyLg" style={styles.bold}>
              Open play · {game.sport}
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              {facility?.name ?? '—'} · {space?.name ?? '—'}
            </Text>
          </View>
          {game.refereeRequired ? (
            <Tag size="sm" tone="warning" label="Referee required" />
          ) : (
            <Tag size="sm" tone="success" label="No ref needed" />
          )}
        </View>

        <View style={styles.summaryCard}>
          <SummaryRow label="Per-player fee" value={fmt(fee)} />
          <SummaryRow label="Platform fee" value={fmt(platformFee)} />
          <View style={styles.divider} />
          <SummaryRow label="Total" value={fmt(total)} bold />
        </View>

        <Text variant="caption" color={colors.text.muted}>
          Charges your card on file. Refunds available if the game is
          cancelled by the captain.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Confirm and pay"
          onPress={() => {
            guard(`join ${game?.sport ?? 'this game'}`, () => {
              toast.show({
                variant: 'success',
                title: 'You\u2019re in',
                description: `See you at ${facility?.name ?? 'the venue'}.`,
              });
              navigation.goBack();
            });
          }}
          style={({ pressed }) => [
            styles.payBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text variant="body" color={colors.text.inverse} style={styles.bold}>
            Confirm and pay {fmt(total)}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.cancelBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text variant="body" color={colors.text.secondary}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
}
function SummaryRow({ label, value, bold }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text
        variant="bodySm"
        color={bold ? colors.text.primary : colors.text.secondary}
        style={bold ? styles.bold : undefined}
      >
        {label}
      </Text>
      <Text
        variant={bold ? 'bodyLg' : 'bodySm'}
        color={bold ? colors.brand.primary : colors.text.primary}
        style={bold ? styles.bold : undefined}
      >
        {value}
      </Text>
    </View>
  );
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const styles = StyleSheet.create({
  body: {
    paddingTop: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface.chip,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.soft,
    marginVertical: 4,
  },
  payBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  bold: {
    fontWeight: '600',
  },
});
