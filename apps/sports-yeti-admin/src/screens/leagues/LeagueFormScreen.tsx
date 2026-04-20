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
  Select,
  TextArea,
  useFieldController,
} from '@sports-yeti/ui';
import {
  leagueById,
  leagueFormSchema,
  SPORT_OPTIONS,
  type LeagueFormValues,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { useToast } from '../../ui';
import { spacing } from '../../theme';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

export function LeagueFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<
    RouteProp<{ params: { id?: string } }, 'params'>
  >();
  const toast = useToast();
  const editingId = route.params?.id;
  const editing = useMemo(
    () => (editingId ? leagueById(editingId) : undefined),
    [editingId],
  );

  const defaultValues: LeagueFormValues = useMemo(
    () => ({
      name: editing?.name ?? '',
      slug: editing?.slug ?? '',
      sport: editing?.sport ?? 'soccer',
      sportTagline: editing?.sportTagline ?? '',
      city: editing?.city ?? '',
      description: editing?.description ?? '',
      rulesUrl: editing?.rulesUrl ?? '',
    }),
    [editing],
  );

  return (
    <PageScroll>
      <PageHeader
        title={editing ? `Edit ${editing.name}` : 'New league'}
        subtitle="Identity, sport, and branding only — registration windows + fees live on the Season and Division forms."
        crumbs={[
          { label: 'Competition' },
          { label: 'Leagues', route: 'Leagues' },
          { label: editing ? editing.name : 'New league' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
      />
      <Form<LeagueFormValues>
        defaultValues={defaultValues}
        resolver={zodResolver(leagueFormSchema)}
        onSubmit={async (values) => {
          // eslint-disable-next-line no-console
          console.log('League form submit (mock)', values);
          toast.show({
            variant: 'success',
            title: editing ? 'League updated' : 'League created',
            description: `${values.name} saved (mock).`,
          });
          navigation.goBack();
        }}
      >
        <View style={styles.stack}>
          <FormSection title="Identity">
            <FormRow columns={2}>
              <NameField />
              <SlugField />
            </FormRow>
            <FormRow columns={2}>
              <SportField />
              <CityField />
            </FormRow>
            <SportTaglineField />
          </FormSection>

          <FormSection title="Description">
            <DescField />
            <RulesUrlField />
          </FormSection>

          <FormActions
            submitLabel={editing ? 'Save changes' : 'Create league'}
            cancelLabel="Cancel"
            onCancel={() => navigation.goBack()}
          />
        </View>
      </Form>
    </PageScroll>
  );
}

function NameField() {
  const ctrl = useFieldController<LeagueFormValues, 'name'>({ name: 'name' });
  return (
    <FormField label="Name" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Yeti Soccer"
      />
    </FormField>
  );
}

function SlugField() {
  const ctrl = useFieldController<LeagueFormValues, 'slug'>({ name: 'slug' });
  return (
    <FormField
      label="URL slug"
      description="Lowercase letters, numbers, and dashes."
      required
      error={ctrl.error}
    >
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="yeti-soccer"
      />
    </FormField>
  );
}

function SportField() {
  const ctrl = useFieldController<LeagueFormValues, 'sport'>({ name: 'sport' });
  return (
    <FormField label="Sport" required error={ctrl.error}>
      <Select
        options={SPORT_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as LeagueFormValues['sport'])}
      />
    </FormField>
  );
}

function CityField() {
  const ctrl = useFieldController<LeagueFormValues, 'city'>({ name: 'city' });
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

function SportTaglineField() {
  const ctrl = useFieldController<LeagueFormValues, 'sportTagline'>({
    name: 'sportTagline',
  });
  return (
    <FormField
      label="Sport tagline"
      description="Short copy for cards (e.g. “Co-ed 7v7 Outdoor”)."
      required
      error={ctrl.error}
    >
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Co-ed 7v7 Outdoor"
      />
    </FormField>
  );
}

function DescField() {
  const ctrl = useFieldController<LeagueFormValues, 'description'>({
    name: 'description',
  });
  return (
    <FormField label="Description" required error={ctrl.error}>
      <TextArea
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        minRows={3}
        maxRows={6}
        placeholder="Year-round 7v7 outdoor soccer at Yeti Center fields…"
      />
    </FormField>
  );
}

function RulesUrlField() {
  const ctrl = useFieldController<LeagueFormValues, 'rulesUrl'>({
    name: 'rulesUrl',
  });
  return (
    <FormField label="Rules URL" description="Optional link to the rule book." error={ctrl.error}>
      <Input
        value={ctrl.value ?? ''}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="https://"
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
