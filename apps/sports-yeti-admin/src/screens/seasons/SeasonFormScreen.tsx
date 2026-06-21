import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormActions,
  FormField,
  FormRow,
  FormSection,
  Input,
  NumberInput,
  Select,
  useFieldController,
} from '@sports-yeti/ui';
import {
  LEAGUES,
  seasonById,
  seasonFormSchema,
  type SeasonFormValues,
} from '@sports-yeti/mocks';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { useToast } from '../../ui';
import { spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

const CYCLE_OPTIONS = [
  { value: 'spring_summer', label: 'Spring/Summer' },
  { value: 'fall_winter', label: 'Fall/Winter' },
];

const FORMAT_OPTIONS = [
  { value: 'round_robin', label: 'Round-robin' },
  { value: 'single_elim', label: 'Single elimination' },
  { value: 'double_elim', label: 'Double elimination' },
  { value: 'round_robin_playoff', label: 'Round-robin · Playoff' },
  { value: 'self_scheduled', label: 'Self-scheduled' },
];

export function SeasonFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<
    RouteProp<{ params: { id?: string } }, 'params'>
  >();
  const toast = useToast();
  const editingId = route.params?.id;
  const editing = useMemo(
    () => (editingId ? seasonById(editingId) : undefined),
    [editingId],
  );

  const defaultValues: SeasonFormValues = useMemo(
    () => ({
      label: editing?.label ?? '',
      cycle: editing?.cycle ?? 'spring_summer',
      year: editing?.year ?? new Date().getFullYear(),
      startIso: editing?.startIso ?? '',
      endIso: editing?.endIso ?? '',
      weeklySlotLabel: editing?.weeklySlotLabel ?? '',
      format: editing?.format ?? 'round_robin_playoff',
      regularWeeks: editing?.regularWeeks ?? 12,
      playoffWeeks: editing?.playoffWeeks ?? 3,
    }),
    [editing],
  );

  return (
    <PageScroll>
      <PageHeader
        title={editing ? 'Edit season' : 'New season'}
        subtitle="A season is a time-bounded run of a league. Each season hosts one or more divisions."
        crumbs={[
          { label: 'Competition' },
          { label: 'Seasons', route: 'Seasons' },
          { label: editing ? editing.label : 'New season' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
      />
      <Form<SeasonFormValues>
        defaultValues={defaultValues}
        resolver={zodResolver(seasonFormSchema)}
        onSubmit={async (values) => {
          toast.show({
            variant: 'success',
            title: editing ? 'Season updated' : 'Season created',
            description: `${values.label} saved (mock).`,
          });
          navigation.goBack();
        }}
      >
        <View style={styles.stack}>
          <FormSection title="Identity">
            <FormRow columns={2}>
              <LabelField />
              <LeaguePickerField editingLeagueId={editing?.leagueId} />
            </FormRow>
            <FormRow columns={2}>
              <CycleField />
              <YearField />
            </FormRow>
            <WeeklySlotField />
          </FormSection>

          <FormSection title="Window">
            <FormRow columns={2}>
              <StartField />
              <EndField />
            </FormRow>
          </FormSection>

          <FormSection title="Format">
            <FormatField />
            <FormRow columns={2}>
              <RegularWeeksField />
              <PlayoffWeeksField />
            </FormRow>
          </FormSection>

          <FormActions
            submitLabel={editing ? 'Save changes' : 'Create season'}
            cancelLabel="Cancel"
            onCancel={() => navigation.goBack()}
          />
        </View>
      </Form>
    </PageScroll>
  );
}

function LabelField() {
  const ctrl = useFieldController<SeasonFormValues, 'label'>({ name: 'label' });
  return (
    <FormField label="Label" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Spring/Summer 2026"
      />
    </FormField>
  );
}

interface LeaguePickerProps {
  editingLeagueId?: string;
}
function LeaguePickerField({ editingLeagueId }: LeaguePickerProps) {
  // Note: League picker is informational only — leagueId is not part of
  // SeasonFormValues for the schema (it's set by the parent context in
  // a real form). For Phase 1 mock, we display it pinned.
  const opts = LEAGUES.map((l) => ({ value: l.id, label: l.name }));
  return (
    <FormField
      label="League"
      description="A season belongs to a single league."
    >
      <Select
        options={opts}
        value={editingLeagueId ?? opts[0]?.value ?? ''}
        onChange={() => undefined}
      />
    </FormField>
  );
}

function CycleField() {
  const ctrl = useFieldController<SeasonFormValues, 'cycle'>({ name: 'cycle' });
  return (
    <FormField label="Cycle" required error={ctrl.error}>
      <Select
        options={CYCLE_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as SeasonFormValues['cycle'])}
      />
    </FormField>
  );
}

function YearField() {
  const ctrl = useFieldController<SeasonFormValues, 'year'>({ name: 'year' });
  return (
    <FormField label="Year" required error={ctrl.error}>
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? new Date().getFullYear())}
        onBlur={ctrl.onBlur}
        min={2020}
        max={2099}
        step={1}
      />
    </FormField>
  );
}

function WeeklySlotField() {
  const ctrl = useFieldController<SeasonFormValues, 'weeklySlotLabel'>({
    name: 'weeklySlotLabel',
  });
  return (
    <FormField
      label="Weekly slot"
      description="Optional canonical recurring slot label, e.g. “Sun · 9 AM – 1 PM”."
      error={ctrl.error}
    >
      <Input
        value={ctrl.value ?? ''}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Sun · 9 AM – 1 PM"
      />
    </FormField>
  );
}

function StartField() {
  const ctrl = useFieldController<SeasonFormValues, 'startIso'>({
    name: 'startIso',
  });
  return (
    <FormField label="Start date" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="2026-04-12"
      />
    </FormField>
  );
}

function EndField() {
  const ctrl = useFieldController<SeasonFormValues, 'endIso'>({
    name: 'endIso',
  });
  return (
    <FormField label="End date" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="2026-07-19"
      />
    </FormField>
  );
}

function FormatField() {
  const ctrl = useFieldController<SeasonFormValues, 'format'>({
    name: 'format',
  });
  return (
    <FormField label="Format" required error={ctrl.error}>
      <Select
        options={FORMAT_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as SeasonFormValues['format'])}
      />
    </FormField>
  );
}

function RegularWeeksField() {
  const ctrl = useFieldController<SeasonFormValues, 'regularWeeks'>({
    name: 'regularWeeks',
  });
  return (
    <FormField label="Regular weeks" required error={ctrl.error}>
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? 0)}
        onBlur={ctrl.onBlur}
        min={1}
        max={52}
        step={1}
      />
    </FormField>
  );
}

function PlayoffWeeksField() {
  const ctrl = useFieldController<SeasonFormValues, 'playoffWeeks'>({
    name: 'playoffWeeks',
  });
  return (
    <FormField label="Playoff weeks" required error={ctrl.error}>
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? 0)}
        onBlur={ctrl.onBlur}
        min={0}
        max={8}
        step={1}
      />
    </FormField>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
    width: '100%',
  },
});
