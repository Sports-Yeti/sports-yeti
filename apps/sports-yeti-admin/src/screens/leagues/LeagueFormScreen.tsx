import React, { useState } from 'react';
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
import {
  leagueById,
  SPORT_OPTIONS,
  type LeagueStatus,
  type SportKey,
} from '../../mocks/leagues';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

interface FormState {
  name: string;
  sport: SportKey;
  city: string;
  status: LeagueStatus;
  seasonName: string;
  seasonStartIso: string;
  seasonEndIso: string;
  registrationCloseIso: string;
  feeDollars: string;
  maxTeams: string;
  formatLabel: string;
  description: string;
}

const STATUS_TABS = [
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
];

function dollarsFromCents(cents: number): string {
  return cents === 0 ? '0' : (cents / 100).toFixed(2).replace(/\.00$/, '');
}

function buildInitial(id?: string): FormState {
  if (!id) {
    return {
      name: '',
      sport: 'soccer',
      city: '',
      status: 'draft',
      seasonName: '',
      seasonStartIso: '',
      seasonEndIso: '',
      registrationCloseIso: '',
      feeDollars: '',
      maxTeams: '',
      formatLabel: 'Round-robin',
      description: '',
    };
  }
  const league = leagueById(id);
  if (!league) {
    return buildInitial(undefined);
  }
  return {
    name: league.name,
    sport: league.sport,
    city: league.city,
    status: league.status === 'archived' ? 'draft' : league.status,
    seasonName: league.seasonName,
    seasonStartIso: league.seasonStartIso,
    seasonEndIso: league.seasonEndIso,
    registrationCloseIso: league.registrationCloseIso,
    feeDollars: dollarsFromCents(league.feeCents),
    maxTeams: String(league.maxTeams),
    formatLabel: league.formatLabel,
    description: league.description,
  };
}

export function LeagueFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const editingId = route.params?.id;
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => buildInitial(editingId));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const errors = {
    name: form.name.trim().length < 3 ? 'At least 3 characters' : undefined,
    city: !form.city.trim() ? 'Required' : undefined,
    seasonName: !form.seasonName.trim() ? 'Required' : undefined,
    seasonStartIso: !/^\d{4}-\d{2}-\d{2}$/.test(form.seasonStartIso)
      ? 'Use YYYY-MM-DD'
      : undefined,
    seasonEndIso: !/^\d{4}-\d{2}-\d{2}$/.test(form.seasonEndIso)
      ? 'Use YYYY-MM-DD'
      : form.seasonEndIso < form.seasonStartIso
      ? 'Must be on or after start'
      : undefined,
    registrationCloseIso: !/^\d{4}-\d{2}-\d{2}$/.test(form.registrationCloseIso)
      ? 'Use YYYY-MM-DD'
      : undefined,
    feeDollars: form.feeDollars && Number.isNaN(Number(form.feeDollars))
      ? 'Numbers only'
      : undefined,
    maxTeams:
      !form.maxTeams || Number.isNaN(Number(form.maxTeams)) || Number(form.maxTeams) < 2
        ? '2 or more'
        : undefined,
  } as const;

  const showError = (key: keyof typeof errors) =>
    submitted ? errors[key] : undefined;
  const isValid = Object.values(errors).every((e) => !e);

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid) {
      toast.show({
        variant: 'warning',
        title: 'Fix the highlighted fields',
      });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.show({
        variant: 'success',
        title: editingId ? `${form.name} updated` : `${form.name} created`,
        description: editingId
          ? 'Changes saved (mock).'
          : 'League added — open registration when ready.',
      });
      navigation.goBack();
    }, 600);
  };

  return (
    <PageScroll>
      <PageHeader
        title={editingId ? 'Edit league' : 'New league'}
        subtitle={
          editingId
            ? 'Update the season, fees, or rules. Players see updates on save.'
            : 'Set up a season, format, fee, and roster cap.'
        }
        crumbs={[
          { label: 'Leagues', route: 'Leagues' },
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
              label={submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create league'}
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
          Basics
        </Text>
        <Input
          label="League name"
          value={form.name}
          onChangeText={(v) => update('name', v)}
          error={showError('name')}
          placeholder="Mile High Spring League"
        />
        <View style={styles.row}>
          <Select
            label="Sport"
            value={form.sport}
            options={SPORT_OPTIONS}
            onChange={(v) => update('sport', v as SportKey)}
            width={220}
          />
          <Input
            label="City"
            value={form.city}
            onChangeText={(v) => update('city', v)}
            error={showError('city')}
            placeholder="Denver, CO"
            containerStyle={styles.flex}
          />
        </View>
        <View>
          <Text variant="caption" color={colors.text.secondary} style={styles.label}>
            Status
          </Text>
          <Tabs
            items={STATUS_TABS}
            value={form.status === 'archived' ? 'draft' : form.status}
            onChange={(v) => update('status', v as LeagueStatus)}
            variant="segmented"
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Season
        </Text>
        <Input
          label="Season name"
          value={form.seasonName}
          onChangeText={(v) => update('seasonName', v)}
          error={showError('seasonName')}
          placeholder="Spring 2026"
        />
        <View style={styles.row}>
          <Input
            label="Season start (YYYY-MM-DD)"
            value={form.seasonStartIso}
            onChangeText={(v) => update('seasonStartIso', v)}
            error={showError('seasonStartIso')}
            placeholder="2026-04-15"
            containerStyle={styles.flex}
          />
          <Input
            label="Season end (YYYY-MM-DD)"
            value={form.seasonEndIso}
            onChangeText={(v) => update('seasonEndIso', v)}
            error={showError('seasonEndIso')}
            placeholder="2026-06-30"
            containerStyle={styles.flex}
          />
          <Input
            label="Registration closes"
            value={form.registrationCloseIso}
            onChangeText={(v) => update('registrationCloseIso', v)}
            error={showError('registrationCloseIso')}
            placeholder="2026-04-08"
            containerStyle={styles.flex}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" color={colors.text.primary}>
          Fee &amp; format
        </Text>
        <View style={styles.row}>
          <Input
            label="Team fee (USD)"
            variant="number"
            value={form.feeDollars}
            onChangeText={(v) => update('feeDollars', v)}
            error={showError('feeDollars')}
            helpText="Charged at team registration"
            placeholder="1920"
            containerStyle={styles.flex}
          />
          <Input
            label="Max teams"
            variant="number"
            value={form.maxTeams}
            onChangeText={(v) => update('maxTeams', v)}
            error={showError('maxTeams')}
            placeholder="12"
            containerStyle={styles.flex}
          />
          <Input
            label="Format"
            value={form.formatLabel}
            onChangeText={(v) => update('formatLabel', v)}
            placeholder="Round-robin · Playoff"
            containerStyle={styles.flex}
          />
        </View>
        <Input
          label="Description"
          variant="multiline"
          value={form.description}
          onChangeText={(v) => update('description', v)}
          placeholder="What teams should know before registering."
        />
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 200 },
  label: { marginBottom: spacing.xs },
});
