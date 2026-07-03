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
import {
  DEMO_PLAYER_ID,
  teamsCaptainedBy,
} from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { useSubRequestsStore } from '../../features/sub-requests-store';

const subSchema = z.object({
  teamId: z.string().min(1, 'Pick a team'),
  position: z.string().min(2).max(40),
  skillLevel: z.enum(['recreational', 'intermediate', 'competitive', 'elite']),
  message: z.string().max(280).optional().or(z.literal('')),
});
type SubValues = z.infer<typeof subSchema>;

const SKILL_OPTIONS = [
  { value: 'recreational', label: 'Recreational' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'elite', label: 'Elite' },
];

export function SubRequestCreateScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const addRequest = useSubRequestsStore((s) => s.addRequest);
  const teams = teamsCaptainedBy(DEMO_PLAYER_ID);
  const teamOptions = teams.map((t) => ({ value: t.id, label: t.name }));

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
          Sub request
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
          Players who match see your request immediately. They apply, then
          you confirm one to fill the slot.
        </Text>

        <Form<SubValues>
          defaultValues={{
            teamId: teamOptions[0]?.value ?? '',
            position: '',
            skillLevel: 'recreational',
            message: '',
          }}
          resolver={zodResolver(subSchema)}
          onSubmit={async (v) => {
            // Session store — the request shows up on CaptainHome and in
            // the team's sub inbox immediately.
            addRequest({
              id: `sub-${Date.now()}`,
              gameId: '',
              teamId: v.teamId,
              position: v.position,
              skillLevel: v.skillLevel,
              message: v.message || undefined,
              status: 'open',
              applicantPlayerIds: [],
              createdAtIso: new Date().toISOString(),
            });
            toast.show({
              variant: 'success',
              title: 'Sub request posted',
              description: `${v.position} (${v.skillLevel}) — players who match will see it.`,
            });
            navigation.goBack();
          }}
        >
          <FormSection title="Request">
            <TeamField options={teamOptions} />
            <PositionField />
            <SkillField />
            <MessageField />
          </FormSection>
          <FormActions
            submitLabel="Post sub request"
            cancelLabel="Cancel"
            onCancel={() => navigation.goBack()}
          />
        </Form>
      </ScrollView>
    </View>
  );
}

interface OptProps {
  options: { value: string; label: string }[];
}
function TeamField({ options }: OptProps) {
  const ctrl = useFieldController<SubValues, 'teamId'>({ name: 'teamId' });
  return (
    <FormField label="Team" required error={ctrl.error}>
      <Select
        options={options}
        value={ctrl.value}
        onChange={ctrl.onChange}
      />
    </FormField>
  );
}

function PositionField() {
  const ctrl = useFieldController<SubValues, 'position'>({ name: 'position' });
  return (
    <FormField label="Position needed" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Defender"
      />
    </FormField>
  );
}

function SkillField() {
  const ctrl = useFieldController<SubValues, 'skillLevel'>({
    name: 'skillLevel',
  });
  return (
    <FormField label="Skill level" required error={ctrl.error}>
      <Select
        options={SKILL_OPTIONS}
        value={ctrl.value}
        onChange={(v) => ctrl.onChange(v as SubValues['skillLevel'])}
      />
    </FormField>
  );
}

function MessageField() {
  const ctrl = useFieldController<SubValues, 'message'>({ name: 'message' });
  return (
    <FormField label="Message" description="Optional, up to 280 chars." error={ctrl.error}>
      <TextArea
        value={ctrl.value ?? ''}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        minRows={3}
        maxRows={5}
        placeholder="Need someone reliable for week 12. We start at 10."
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
