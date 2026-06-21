import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { type WebPressableState } from '../../lib/pressable';
import {
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
} from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { LEAGUES, type League } from '../../mocks/leagues';
import { TEAMS } from '../../mocks/teams';
import { FACILITIES } from '../../mocks/facilities';
import { useScheduleStore } from '../../stores';
import {
  FORMAT_DESCRIPTION,
  FORMAT_LABEL,
  WEEKDAY_OPTIONS,
  generateFixtures,
  type FixtureFormat,
  type FixtureInput,
  type Weekday,
} from '../../lib/fixtures';
import { formatDate, formatTime } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

const STEPS = [
  { key: 'league', label: 'League' },
  { key: 'format', label: 'Format' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'preview', label: 'Preview' },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

const DEFAULT_TIME_SLOTS = ['18:00', '19:30', '21:00'];

interface WizardState {
  leagueId: string | null;
  format: FixtureFormat;
  startDateYmd: string;
  weekdays: Weekday[];
  timeSlotsCsv: string;
  durationMinutes: string;
  facilityId: string;
  spaceNamesCsv: string;
}

function defaultStartDate(league: League | null): string {
  if (league?.seasonStartIso) return league.seasonStartIso.slice(0, 10);
  const today = new Date();
  today.setUTCDate(today.getUTCDate() + 7);
  return today.toISOString().slice(0, 10);
}

function eligibleLeagues(): League[] {
  return LEAGUES.filter((l) => {
    if (l.status === 'archived') return false;
    const teams = TEAMS.filter(
      (t) => t.leagueId === l.id && t.status === 'approved',
    );
    return teams.length >= 2;
  });
}

export function FixtureGeneratorScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<
    RouteProp<{ params: { id?: string } }, 'params'>
  >();
  const toast = useToast();
  const addGames = useScheduleStore((s) => s.addGames);

  const eligibles = useMemo(() => eligibleLeagues(), []);
  const initialLeagueId =
    route.params?.id && eligibles.find((l) => l.id === route.params!.id)
      ? route.params.id
      : eligibles[0]?.id ?? null;
  const initialLeague = initialLeagueId
    ? LEAGUES.find((l) => l.id === initialLeagueId) ?? null
    : null;
  const initialFacility =
    FACILITIES.find((f) => f.city === initialLeague?.city) ?? FACILITIES[0]!;

  const [step, setStep] = useState<StepKey>('league');
  const [state, setState] = useState<WizardState>({
    leagueId: initialLeagueId,
    format: 'round_robin_single',
    startDateYmd: defaultStartDate(initialLeague),
    weekdays: [0, 6], // Sun + Sat
    timeSlotsCsv: DEFAULT_TIME_SLOTS.join(', '),
    durationMinutes: '90',
    facilityId: initialFacility.id,
    spaceNamesCsv: initialFacility.spaces
      .slice(0, 2)
      .map((s) => s.name)
      .join(', '),
  });
  const [generated, setGenerated] = useState(false);

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((p) => ({ ...p, [key]: value }));

  const league = state.leagueId
    ? LEAGUES.find((l) => l.id === state.leagueId) ?? null
    : null;
  const teamsInLeague = league
    ? TEAMS.filter((t) => t.leagueId === league.id && t.status === 'approved')
    : [];
  const facility = FACILITIES.find((f) => f.id === state.facilityId);

  const timeSlots = state.timeSlotsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const spaceNames = state.spaceNamesCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const errors = {
    leagueId: !state.leagueId ? 'Pick a league' : undefined,
    startDate: !/^\d{4}-\d{2}-\d{2}$/.test(state.startDateYmd)
      ? 'Use YYYY-MM-DD'
      : undefined,
    weekdays: state.weekdays.length === 0 ? 'Pick at least one weekday' : undefined,
    timeSlots:
      timeSlots.length === 0
        ? 'At least one time slot'
        : timeSlots.find((t) => !/^\d{2}:\d{2}$/.test(t))
        ? 'Use HH:MM (e.g. 18:00)'
        : undefined,
    duration:
      !state.durationMinutes ||
      Number.isNaN(Number(state.durationMinutes)) ||
      Number(state.durationMinutes) < 15
        ? 'At least 15 minutes'
        : undefined,
    facility: !state.facilityId ? 'Pick a facility' : undefined,
    spaces: spaceNames.length === 0 ? 'At least one space' : undefined,
  } as const;

  const stepValid = (() => {
    if (step === 'league') return !errors.leagueId && teamsInLeague.length >= 2;
    if (step === 'format') return true;
    if (step === 'schedule')
      return (
        !errors.startDate &&
        !errors.weekdays &&
        !errors.timeSlots &&
        !errors.duration &&
        !errors.facility &&
        !errors.spaces
      );
    return true;
  })();

  // Build the preview only when we reach step 4 OR pre-compute on demand.
  const preview = useMemo(() => {
    if (!stepValid && step === 'preview') return null;
    if (!state.leagueId) return null;
    const input: FixtureInput = {
      leagueId: state.leagueId,
      format: state.format,
      startDateYmd: state.startDateYmd,
      weekdays: state.weekdays,
      timeSlots,
      durationMinutes: Number(state.durationMinutes) || 90,
      facilityId: state.facilityId,
      spaceNames,
    };
    return generateFixtures(input);
  }, [state, timeSlots, spaceNames, step, stepValid]);

  const handleGenerate = () => {
    if (!preview || preview.games.length === 0) {
      toast.show({
        variant: 'warning',
        title: 'Nothing to generate',
        description: 'Adjust the format or add more teams to the league.',
      });
      return;
    }
    addGames(preview.games);
    setGenerated(true);
    toast.show({
      variant: 'success',
      title: `Generated ${preview.totalGames} game${preview.totalGames === 1 ? '' : 's'}`,
      description: `${league?.name} · ${FORMAT_LABEL[state.format]}`,
      action: {
        label: 'Open schedule',
        onPress: () => navigation.navigate('Schedule'),
      },
    });
    navigation.navigate('Schedule');
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const goNext = () => {
    if (!stepValid) {
      toast.show({ variant: 'warning', title: 'Fix the highlighted fields' });
      return;
    }
    if (step === 'preview') {
      handleGenerate();
      return;
    }
    setStep(STEPS[stepIndex + 1]!.key);
  };
  const goPrev = () => {
    if (stepIndex === 0) {
      navigation.goBack();
      return;
    }
    setStep(STEPS[stepIndex - 1]!.key);
  };

  return (
    <PageScroll>
      <PageHeader
        title="Generate fixtures"
        subtitle="Build a season of games for an entire league in one pass."
        crumbs={[
          { label: 'Schedule', route: 'Schedule' },
          { label: 'Generate fixtures' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        meta={`Step ${stepIndex + 1} of ${STEPS.length} · ${STEPS[stepIndex]!.label}`}
        trailing={
          <>
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => navigation.goBack()}
              disabled={generated}
            />
            <Button
              label={
                step === 'preview'
                  ? generated
                    ? 'Generated'
                    : `Generate ${preview?.totalGames ?? 0} games`
                  : 'Continue'
              }
              variant="solid"
              size="sm"
              onPress={goNext}
              disabled={generated || !stepValid}
            />
          </>
        }
      />

      <View style={styles.stepperRow}>
        {STEPS.map((s, i) => {
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <Pressable
              key={s.key}
              onPress={() => i <= stepIndex && setStep(s.key)}
              disabled={i > stepIndex}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${s.label}`}
              accessibilityState={{ selected: active, disabled: i > stepIndex }}
              style={({ hovered }: WebPressableState) => [
                styles.stepperItem,
                active ? styles.stepperItemActive : null,
                done ? styles.stepperItemDone : null,
                hovered && i <= stepIndex ? styles.stepperItemHover : null,
              ]}
            >
              <View
                style={[
                  styles.stepDot,
                  active ? styles.stepDotActive : null,
                  done ? styles.stepDotDone : null,
                ]}
              >
                {done ? (
                  <Check size={12} color={colors.text.inverse} strokeWidth={3} />
                ) : (
                  <Text
                    variant="caption"
                    color={active ? colors.text.inverse : colors.text.secondary}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                variant="bodySm"
                color={active ? colors.brand.primary : colors.text.secondary}
                weight={active ? '600' : '400'}
              >
                {s.label}
              </Text>
              {i < STEPS.length - 1 ? (
                <ChevronRight
                  size={14}
                  color={colors.text.muted}
                  strokeWidth={2}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {step === 'league' ? (
        <Card style={styles.section}>
          <Text variant="h3" color={colors.text.primary}>
            Pick a league
          </Text>
          <Text variant="bodySm" color={colors.text.muted}>
            Only published leagues with at least 2 approved teams can have
            fixtures generated.
          </Text>
          {eligibles.length === 0 ? (
            <EmptyState
              icon={
                <Trophy size={20} color={colors.brand.primary} strokeWidth={2.25} />
              }
              title="No eligible leagues"
              description="Approve at least 2 teams in a published league before generating fixtures."
              primaryAction={{
                label: 'Open Leagues',
                onPress: () => navigation.navigate('Leagues'),
              }}
            />
          ) : (
            <View style={styles.leagueList}>
              {eligibles.map((l) => {
                const teamCount = TEAMS.filter(
                  (t) => t.leagueId === l.id && t.status === 'approved',
                ).length;
                const selected = state.leagueId === l.id;
                return (
                  <Pressable
                    key={l.id}
                    onPress={() => {
                      update('leagueId', l.id);
                      const fac =
                        FACILITIES.find((f) => f.city === l.city) ??
                        FACILITIES[0]!;
                      update('facilityId', fac.id);
                      update(
                        'spaceNamesCsv',
                        fac.spaces.slice(0, 2).map((s) => s.name).join(', '),
                      );
                      update('startDateYmd', l.seasonStartIso.slice(0, 10));
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={l.name}
                    style={({ hovered }: WebPressableState) => [
                      styles.leagueRow,
                      selected ? styles.leagueRowSelected : null,
                      hovered && !selected ? styles.leagueRowHover : null,
                    ]}
                  >
                    <View style={styles.leagueRowBody}>
                      <Text
                        variant="bodySm"
                        color={colors.text.primary}
                        weight="600"
                      >
                        {l.name}
                      </Text>
                      <Text variant="caption" color={colors.text.muted}>
                        {l.sportLabel} · {l.seasonName} · {l.city}
                      </Text>
                    </View>
                    <Tag
                      size="sm"
                      tone="brand"
                      label={`${teamCount} teams`}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}
        </Card>
      ) : null}

      {step === 'format' ? (
        <Card style={styles.section}>
          <Text variant="h3" color={colors.text.primary}>
            Pick a format
          </Text>
          <Text variant="bodySm" color={colors.text.muted}>
            {teamsInLeague.length} team{teamsInLeague.length === 1 ? '' : 's'} ·
            {' '}
            we'll generate just round 1 of any bracket since later rounds
            depend on results.
          </Text>
          <View style={styles.formatList}>
            {(Object.keys(FORMAT_LABEL) as FixtureFormat[]).map((f) => {
              const selected = state.format === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => update('format', f)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={FORMAT_LABEL[f]}
                  style={({ hovered }: WebPressableState) => [
                    styles.formatRow,
                    selected ? styles.formatRowSelected : null,
                    hovered && !selected ? styles.formatRowHover : null,
                  ]}
                >
                  <View style={styles.formatBody}>
                    <Text
                      variant="bodySm"
                      color={colors.text.primary}
                      weight="600"
                    >
                      {FORMAT_LABEL[f]}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {FORMAT_DESCRIPTION[f]}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioDot,
                      selected ? styles.radioDotActive : null,
                    ]}
                  >
                    {selected ? (
                      <Check
                        size={10}
                        color={colors.text.inverse}
                        strokeWidth={3}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ) : null}

      {step === 'schedule' ? (
        <>
          <Card style={styles.section}>
            <Text variant="h3" color={colors.text.primary}>
              When
            </Text>
            <View style={styles.row}>
              <Input
                label="Start date (YYYY-MM-DD)"
                value={state.startDateYmd}
                onChangeText={(v) => update('startDateYmd', v)}
                error={errors.startDate}
                containerStyle={styles.flex}
              />
              <Input
                label="Game duration (minutes)"
                variant="number"
                value={state.durationMinutes}
                onChangeText={(v) => update('durationMinutes', v)}
                error={errors.duration}
                containerStyle={styles.flex}
              />
            </View>
            <View>
              <Text
                variant="caption"
                color={colors.text.secondary}
                style={styles.label}
              >
                Play days {errors.weekdays ? `· ${errors.weekdays}` : ''}
              </Text>
              <View style={styles.weekdayRow}>
                {WEEKDAY_OPTIONS.map((d) => {
                  const selected = state.weekdays.includes(d.value);
                  return (
                    <Pressable
                      key={d.value}
                      onPress={() =>
                        update(
                          'weekdays',
                          selected
                            ? state.weekdays.filter((w) => w !== d.value)
                            : [...state.weekdays, d.value],
                        )
                      }
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={d.label}
                      style={({ hovered }: WebPressableState) => [
                        styles.dayChip,
                        selected ? styles.dayChipSelected : null,
                        hovered && !selected ? styles.dayChipHover : null,
                      ]}
                    >
                      <Text
                        variant="bodySm"
                        color={
                          selected ? colors.text.inverse : colors.text.primary
                        }
                      >
                        {d.short}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Input
              label="Time slots (comma-separated, HH:MM)"
              value={state.timeSlotsCsv}
              onChangeText={(v) => update('timeSlotsCsv', v)}
              error={errors.timeSlots}
              helpText="We cycle through these slots round-robin"
              placeholder="18:00, 19:30, 21:00"
            />
          </Card>

          <Card style={styles.section}>
            <Text variant="h3" color={colors.text.primary}>
              Where
            </Text>
            <Select
              label="Facility"
              value={state.facilityId}
              options={FACILITIES.map((f) => ({ value: f.id, label: f.name }))}
              onChange={(v) => {
                update('facilityId', v);
                const fac = FACILITIES.find((f) => f.id === v);
                if (fac) {
                  update(
                    'spaceNamesCsv',
                    fac.spaces.slice(0, 2).map((s) => s.name).join(', '),
                  );
                }
              }}
            />
            <Input
              label="Space rotation (comma-separated)"
              value={state.spaceNamesCsv}
              onChangeText={(v) => update('spaceNamesCsv', v)}
              error={errors.spaces}
              helpText={
                facility
                  ? `Available: ${facility.spaces.map((s) => s.name).join(' · ')}`
                  : 'Pick a facility'
              }
            />
          </Card>
        </>
      ) : null}

      {step === 'preview' ? (
        <>
          <Card style={styles.section}>
            <View style={styles.previewHead}>
              <Sparkles
                size={16}
                color={colors.brand.primary}
                strokeWidth={2.25}
              />
              <View style={styles.previewBody}>
                <Text variant="h3" color={colors.text.primary}>
                  {preview?.totalGames ?? 0} games · {preview?.rounds.length ?? 0} round{preview?.rounds.length === 1 ? '' : 's'}
                </Text>
                <Text variant="bodySm" color={colors.text.muted}>
                  {league?.name} · {FORMAT_LABEL[state.format]} ·{' '}
                  {teamsInLeague.length} teams
                </Text>
              </View>
              <Tag
                size="sm"
                tone="info"
                leadingDot
                label={`Starts ${formatDate(state.startDateYmd)}`}
              />
            </View>
          </Card>

          {preview && preview.rounds.length > 0 ? (
            preview.rounds.map((round, i) => (
              <Card key={i} style={styles.section}>
                <View style={styles.previewHead}>
                  <CalendarRange
                    size={14}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                  <Text variant="h4" color={colors.text.primary}>
                    {round.roundLabel}
                  </Text>
                  <Tag
                    size="sm"
                    tone="brand"
                    label={`${round.games.length} game${round.games.length === 1 ? '' : 's'}`}
                  />
                </View>
                {round.games.map((game) => (
                  <View key={game.id} style={styles.previewRow}>
                    <View style={styles.previewTime}>
                      <Text
                        variant="caption"
                        color={colors.text.muted}
                      >
                        {formatDate(game.startsAtIso, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <Text variant="bodySm" color={colors.text.primary}>
                        {formatTime(game.startsAtIso)}
                      </Text>
                    </View>
                    <View style={styles.previewMatchup}>
                      <Text variant="bodySm" color={colors.text.primary}>
                        {game.homeTeamName}{' '}
                        <Text variant="caption" color={colors.text.muted}>vs</Text>{' '}
                        {game.awayTeamName}
                      </Text>
                      <Text variant="caption" color={colors.text.muted}>
                        {game.facilityName} · {game.spaceName}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            ))
          ) : (
            <Card>
              <EmptyState
                icon={
                  <Trophy
                    size={20}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                }
                title="Nothing to preview"
                description="Pick a league with at least 2 approved teams and try again."
              />
            </Card>
          )}
        </>
      ) : null}

      <View style={styles.footer}>
        <Button
          label="Back"
          variant="ghost"
          size="sm"
          leadingIcon={
            <ChevronLeft
              size={14}
              color={colors.brand.primary}
              strokeWidth={2.25}
            />
          }
          onPress={goPrev}
          disabled={generated}
        />
        <View style={styles.spacer} />
        <Button
          label={
            step === 'preview'
              ? generated
                ? 'Generated'
                : `Generate ${preview?.totalGames ?? 0} games`
              : 'Continue'
          }
          variant="solid"
          size="sm"
          onPress={goNext}
          disabled={generated || !stepValid}
        />
      </View>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 200 },
  label: { marginBottom: spacing.xs },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    backgroundColor: colors.surface.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  stepperItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  stepperItemActive: {
    backgroundColor: colors.brand.soft,
  },
  stepperItemHover: {
    backgroundColor: colors.surface.bg,
  },
  stepperItemDone: {},
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface.bg,
    borderWidth: 1,
    borderColor: colors.border.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  stepDotDone: {
    backgroundColor: colors.brand.deep,
    borderColor: colors.brand.deep,
  },

  leagueList: { gap: spacing.sm },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    backgroundColor: colors.surface.card,
  },
  leagueRowHover: { backgroundColor: colors.surface.bg },
  leagueRowSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  leagueRowBody: { flex: 1, gap: 2 },

  formatList: { gap: spacing.sm },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    backgroundColor: colors.surface.card,
  },
  formatRowHover: { backgroundColor: colors.surface.bg },
  formatRowSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  formatBody: { flex: 1, gap: 2 },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },

  weekdayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  dayChip: {
    minWidth: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.soft,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  dayChipHover: { backgroundColor: colors.brand.soft },

  previewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewBody: { flex: 1, gap: 2 },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  previewTime: { width: 88, gap: 2 },
  previewMatchup: { flex: 1, gap: 2 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  spacer: { flex: 1 },
});
