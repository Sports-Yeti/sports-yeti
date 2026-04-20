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
  Toggle,
  useFieldController,
} from '@sports-yeti/ui';
import {
  rentalConfigForSpace,
  spaceById,
  spaceFormSchema,
  SPORT_OPTIONS,
  type SpaceFormValues,
} from '@sports-yeti/mocks';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { useToast } from '../../ui';
import { spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

const RENTAL_OPTIONS = [
  { value: 'internal', label: 'Internal — league play only' },
  { value: 'external', label: 'External — rental only' },
  { value: 'both', label: 'Both — split between league + rental' },
];

export function SpaceFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<
    RouteProp<{ params: { id?: string } }, 'params'>
  >();
  const toast = useToast();
  const editingId = route.params?.id;
  const editing = useMemo(
    () => (editingId ? spaceById(editingId) : undefined),
    [editingId],
  );
  const cfg = useMemo(
    () => (editing ? rentalConfigForSpace(editing.id) : undefined),
    [editing],
  );

  const defaultValues: SpaceFormValues = useMemo(
    () => ({
      name: editing?.name ?? '',
      sports: editing?.sports ?? [],
      surface: editing?.surface ?? '',
      capacity: editing?.capacity ?? 10,
      isIndoor: editing?.isIndoor ?? true,
      rentalMode: cfg?.rentalMode ?? 'internal',
      externalHourlyRateCents: cfg?.externalHourlyRateCents,
      internalLeagueIds: cfg?.internalLeagueIds,
    }),
    [editing, cfg],
  );

  return (
    <PageScroll>
      <PageHeader
        title={editing ? 'Edit space' : 'New space'}
        subtitle="A space is one rentable / playable slot inside a facility (a court, a field, a rink). Configure rental mode here."
        crumbs={[
          { label: 'Venues' },
          { label: 'Facilities', route: 'Facilities' },
          { label: editing ? editing.name : 'New space' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
      />
      <Form<SpaceFormValues>
        defaultValues={defaultValues}
        resolver={zodResolver(spaceFormSchema)}
        onSubmit={async (values) => {
          // eslint-disable-next-line no-console
          console.log('Space form submit (mock)', values);
          toast.show({
            variant: 'success',
            title: editing ? 'Space updated' : 'Space created',
            description: `${values.name} saved (mock).`,
          });
          navigation.goBack();
        }}
      >
        <View style={styles.stack}>
          <FormSection title="Identity">
            <FormRow columns={2}>
              <NameField />
              <SurfaceField />
            </FormRow>
            <FormRow columns={2}>
              <CapacityField />
              <IndoorField />
            </FormRow>
            <SportsField />
          </FormSection>

          <FormSection title="Rental">
            <RentalModeField />
            <RateField />
          </FormSection>

          <FormActions
            submitLabel={editing ? 'Save changes' : 'Create space'}
            cancelLabel="Cancel"
            onCancel={() => navigation.goBack()}
          />
        </View>
      </Form>
    </PageScroll>
  );
}

function NameField() {
  const ctrl = useFieldController<SpaceFormValues, 'name'>({ name: 'name' });
  return (
    <FormField label="Name" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Court A"
      />
    </FormField>
  );
}

function SurfaceField() {
  const ctrl = useFieldController<SpaceFormValues, 'surface'>({
    name: 'surface',
  });
  return (
    <FormField label="Surface" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Hardwood"
      />
    </FormField>
  );
}

function CapacityField() {
  const ctrl = useFieldController<SpaceFormValues, 'capacity'>({
    name: 'capacity',
  });
  return (
    <FormField label="Capacity" required error={ctrl.error}>
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? 0)}
        onBlur={ctrl.onBlur}
        min={1}
        max={2000}
        step={1}
      />
    </FormField>
  );
}

function IndoorField() {
  const ctrl = useFieldController<SpaceFormValues, 'isIndoor'>({
    name: 'isIndoor',
  });
  return (
    <FormField
      label="Indoor"
      description={ctrl.value ? 'Indoor surface' : 'Outdoor surface'}
      error={ctrl.error}
    >
      <Toggle value={ctrl.value} onValueChange={ctrl.onChange} />
    </FormField>
  );
}

function SportsField() {
  const ctrl = useFieldController<SpaceFormValues, 'sports'>({
    name: 'sports',
  });
  return (
    <FormField
      label="Supported sports"
      description="Multi-select. Drives discovery filters."
      required
      error={ctrl.error}
    >
      <Select
        multiple
        searchable
        options={SPORT_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as SpaceFormValues['sports'])}
      />
    </FormField>
  );
}

function RentalModeField() {
  const ctrl = useFieldController<SpaceFormValues, 'rentalMode'>({
    name: 'rentalMode',
  });
  return (
    <FormField label="Rental mode" required error={ctrl.error}>
      <Select
        options={RENTAL_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as SpaceFormValues['rentalMode'])}
      />
    </FormField>
  );
}

function RateField() {
  const ctrl = useFieldController<SpaceFormValues, 'externalHourlyRateCents'>({
    name: 'externalHourlyRateCents',
  });
  return (
    <FormField
      label="External hourly rate"
      description="Required when external rental is enabled."
      error={ctrl.error}
    >
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? undefined)}
        onBlur={ctrl.onBlur}
        format={{ style: 'currency', currency: 'USD' }}
        min={0}
        step={500}
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
