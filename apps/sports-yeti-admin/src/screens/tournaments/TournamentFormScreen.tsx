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
  TextArea,
  useFieldController,
} from '@sports-yeti/ui';
import {
  LEAGUES,
  tournamentById,
  tournamentFormSchema,
  type TournamentFormValues,
} from '@sports-yeti/mocks';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { useToast } from '../../ui';
import { spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

const FORMAT_OPTIONS = [
  { value: 'round_robin', label: 'Round-robin' },
  { value: 'single_elim', label: 'Single elimination' },
  { value: 'double_elim', label: 'Double elimination' },
  { value: 'round_robin_playoff', label: 'Round-robin · Playoff' },
  { value: 'self_scheduled', label: 'Self-scheduled' },
];

export function TournamentFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const toast = useToast();
  const editingId = route.params?.id;
  const editing = useMemo(
    () => (editingId ? tournamentById(editingId) : undefined),
    [editingId],
  );

  const defaultValues: TournamentFormValues = useMemo(
    () => ({
      name: editing?.name ?? '',
      format: editing?.format ?? 'single_elim',
      startIso: editing?.startIso ?? '',
      endIso: editing?.endIso ?? '',
      registrationClosesIso: editing?.registrationClosesIso ?? '',
      maxTeams: editing?.maxTeams ?? 16,
      feeCents: editing?.feeCents ?? 0,
      venue: editing?.venue ?? '',
      city: editing?.city ?? '',
      description: editing?.description ?? '',
    }),
    [editing],
  );

  return (
    <PageScroll>
      <PageHeader
        title={editing ? 'Edit tournament' : 'New tournament'}
        subtitle="A tournament is a one-off bracketed event teams register into, hosted by a single league."
        crumbs={[
          { label: 'Competition' },
          { label: 'Tournaments', route: 'Tournaments' },
          { label: editing ? editing.name : 'New tournament' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
      />
      <Form<TournamentFormValues>
        defaultValues={defaultValues}
        resolver={zodResolver(tournamentFormSchema)}
        onSubmit={async (values) => {
          toast.show({
            variant: 'success',
            title: editing ? 'Tournament updated' : 'Tournament created',
            description: `${values.name} saved (mock).`,
          });
          navigation.goBack();
        }}
      >
        <View style={styles.stack}>
          <FormSection title="Identity">
            <FormRow columns={2}>
              <NameField />
              <LeaguePickerField editingLeagueId={editing?.leagueId} />
            </FormRow>
            <FormatField />
          </FormSection>

          <FormSection title="Window">
            <FormRow columns={2}>
              <StartField />
              <EndField />
            </FormRow>
            <RegistrationClosesField />
          </FormSection>

          <FormSection title="Registration">
            <FormRow columns={2}>
              <MaxTeamsField />
              <FeeField />
            </FormRow>
          </FormSection>

          <FormSection title="Location">
            <FormRow columns={2}>
              <VenueField />
              <CityField />
            </FormRow>
            <DescriptionField />
          </FormSection>

          <FormActions
            submitLabel={editing ? 'Save changes' : 'Create tournament'}
            cancelLabel="Cancel"
            onCancel={() => navigation.goBack()}
          />
        </View>
      </Form>
    </PageScroll>
  );
}

function NameField() {
  const ctrl = useFieldController<TournamentFormValues, 'name'>({ name: 'name' });
  return (
    <FormField label="Name" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Yeti Summer Cup"
      />
    </FormField>
  );
}

interface LeaguePickerProps {
  editingLeagueId?: string;
}
function LeaguePickerField({ editingLeagueId }: LeaguePickerProps) {
  // Informational only — leagueId is set by the parent context in a real
  // form, matching the Season form's pinned league picker.
  const opts = LEAGUES.map((l) => ({ value: l.id, label: l.name }));
  return (
    <FormField label="League" description="A tournament belongs to a single league.">
      <Select
        options={opts}
        value={editingLeagueId ?? opts[0]?.value ?? ''}
        onChange={() => undefined}
      />
    </FormField>
  );
}

function FormatField() {
  const ctrl = useFieldController<TournamentFormValues, 'format'>({ name: 'format' });
  return (
    <FormField label="Format" required error={ctrl.error}>
      <Select
        options={FORMAT_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as TournamentFormValues['format'])}
      />
    </FormField>
  );
}

function StartField() {
  const ctrl = useFieldController<TournamentFormValues, 'startIso'>({ name: 'startIso' });
  return (
    <FormField label="Start date" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="2026-06-13"
      />
    </FormField>
  );
}

function EndField() {
  const ctrl = useFieldController<TournamentFormValues, 'endIso'>({ name: 'endIso' });
  return (
    <FormField label="End date" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="2026-06-14"
      />
    </FormField>
  );
}

function RegistrationClosesField() {
  const ctrl = useFieldController<TournamentFormValues, 'registrationClosesIso'>({
    name: 'registrationClosesIso',
  });
  return (
    <FormField
      label="Registration closes"
      description="Must be on or before the start date."
      required
      error={ctrl.error}
    >
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="2026-06-01"
      />
    </FormField>
  );
}

function MaxTeamsField() {
  const ctrl = useFieldController<TournamentFormValues, 'maxTeams'>({ name: 'maxTeams' });
  return (
    <FormField label="Max teams" required error={ctrl.error}>
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? 0)}
        onBlur={ctrl.onBlur}
        min={2}
        max={256}
        step={1}
      />
    </FormField>
  );
}

function FeeField() {
  const ctrl = useFieldController<TournamentFormValues, 'feeCents'>({ name: 'feeCents' });
  return (
    <FormField
      label="Entry fee (cents)"
      description="Per-team entry fee in cents. 0 = free."
      required
      error={ctrl.error}
    >
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? 0)}
        onBlur={ctrl.onBlur}
        min={0}
        step={500}
      />
    </FormField>
  );
}

function VenueField() {
  const ctrl = useFieldController<TournamentFormValues, 'venue'>({ name: 'venue' });
  return (
    <FormField label="Venue" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Yeti Center Fields"
      />
    </FormField>
  );
}

function CityField() {
  const ctrl = useFieldController<TournamentFormValues, 'city'>({ name: 'city' });
  return (
    <FormField label="City" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Denver, CO"
      />
    </FormField>
  );
}

function DescriptionField() {
  const ctrl = useFieldController<TournamentFormValues, 'description'>({
    name: 'description',
  });
  return (
    <FormField label="Description" error={ctrl.error}>
      <TextArea
        value={ctrl.value ?? ''}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Two-day single-elimination cup…"
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
