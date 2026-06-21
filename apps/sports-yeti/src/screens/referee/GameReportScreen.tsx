import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Star } from 'lucide-react-native';
import { Tag } from '@sports-yeti/ui';
import {
  facilityById,
  gameById,
  REFEREE_ASSIGNMENTS,
  spaceById,
} from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';

export function GameReportScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const route = useRoute<
    RouteProp<{ params: { assignmentId: string } }, 'params'>
  >();
  const assignment = useMemo(
    () => REFEREE_ASSIGNMENTS.find((a) => a.id === route.params.assignmentId),
    [route.params.assignmentId],
  );
  const game = useMemo(
    () => (assignment ? gameById(assignment.gameId) : undefined),
    [assignment],
  );
  const space = useMemo(
    () => (game ? spaceById(game.spaceId) : undefined),
    [game],
  );
  const facility = useMemo(
    () => (space ? facilityById(space.facilityId) : undefined),
    [space],
  );

  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [infractions, setInfractions] = useState('');
  const [rating, setRating] = useState(5);

  if (!assignment || !game) {
    return (
      <View style={styles.root}>
        <Text variant="body">Assignment not found.</Text>
      </View>
    );
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
          Game report
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
          <Text variant="bodyLg" style={styles.bold}>
            {game.sport} · {facility?.name ?? '—'}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {fmtDate(game.startIso)}
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <Text variant="h3">Final score</Text>
          <View style={[styles.scoreRow, { gap: spacing.lg }]}>
            <ScoreInput label="Home" value={homeScore} onChange={setHomeScore} />
            <Text variant="h2" color={colors.text.muted}>
              ·
            </Text>
            <ScoreInput label="Away" value={awayScore} onChange={setAwayScore} />
          </View>
        </View>

        <View style={styles.card}>
          <Text variant="h3">Infractions / notes</Text>
          <Pressable
            accessibilityLabel="Tap to add infractions or notes"
            onPress={() => setInfractions((s) => `${s}.`)}
            style={styles.notesBox}
          >
            <Text variant="body" color={colors.text.primary}>
              {infractions || 'Tap to add notes (mock).'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text variant="h3">Rate the captains</Text>
          <View style={[styles.starRow, { gap: spacing.xs }]}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={`${n} star${n === 1 ? '' : 's'}`}
                onPress={() => setRating(n)}
              >
                <Star
                  size={32}
                  color={n <= rating ? colors.status.warning : colors.text.muted}
                  fill={n <= rating ? colors.status.warning : 'transparent'}
                  strokeWidth={1.5}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text variant="h3">Payout</Text>
          <View style={[styles.payoutRow, { gap: spacing.sm }]}>
            <Text variant="body" color={colors.text.secondary}>
              Earned
            </Text>
            <Text variant="h2" color={colors.brand.primary} style={styles.bold}>
              ${(assignment.rateCents / 100).toFixed(0)}
            </Text>
            <Tag size="sm" tone="warning" label="Pending" leadingDot />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Submit game report"
          onPress={() => {
            toast.show({
              variant: 'success',
              title: 'Report submitted',
              description: 'Payout queued. You\u2019ll see it on Earnings within 48h.',
            });
            setTimeout(() => navigation.goBack(), 600);
          }}
          style={({ pressed }) => [
            styles.submitBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text variant="body" color={colors.text.inverse} style={styles.bold}>
            Submit report
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

interface ScoreProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}
function ScoreInput({ label, value, onChange }: ScoreProps) {
  return (
    <View style={[styles.scoreCol, { gap: 4 }]}>
      <Text variant="eyebrow" color={colors.text.muted}>
        {label}
      </Text>
      <Pressable
        accessibilityLabel={`${label} score, current ${value || 0}`}
        onPress={() => onChange(String(Number(value || '0') + 1))}
        style={styles.scoreBox}
      >
        <Text variant="display" color={colors.text.primary} style={styles.scoreValue}>
          {value || '0'}
        </Text>
      </Pressable>
    </View>
  );
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
    gap: 4,
    ...shadows.soft,
  },
  scoreCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCol: {
    alignItems: 'center',
  },
  scoreBox: {
    width: 96,
    height: 96,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.8,
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  notesBox: {
    backgroundColor: colors.surface.chip,
    borderRadius: radii.lg,
    padding: spacing.md,
    minHeight: 96,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  submitBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  bold: {
    fontWeight: '600',
  },
});
