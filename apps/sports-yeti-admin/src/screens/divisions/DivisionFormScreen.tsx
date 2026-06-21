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
  divisionById,
  divisionFormSchema,
  type DivisionFormValues,
} from '@sports-yeti/mocks';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { useToast } from '../../ui';
import { spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

const SKILL_OPTIONS = [
  { value: 'recreational', label: 'Recreational' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'elite', label: 'Elite' },
];

export function DivisionFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<
    RouteProp<{ params: { id?: string } }, 'params'>
  >();
  const toast = useToast();
  const editingId = route.params?.id;
  const editing = useMemo(
    () => (editingId ? divisionById(editingId) : undefined),
    [editingId],
  );

  const defaultValues: DivisionFormValues = useMemo(
    () => ({
      name: editing?.name ?? '',
      skillLevel: editing?.skillLevel ?? 'recreational',
      ageBand: editing?.ageBand ?? '',
      maxTeams: editing?.maxTeams ?? 8,
      registrationFeeCents: editing?.registrationFeeCents ?? 0,
      registrationOpensIso: editing?.registrationOpensIso ?? '',
      registrationClosesIso: editing?.registrationClosesIso ?? '',
      rosterMin: editing?.rosterMin,
      rosterMax: editing?.rosterMax,
    }),
    [editing],
  );

  return (
    <PageScroll>
      <PageHeader
        title={editing ? 'Edit division' : 'New division'}
        subtitle="A division is the bucket teams actually apply to. Skill, fee, and registration window all live here."
        crumbs={[
          { label: 'Competition' },
          { label: 'Divisions', route: 'Divisions' },
          { label: editing ? editing.name : 'New division' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
      />
      <Form<DivisionFormValues>
        defaultValues={defaultValues}
        resolver={zodResolver(divisionFormSchema)}
        onSubmit={async (values) => {
          toast.show({
            variant: 'success',
            title: editing ? 'Division updated' : 'Division created',
            description: `${values.name} saved (mock).`,
          });
          navigation.goBack();
        }}
      >
        <View style={styles.stack}>
          <FormSection title="Identity">
            <FormRow columns={2}>
              <NameField />
              <SkillField />
            </FormRow>
            <FormRow columns={2}>
              <AgeBandField />
              <MaxTeamsField />
            </FormRow>
          </FormSection>

          <FormSection title="Money">
            <FeeField />
          </FormSection>

          <FormSection title="Registration window">
            <FormRow columns={2}>
              <RegOpensField />
              <RegClosesField />
            </FormRow>
          </FormSection>

          <FormSection title="Roster (optional)">
            <FormRow columns={2}>
              <RosterMinField />
              <RosterMaxField />
            </FormRow>
          </FormSection>

          <FormActions
            submitLabel={editing ? 'Save changes' : 'Create division'}
            cancelLabel="Cancel"
            onCancel={() => navigation.goBack()}
          />
        </View>
      </Form>
    </PageScroll>
  );
}

function NameField() {
  const ctrl = useFieldController<DivisionFormValues, 'name'>({ name: 'name' });
  return (
    <FormField label="Name" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Recreational D2"
      />
    </FormField>
  );
}

function SkillField() {
  const ctrl = useFieldController<DivisionFormValues, 'skillLevel'>({
    name: 'skillLevel',
  });
  return (
    <FormField label="Skill level" required error={ctrl.error}>
      <Select
        options={SKILL_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as DivisionFormValues['skillLevel'])}
      />
    </FormField>
  );
}

function AgeBandField() {
  const ctrl = useFieldController<DivisionFormValues, 'ageBand'>({
    name: 'ageBand',
  });
  return (
    <FormField label="Age band" description="Optional, e.g. 18+ or U14." error={ctrl.error}>
      <Input
        value={ctrl.value ?? ''}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="18+"
      />
    </FormField>
  );
}

function MaxTeamsField() {
  const ctrl = useFieldController<DivisionFormValues, 'maxTeams'>({
    name: 'maxTeams',
  });
  return (
    <FormField label="Max teams" required error={ctrl.error}>
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? 0)}
        onBlur={ctrl.onBlur}
        min={2}
        max={64}
        step={1}
      />
    </FormField>
  );
}

function FeeField() {
  const ctrl = useFieldController<DivisionFormValues, 'registrationFeeCents'>({
    name: 'registrationFeeCents',
  });
  return (
    <FormField
      label="Registration fee per team (cents)"
      description="Captain splits this across the roster (or sets a manual override)."
      required
      error={ctrl.error}
    >
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? 0)}
        onBlur={ctrl.onBlur}
        format={{ style: 'currency', currency: 'USD' }}
        min={0}
        step={100}
      />
    </FormField>
  );
}

function RegOpensField() {
  const ctrl = useFieldController<DivisionFormValues, 'registrationOpensIso'>({
    name: 'registrationOpensIso',
  });
  return (
    <FormField label="Registration opens" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="2026-02-15"
      />
    </FormField>
  );
}

function RegClosesField() {
  const ctrl = useFieldController<DivisionFormValues, 'registrationClosesIso'>({
    name: 'registrationClosesIso',
  });
  return (
    <FormField label="Registration closes" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="2026-04-05"
      />
    </FormField>
  );
}

function RosterMinField() {
  const ctrl = useFieldController<DivisionFormValues, 'rosterMin'>({
    name: 'rosterMin',
  });
  return (
    <FormField label="Roster minimum" description="Override the sport default." error={ctrl.error}>
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? undefined)}
        onBlur={ctrl.onBlur}
        min={1}
        max={50}
        step={1}
      />
    </FormField>
  );
}

function RosterMaxField() {
  const ctrl = useFieldController<DivisionFormValues, 'rosterMax'>({
    name: 'rosterMax',
  });
  return (
    <FormField label="Roster maximum" description="Override the sport default." error={ctrl.error}>
      <NumberInput
        value={ctrl.value ?? null}
        onChangeNumber={(v) => ctrl.onChange(v ?? undefined)}
        onBlur={ctrl.onBlur}
        min={1}
        max={50}
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
