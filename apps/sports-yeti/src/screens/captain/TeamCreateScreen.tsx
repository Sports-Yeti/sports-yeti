import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormActions,
  FormField,
  FormSection,
  Input,
  Select,
  TextArea,
  useFieldController,
} from '@sports-yeti/ui';
import { SPORT_OPTIONS, type SportKey } from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';

const teamCreateSchema = z.object({
  name: z.string().min(2, 'Name is required').max(60),
  sport: z.enum(SPORT_OPTIONS.map((o) => o.value) as [SportKey, ...SportKey[]]),
  skillLevel: z.enum(['recreational', 'intermediate', 'competitive', 'elite']),
  city: z.string().min(2, 'City is required'),
  description: z.string().max(400).optional().or(z.literal('')),
});
type TeamCreateValues = z.infer<typeof teamCreateSchema>;

const SKILL_OPTIONS = [
  { value: 'recreational', label: 'Recreational' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'elite', label: 'Elite' },
];

export function TeamCreateScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const defaultValues: TeamCreateValues = {
    name: '',
    sport: 'soccer',
    skillLevel: 'recreational',
    city: '',
    description: '',
  };

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
          Create team
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <Text variant="body" color={colors.text.secondary}>
          Start as an independent team — apply to a division when you're
          ready.
        </Text>
        <Form<TeamCreateValues>
          defaultValues={defaultValues}
          resolver={zodResolver(teamCreateSchema)}
          onSubmit={async (v) => {
            // eslint-disable-next-line no-console
            console.log('Team create (mock)', v);
            toast.show({
              variant: 'success',
              title: 'Team created (mock)',
              description: `${v.name} is forming. Invite players next.`,
            });
            navigation.goBack();
          }}
        >
          <FormSection title="Identity">
            <NameField />
            <SportField />
            <SkillField />
            <CityField />
            <DescField />
          </FormSection>
          <FormActions
            submitLabel="Create team"
            cancelLabel="Cancel"
            onCancel={() => navigation.goBack()}
          />
        </Form>
      </ScrollView>
    </View>
  );
}

function NameField() {
  const ctrl = useFieldController<TeamCreateValues, 'name'>({ name: 'name' });
  return (
    <FormField label="Team name" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Aurora FC"
      />
    </FormField>
  );
}

function SportField() {
  const ctrl = useFieldController<TeamCreateValues, 'sport'>({ name: 'sport' });
  return (
    <FormField label="Sport" required error={ctrl.error}>
      <Select
        options={SPORT_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as SportKey)}
      />
    </FormField>
  );
}

function SkillField() {
  const ctrl = useFieldController<TeamCreateValues, 'skillLevel'>({
    name: 'skillLevel',
  });
  return (
    <FormField label="Skill level" required error={ctrl.error}>
      <Select
        options={SKILL_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as TeamCreateValues['skillLevel'])}
      />
    </FormField>
  );
}

function CityField() {
  const ctrl = useFieldController<TeamCreateValues, 'city'>({ name: 'city' });
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

function DescField() {
  const ctrl = useFieldController<TeamCreateValues, 'description'>({
    name: 'description',
  });
  return (
    <FormField
      label="Description"
      description="Optional — short copy for invites."
      error={ctrl.error}
    >
      <TextArea
        value={ctrl.value ?? ''}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        minRows={3}
        maxRows={6}
        placeholder="What kind of team are you building?"
      />
    </FormField>
  );
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
    gap: spacing.lg,
  },
});
