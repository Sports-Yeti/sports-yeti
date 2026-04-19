import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import {
  Button,
  Card,
  Input,
  Select,
  Tabs,
  Text,
  useToast,
} from '../../ui';
import { colors, spacing } from '../../theme';
import { LEAGUES } from '../../mocks/leagues';
import { TEAMS } from '../../mocks/teams';
import { FACILITIES } from '../../mocks/facilities';
import { peopleByKind } from '../../mocks/people';
import { type Game, type GameStatus } from '../../mocks/games';
import { useGameById, useScheduleStore } from '../../stores';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

type EditableStatus = Exclude<GameStatus, 'live'>;

interface FormState {
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  facilityId: string;
  spaceName: string;
  startsAtIso: string; // YYYY-MM-DDTHH:MM
  durationMinutes: string;
  refereeId: string;
  status: EditableStatus;
  homeScore: string;
  awayScore: string;
}

const STATUS_TABS: { key: EditableStatus; label: string }[] = [
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Final' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'postponed', label: 'Postponed' },
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function isoToLocalDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getUTCFullYear();
  const mm = pad2(d.getUTCMonth() + 1);
  const dd = pad2(d.getUTCDate());
  const hh = pad2(d.getUTCHours());
  const mi = pad2(d.getUTCMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function buildInitial(game: Game | undefined): FormState {
  if (game) {
    const start = new Date(game.startsAtIso).getTime();
    const end = new Date(game.endsAtIso).getTime();
    const dur = Math.max(15, Math.round((end - start) / 60_000));
    return {
      leagueId: game.leagueId,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      facilityId: game.facilityId,
      spaceName: game.spaceName,
      startsAtIso: isoToLocalDateTime(game.startsAtIso),
      durationMinutes: String(dur),
      refereeId: game.refereeAssignmentId ?? '',
      status: game.status === 'live' ? 'scheduled' : game.status,
      homeScore: game.homeScore !== undefined ? String(game.homeScore) : '',
      awayScore: game.awayScore !== undefined ? String(game.awayScore) : '',
    };
  }
  const firstLeague = LEAGUES[0]!;
  const firstFac = FACILITIES[0]!;
  return {
    leagueId: firstLeague.id,
    homeTeamId: '',
    awayTeamId: '',
    facilityId: firstFac.id,
    spaceName: firstFac.spaces[0]?.name ?? '',
    startsAtIso: '',
    durationMinutes: '90',
    refereeId: '',
    status: 'scheduled',
    homeScore: '',
    awayScore: '',
  };
}

export function GameFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const editingId = route.params?.id;
  const toast = useToast();
  const upsertGame = useScheduleStore((s) => s.upsertGame);
  const game = useGameById(editingId ?? '');

  const [form, setForm] = useState<FormState>(() => buildInitial(game));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => {
      if (key === 'leagueId' && value !== p.leagueId) {
        // Reset team picks when league changes.
        return { ...p, leagueId: value as string, homeTeamId: '', awayTeamId: '' };
      }
      if (key === 'facilityId' && value !== p.facilityId) {
        const fac = FACILITIES.find((f) => f.id === value);
        return {
          ...p,
          facilityId: value as string,
          spaceName: fac?.spaces[0]?.name ?? '',
        };
      }
      return { ...p, [key]: value };
    });

  const league = LEAGUES.find((l) => l.id === form.leagueId);
  const teamsInLeague = useMemo(
    () => TEAMS.filter((t) => t.leagueId === form.leagueId && t.status === 'approved'),
    [form.leagueId],
  );
  const facility = FACILITIES.find((f) => f.id === form.facilityId);
  const referees = useMemo(() => peopleByKind('referee'), []);

  const errors = {
    homeTeamId: !form.homeTeamId ? 'Pick the home team' : undefined,
    awayTeamId: !form.awayTeamId
      ? 'Pick the away team'
      : form.awayTeamId === form.homeTeamId
      ? "Home and away can't be the same team"
      : undefined,
    facilityId: !form.facilityId ? 'Pick a facility' : undefined,
    spaceName: !form.spaceName.trim() ? 'Pick a space' : undefined,
    startsAtIso:
      !form.startsAtIso || Number.isNaN(new Date(form.startsAtIso).getTime())
        ? 'Use YYYY-MM-DDTHH:MM (e.g. 2026-04-19T19:00)'
        : league && form.startsAtIso < league.seasonStartIso
        ? `Must be on or after ${league.seasonName} starts`
        : league && form.startsAtIso.slice(0, 10) > league.seasonEndIso
        ? `Must be on or before ${league.seasonName} ends`
        : undefined,
    durationMinutes:
      !form.durationMinutes ||
      Number.isNaN(Number(form.durationMinutes)) ||
      Number(form.durationMinutes) < 15
        ? 'At least 15 minutes'
        : undefined,
    homeScore:
      form.status === 'completed' && (!form.homeScore || Number.isNaN(Number(form.homeScore)))
        ? 'Required to mark final'
        : undefined,
    awayScore:
      form.status === 'completed' && (!form.awayScore || Number.isNaN(Number(form.awayScore)))
        ? 'Required to mark final'
        : undefined,
  } as const;

  const showError = (key: keyof typeof errors) =>
    submitted ? errors[key] : undefined;
  const isValid = Object.values(errors).every((e) => !e);

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid || !facility || !league) {
      toast.show({ variant: 'warning', title: 'Fix the highlighted fields' });
      return;
    }
    setSubmitting(true);
    const home = TEAMS.find((t) => t.id === form.homeTeamId)!;
    const away = TEAMS.find((t) => t.id === form.awayTeamId)!;
    const start = new Date(form.startsAtIso);
    const end = new Date(start.getTime() + Number(form.durationMinutes) * 60_000);
    const id = editingId ?? `manual-${form.leagueId}-${Date.now()}`;
    const next: Game = {
      id,
      leagueId: form.leagueId,
      leagueName: league.name,
      sport: home.sport,
      homeTeamId: home.id,
      homeTeamName: home.name,
      homeAbbreviation: home.abbreviation,
      awayTeamId: away.id,
      awayTeamName: away.name,
      awayAbbreviation: away.abbreviation,
      facilityId: facility.id,
      facilityName: facility.name,
      spaceName: form.spaceName.trim(),
      startsAtIso: start.toISOString(),
      endsAtIso: end.toISOString(),
      status: form.status,
      homeScore:
        form.status === 'completed' ? Number(form.homeScore) : undefined,
      awayScore:
        form.status === 'completed' ? Number(form.awayScore) : undefined,
      refereeAssignmentId: form.refereeId || undefined,
    };
    setTimeout(() => {
      setSubmitting(false);
      upsertGame(next);
      toast.show({
        variant: 'success',
        title: editingId
          ? 'Game updated'
          : `${home.abbreviation} vs ${away.abbreviation} created`,
        description: editingId
          ? 'Captains and referees were notified.'
          : 'Added to the schedule.',
      });
      navigation.goBack();
    }, 600);
  };

  return (
    <PageScroll>
      <PageHeader
        title={editingId ? 'Edit game' : 'New game'}
        subtitle={
          editingId
            ? 'Adjust the matchup, time, venue, scores, or referee.'
            : 'Schedule a one-off match. Use Generate fixtures to build an entire season.'
        }
        crumbs={[
          { label: 'Schedule', route: 'Schedule' },
          { label: editingId ? 'Edit' : 'New' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <>
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => navigation.goBack()}
              disabled={submitting}
            />
            <Button
              label={submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create game'}
              variant="solid"
              size="sm"
              onPress={handleSave}
              disabled={submitting}
            />
          </>
        }
      />

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          League &amp; teams
        </Text>
        <Select
          label="League"
          value={form.leagueId}
          options={LEAGUES.map((l) => ({ value: l.id, label: l.name }))}
          onChange={(v) => update('leagueId', v)}
        />
        <View style={styles.row}>
          <Select
            label="Home team"
            value={form.homeTeamId}
            options={teamsInLeague.map((t) => ({
              value: t.id,
              label: t.name,
            }))}
            onChange={(v) => update('homeTeamId', v)}
            error={showError('homeTeamId')}
            placeholder={
              teamsInLeague.length === 0
                ? 'No approved teams in this league'
                : 'Pick the home team'
            }
            disabled={teamsInLeague.length === 0}
          />
          <Select
            label="Away team"
            value={form.awayTeamId}
            options={teamsInLeague
              .filter((t) => t.id !== form.homeTeamId)
              .map((t) => ({ value: t.id, label: t.name }))}
            onChange={(v) => update('awayTeamId', v)}
            error={showError('awayTeamId')}
            placeholder={
              !form.homeTeamId
                ? 'Pick the home team first'
                : teamsInLeague.length < 2
                ? 'Not enough teams in this league'
                : 'Pick the away team'
            }
            disabled={!form.homeTeamId || teamsInLeague.length < 2}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Time &amp; venue
        </Text>
        <View style={styles.row}>
          <Input
            label="Starts at (YYYY-MM-DDTHH:MM)"
            value={form.startsAtIso}
            onChangeText={(v) => update('startsAtIso', v)}
            error={showError('startsAtIso')}
            placeholder="2026-04-19T19:00"
            containerStyle={styles.flex2}
          />
          <Input
            label="Duration (minutes)"
            variant="number"
            value={form.durationMinutes}
            onChangeText={(v) => update('durationMinutes', v)}
            error={showError('durationMinutes')}
            placeholder="90"
            containerStyle={styles.flex}
          />
        </View>
        <View style={styles.row}>
          <Select
            label="Facility"
            value={form.facilityId}
            options={FACILITIES.map((f) => ({ value: f.id, label: f.name }))}
            onChange={(v) => update('facilityId', v)}
            error={showError('facilityId')}
            width={280}
          />
          <Select
            label="Space"
            value={form.spaceName}
            options={(facility?.spaces ?? []).map((s) => ({
              value: s.name,
              label: s.name,
            }))}
            onChange={(v) => update('spaceName', v)}
            error={showError('spaceName')}
            disabled={!facility}
            width={280}
          />
        </View>
        <Select
          label="Referee (optional)"
          value={form.refereeId}
          options={[
            { value: '', label: 'Unassigned' },
            ...referees.map((r) => ({ value: r.id, label: r.name })),
          ]}
          onChange={(v) => update('refereeId', v)}
          width={320}
        />
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Status
        </Text>
        <Tabs
          items={STATUS_TABS}
          value={form.status}
          onChange={(v) => update('status', v as EditableStatus)}
          variant="segmented"
        />
        {form.status === 'completed' ? (
          <View style={styles.row}>
            <Input
              label="Home score"
              variant="number"
              value={form.homeScore}
              onChangeText={(v) => update('homeScore', v)}
              error={showError('homeScore')}
              placeholder="0"
              containerStyle={styles.flex}
            />
            <Input
              label="Away score"
              variant="number"
              value={form.awayScore}
              onChangeText={(v) => update('awayScore', v)}
              error={showError('awayScore')}
              placeholder="0"
              containerStyle={styles.flex}
            />
          </View>
        ) : null}
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 180 },
  flex2: { flex: 2, minWidth: 280 },
});
