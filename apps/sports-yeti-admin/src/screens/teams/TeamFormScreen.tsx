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
import { teamById, type TeamStatus } from '../../mocks/teams';
import { LEAGUES } from '../../mocks/leagues';
import { peopleByKind } from '../../mocks/people';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

interface FormState {
  name: string;
  abbreviation: string;
  leagueId: string;
  captainId: string;
  rosterMax: string;
  feePerPlayerDollars: string;
  status: Exclude<TeamStatus, 'rejected'>;
  description: string;
}

const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Active' },
  { key: 'archived', label: 'Archived' },
];

function dollarsFromCents(cents: number): string {
  return cents === 0 ? '' : (cents / 100).toFixed(2).replace(/\.00$/, '');
}

function suggestAbbreviation(name: string): string {
  const cleaned = name.trim().toUpperCase();
  if (!cleaned) return '';
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 3) return words.slice(0, 3).map((w) => w.charAt(0)).join('');
  if (words.length === 2) return (words[0].slice(0, 2) + words[1].charAt(0)).slice(0, 3);
  return cleaned.slice(0, 3);
}

function buildInitial(id?: string): FormState {
  const team = id ? teamById(id) : undefined;
  if (!team) {
    return {
      name: '',
      abbreviation: '',
      leagueId: LEAGUES[0]?.id ?? '',
      captainId: peopleByKind('player')[0]?.id ?? '',
      rosterMax: '16',
      feePerPlayerDollars: '',
      status: 'pending',
      description: '',
    };
  }
  return {
    name: team.name,
    abbreviation: team.abbreviation,
    leagueId: team.leagueId,
    captainId: team.captainId,
    rosterMax: String(team.rosterMax),
    feePerPlayerDollars: dollarsFromCents(team.feePerPlayerCents),
    status: team.status === 'rejected' ? 'pending' : team.status,
    description: team.description,
  };
}

export function TeamFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const editingId = route.params?.id;
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => buildInitial(editingId));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const players = useMemo(() => peopleByKind('player'), []);
  const leagueOptions = useMemo(
    () => LEAGUES.map((l) => ({ value: l.id, label: l.name })),
    [],
  );
  const captainOptions = useMemo(
    () => players.map((p) => ({ value: p.id, label: p.name })),
    [players],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const errors = {
    name: form.name.trim().length < 3 ? 'At least 3 characters' : undefined,
    abbreviation:
      form.abbreviation.trim().length < 2 || form.abbreviation.trim().length > 4
        ? '2–4 characters'
        : undefined,
    leagueId: !form.leagueId ? 'Pick a league' : undefined,
    captainId: !form.captainId ? 'Assign a captain' : undefined,
    rosterMax:
      !form.rosterMax ||
      Number.isNaN(Number(form.rosterMax)) ||
      Number(form.rosterMax) < 4
        ? '4 or more'
        : undefined,
    feePerPlayerDollars:
      form.feePerPlayerDollars && Number.isNaN(Number(form.feePerPlayerDollars))
        ? 'Numbers only'
        : undefined,
  } as const;

  const showError = (key: keyof typeof errors) =>
    submitted ? errors[key] : undefined;
  const isValid = Object.values(errors).every((e) => !e);

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid) {
      toast.show({ variant: 'warning', title: 'Fix the highlighted fields' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.show({
        variant: 'success',
        title: editingId ? `${form.name} updated` : `${form.name} created`,
        description: editingId
          ? 'Team details saved (mock).'
          : 'Team added — it now appears in the roster list (mock).',
      });
      navigation.goBack();
    }, 600);
  };

  const selectedLeague = LEAGUES.find((l) => l.id === form.leagueId);

  return (
    <PageScroll>
      <PageHeader
        title={editingId ? 'Edit team' : 'New team'}
        subtitle={
          editingId
            ? 'Update the squad’s league, captain, roster cap, and dues.'
            : 'Register a squad into a league and assign its captain.'
        }
        crumbs={[
          { label: 'Competition' },
          { label: 'Teams', route: 'Teams' },
          { label: editingId ? form.name || 'Edit' : 'New' },
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
              label={
                submitting
                  ? 'Saving…'
                  : editingId
                  ? 'Save changes'
                  : 'Create team'
              }
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
          Identity
        </Text>
        <View style={styles.row}>
          <Input
            label="Team name"
            value={form.name}
            onChangeText={(v) =>
              setForm((p) => ({
                ...p,
                name: v,
                // Auto-suggest abbreviation until the admin edits it.
                abbreviation:
                  p.abbreviation === suggestAbbreviation(p.name)
                    ? suggestAbbreviation(v)
                    : p.abbreviation,
              }))
            }
            error={showError('name')}
            placeholder="Avalanche FC"
            containerStyle={styles.flex}
          />
          <Input
            label="Abbreviation"
            value={form.abbreviation}
            onChangeText={(v) => update('abbreviation', v.toUpperCase().slice(0, 4))}
            error={showError('abbreviation')}
            placeholder="AVA"
            containerStyle={styles.abbrField}
          />
        </View>
        <Input
          label="Description"
          variant="multiline"
          value={form.description}
          onChangeText={(v) => update('description', v)}
          placeholder="Practice nights, vibe, level — anything captains should know."
        />
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          League &amp; captain
        </Text>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Select
              label="League"
              value={form.leagueId}
              options={leagueOptions}
              onChange={(v) => update('leagueId', v)}
            />
            {showError('leagueId') ? (
              <Text variant="caption" color={colors.status.error} style={styles.fieldError}>
                {showError('leagueId')}
              </Text>
            ) : selectedLeague ? (
              <Text variant="caption" color={colors.text.muted} style={styles.fieldError}>
                {selectedLeague.sportLabel} · {selectedLeague.city}
              </Text>
            ) : null}
          </View>
          <View style={styles.flex}>
            <Select
              label="Captain"
              value={form.captainId}
              options={captainOptions}
              onChange={(v) => update('captainId', v)}
            />
            {showError('captainId') ? (
              <Text variant="caption" color={colors.status.error} style={styles.fieldError}>
                {showError('captainId')}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Roster &amp; dues
        </Text>
        <View style={styles.row}>
          <Input
            label="Roster max"
            variant="number"
            value={form.rosterMax}
            onChangeText={(v) => update('rosterMax', v)}
            error={showError('rosterMax')}
            placeholder="16"
            containerStyle={styles.flex}
          />
          <Input
            label="Dues per player (USD)"
            variant="number"
            value={form.feePerPlayerDollars}
            onChangeText={(v) => update('feePerPlayerDollars', v)}
            error={showError('feePerPlayerDollars')}
            placeholder="120"
            containerStyle={styles.flex}
          />
        </View>
        <View>
          <Text variant="caption" color={colors.text.secondary} style={styles.label}>
            Status
          </Text>
          <Tabs
            items={STATUS_TABS}
            value={form.status}
            onChange={(v) => update('status', v as FormState['status'])}
            variant="segmented"
          />
        </View>
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 180 },
  abbrField: { width: 140 },
  label: { marginBottom: spacing.xs },
  fieldError: { marginTop: spacing.xs },
});
