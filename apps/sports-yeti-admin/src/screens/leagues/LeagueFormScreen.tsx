import React, { useMemo, useState } from 'react';
import { type WebPressableState } from '../../lib/pressable';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Check,
  ClipboardList,
  Eye,
  Goal,
  ListChecks,
  Save,
  Sparkles,
  Trophy,
  Users,
  Wand2,
} from 'lucide-react-native';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  CADENCE_OPTIONS,
  FORMAT_OPTIONS,
  LEAGUE_CADENCE_LABEL,
  LEAGUE_FORMAT_DESCRIPTION,
  LEAGUE_FORMAT_LABEL,
  LEAGUE_LEVEL_LABEL,
  LEVEL_OPTIONS,
  leagueById,
  SPORT_OPTIONS,
  type LeagueCadence,
  type LeagueFormat,
  type LeagueLevel,
  type LeagueStatus,
  type SportKey,
} from '../../mocks/leagues';
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

type StepKey = 'identity' | 'format' | 'registration' | 'schedule' | 'review';

interface FormState {
  // Step 1 — Identity
  name: string;
  sport: SportKey;
  city: string;
  level: LeagueLevel;
  seasonName: string;
  description: string;
  // Step 2 — Format
  format: LeagueFormat;
  divisionCount: string;
  // Step 3 — Registration
  registrationOpenIso: string;
  registrationCloseIso: string;
  feeDollars: string;
  maxTeams: string;
  // Step 4 — Schedule
  seasonStartIso: string;
  seasonEndIso: string;
  cadence: LeagueCadence;
  weeklySlotLabel: string;
  // Step 5 — Review / publish
  publishMode: 'draft' | 'publish_now' | 'schedule_publish';
}

const STEPS: { key: StepKey; label: string; icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }> }[] = [
  { key: 'identity', label: 'Identity', icon: Goal },
  { key: 'format', label: 'Format', icon: Trophy },
  { key: 'registration', label: 'Registration', icon: Users },
  { key: 'schedule', label: 'Schedule', icon: CalendarRange },
  { key: 'review', label: 'Review', icon: ListChecks },
];

function buildInitial(id?: string): FormState {
  if (id) {
    const league = leagueById(id);
    if (league) {
      return {
        name: league.name,
        sport: league.sport,
        city: league.city,
        level: league.level,
        seasonName: league.seasonName,
        description: league.description,
        format: league.format,
        divisionCount: String(league.divisionCount),
        registrationOpenIso: league.registrationOpenIso,
        registrationCloseIso: league.registrationCloseIso,
        feeDollars: league.feeCents === 0 ? '0' : (league.feeCents / 100).toFixed(2).replace(/\.00$/, ''),
        maxTeams: String(league.maxTeams),
        seasonStartIso: league.seasonStartIso,
        seasonEndIso: league.seasonEndIso,
        cadence: league.cadence,
        weeklySlotLabel: league.weeklySlotLabel,
        publishMode:
          league.status === 'published' ? 'publish_now' : 'draft',
      };
    }
  }
  return {
    name: '',
    sport: 'soccer',
    city: '',
    level: 'recreational',
    seasonName: '',
    description: '',
    format: 'round_robin',
    divisionCount: '1',
    registrationOpenIso: '',
    registrationCloseIso: '',
    feeDollars: '',
    maxTeams: '',
    seasonStartIso: '',
    seasonEndIso: '',
    cadence: 'weekly',
    weeklySlotLabel: '',
    publishMode: 'draft',
  };
}

function isoLooksValid(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

interface StepErrors {
  identity: Partial<Record<'name' | 'city' | 'seasonName', string>>;
  format: Partial<Record<'divisionCount', string>>;
  registration: Partial<
    Record<
      'registrationOpenIso' | 'registrationCloseIso' | 'feeDollars' | 'maxTeams',
      string
    >
  >;
  schedule: Partial<
    Record<'seasonStartIso' | 'seasonEndIso' | 'weeklySlotLabel', string>
  >;
  review: Record<string, string>;
}

function validate(form: FormState): StepErrors {
  const errs: StepErrors = {
    identity: {},
    format: {},
    registration: {},
    schedule: {},
    review: {},
  };
  if (form.name.trim().length < 3) errs.identity.name = 'At least 3 characters';
  if (!form.city.trim()) errs.identity.city = 'Required';
  if (!form.seasonName.trim()) errs.identity.seasonName = 'Required';

  const divisions = Number(form.divisionCount);
  if (!form.divisionCount || Number.isNaN(divisions) || divisions < 1) {
    errs.format.divisionCount = '1 or more';
  }

  if (!isoLooksValid(form.registrationOpenIso)) {
    errs.registration.registrationOpenIso = 'Use YYYY-MM-DD';
  }
  if (!isoLooksValid(form.registrationCloseIso)) {
    errs.registration.registrationCloseIso = 'Use YYYY-MM-DD';
  } else if (
    isoLooksValid(form.registrationOpenIso) &&
    form.registrationCloseIso < form.registrationOpenIso
  ) {
    errs.registration.registrationCloseIso = 'Must be on or after open';
  }
  if (form.feeDollars && Number.isNaN(Number(form.feeDollars))) {
    errs.registration.feeDollars = 'Numbers only';
  }
  const teams = Number(form.maxTeams);
  if (!form.maxTeams || Number.isNaN(teams) || teams < 2) {
    errs.registration.maxTeams = '2 or more';
  }

  if (!isoLooksValid(form.seasonStartIso)) {
    errs.schedule.seasonStartIso = 'Use YYYY-MM-DD';
  }
  if (!isoLooksValid(form.seasonEndIso)) {
    errs.schedule.seasonEndIso = 'Use YYYY-MM-DD';
  } else if (
    isoLooksValid(form.seasonStartIso) &&
    form.seasonEndIso < form.seasonStartIso
  ) {
    errs.schedule.seasonEndIso = 'Must be on or after start';
  }
  if (!form.weeklySlotLabel.trim()) {
    errs.schedule.weeklySlotLabel = 'Required';
  }

  return errs;
}

function isStepValid(step: StepKey, errs: StepErrors): boolean {
  const slice = errs[step];
  return Object.values(slice).every((e) => !e);
}

export function LeagueFormScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id?: string } }, 'params'>>();
  const editingId = route.params?.id;
  const toast = useToast();

  const [form, setForm] = useState<FormState>(() => buildInitial(editingId));
  const [stepIndex, setStepIndex] = useState(0);
  const [touchedSteps, setTouchedSteps] = useState<Set<StepKey>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const initialForm = useMemo(() => buildInitial(editingId), [editingId]);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const errors = useMemo(() => validate(form), [form]);
  const currentStep = STEPS[stepIndex]!;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const stepHasError = (key: StepKey) =>
    touchedSteps.has(key) && !isStepValid(key, errors);

  const handleAdvance = () => {
    setTouchedSteps((prev) => new Set(prev).add(currentStep.key));
    if (!isStepValid(currentStep.key, errors)) {
      toast.show({
        variant: 'warning',
        title: 'Fix the highlighted fields',
      });
      return;
    }
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleCancel = () => {
    if (isDirty) {
      setConfirmCancel(true);
      return;
    }
    navigation.goBack();
  };

  const handleSaveDraft = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.show({
        variant: 'success',
        title: editingId ? `${form.name} saved as draft` : `Draft "${form.name || 'Untitled'}" saved`,
        description: 'You can keep editing whenever.',
      });
      navigation.goBack();
    }, 500);
  };

  const handlePublish = () => {
    // Force-validate every step.
    setTouchedSteps(new Set(STEPS.map((s) => s.key)));
    const allValid = (Object.keys(errors) as StepKey[])
      .filter((k) => k !== 'review')
      .every((k) => isStepValid(k, errors));
    if (!allValid) {
      toast.show({
        variant: 'warning',
        title: 'Some steps have issues',
        description: 'Fix the steps marked with a red dot before publishing.',
      });
      return;
    }
    setSubmitting(true);
    const status: LeagueStatus =
      form.publishMode === 'publish_now' ? 'published' : 'draft';
    const verb =
      form.publishMode === 'publish_now'
        ? 'published'
        : form.publishMode === 'schedule_publish'
        ? 'scheduled'
        : 'saved';
    setTimeout(() => {
      setSubmitting(false);
      toast.show({
        variant: 'success',
        title: editingId ? `${form.name} ${verb}` : `${form.name} ${verb}`,
        description:
          status === 'published'
            ? `Open for registration through ${form.registrationCloseIso}.`
            : 'Draft created — publish when you are ready.',
      });
      navigation.goBack();
    }, 700);
  };

  return (
    <PageScroll>
      <PageHeader
        title={editingId ? `Edit ${form.name || 'league'}` : 'New league'}
        subtitle="Create a league in five steps. You can save as a draft at any point and come back later."
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
              onPress={handleCancel}
              disabled={submitting}
            />
            <Button
              label={submitting ? 'Saving…' : 'Save draft'}
              variant="outline"
              size="sm"
              onPress={handleSaveDraft}
              disabled={submitting}
              leadingIcon={
                <Save
                  size={14}
                  color={colors.brand.primary}
                  strokeWidth={2.5}
                />
              }
            />
          </>
        }
      />

      <View style={styles.layout}>
        {/* LEFT — step rail */}
        <Card style={styles.rail}>
          <Text variant="caption" color={colors.text.muted} style={styles.railEyebrow}>
            STEP {stepIndex + 1} OF {STEPS.length}
          </Text>
          <View style={styles.railList}>
            {STEPS.map((step, idx) => {
              const isCurrent = idx === stepIndex;
              const isComplete = idx < stepIndex;
              const hasError = stepHasError(step.key);
              return (
                <Pressable
                  key={step.key}
                  onPress={() => setStepIndex(idx)}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to ${step.label} step`}
                  accessibilityState={{ selected: isCurrent }}
                  style={({ hovered }: WebPressableState) => [
                    styles.railRow,
                    hovered ? styles.railRowHover : null,
                    isCurrent ? styles.railRowActive : null,
                  ]}
                >
                  <View
                    style={[
                      styles.railBadge,
                      isCurrent ? styles.railBadgeActive : null,
                      isComplete ? styles.railBadgeComplete : null,
                      hasError ? styles.railBadgeError : null,
                    ]}
                  >
                    {isComplete && !hasError ? (
                      <Check
                        size={12}
                        color={colors.text.inverse}
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Text
                        variant="caption"
                        color={
                          isCurrent
                            ? colors.text.inverse
                            : hasError
                            ? colors.text.inverse
                            : colors.text.muted
                        }
                      >
                        {idx + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    variant="bodySm"
                    color={
                      isCurrent ? colors.text.primary : colors.text.secondary
                    }
                    weight={isCurrent ? '600' : '500'}
                  >
                    {step.label}
                  </Text>
                  {hasError ? (
                    <View style={styles.railErrorDot} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* RIGHT — step body */}
        <View style={styles.body}>
          {currentStep.key === 'identity' ? (
            <IdentityStep
              form={form}
              errors={errors.identity}
              showErrors={touchedSteps.has('identity')}
              onChange={update}
            />
          ) : currentStep.key === 'format' ? (
            <FormatStep
              form={form}
              errors={errors.format}
              showErrors={touchedSteps.has('format')}
              onChange={update}
            />
          ) : currentStep.key === 'registration' ? (
            <RegistrationStep
              form={form}
              errors={errors.registration}
              showErrors={touchedSteps.has('registration')}
              onChange={update}
            />
          ) : currentStep.key === 'schedule' ? (
            <ScheduleStep
              form={form}
              errors={errors.schedule}
              showErrors={touchedSteps.has('schedule')}
              onChange={update}
            />
          ) : (
            <ReviewStep
              form={form}
              onChange={update}
              onJumpToStep={(k) =>
                setStepIndex(STEPS.findIndex((s) => s.key === k))
              }
            />
          )}

          <Card>
            <View style={styles.wizardFooter}>
              <View>
                <Text variant="caption" color={colors.text.muted}>
                  {isDirty ? 'Unsaved changes' : 'All changes saved'}
                </Text>
                <Text variant="bodySm" color={colors.text.secondary}>
                  {currentStep.label} · Step {stepIndex + 1} of {STEPS.length}
                </Text>
              </View>
              <View style={styles.wizardFooterActions}>
                {stepIndex > 0 ? (
                  <Button
                    label="Back"
                    variant="ghost"
                    size="md"
                    leadingIcon={
                      <ArrowLeft
                        size={14}
                        color={colors.brand.primary}
                        strokeWidth={2.5}
                      />
                    }
                    onPress={handleBack}
                    disabled={submitting}
                  />
                ) : null}
                {stepIndex < STEPS.length - 1 ? (
                  <Button
                    label="Continue"
                    variant="solid"
                    size="md"
                    trailingIcon={
                      <ArrowRight
                        size={14}
                        color={colors.text.inverse}
                        strokeWidth={2.5}
                      />
                    }
                    onPress={handleAdvance}
                    disabled={submitting}
                  />
                ) : (
                  <Button
                    label={
                      submitting
                        ? 'Saving…'
                        : form.publishMode === 'publish_now'
                        ? 'Publish league'
                        : form.publishMode === 'schedule_publish'
                        ? 'Schedule publish'
                        : 'Save as draft'
                    }
                    variant="solid"
                    size="md"
                    trailingIcon={
                      <Sparkles
                        size={14}
                        color={colors.text.inverse}
                        strokeWidth={2.5}
                      />
                    }
                    onPress={handlePublish}
                    disabled={submitting}
                  />
                )}
              </View>
            </View>
          </Card>
        </View>
      </View>

      <Modal
        visible={confirmCancel}
        onRequestClose={() => setConfirmCancel(false)}
        title="Discard changes?"
        description="You have unsaved edits. They will be lost if you leave without saving."
        variant="destructive"
        primaryAction={{
          label: 'Discard',
          onPress: () => {
            setConfirmCancel(false);
            navigation.goBack();
          },
        }}
        secondaryAction={{
          label: 'Keep editing',
          onPress: () => setConfirmCancel(false),
        }}
      />
    </PageScroll>
  );
}

// ---------------------------------------------------------------------------
// Step bodies
// ---------------------------------------------------------------------------

interface StepProps {
  form: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  showErrors: boolean;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

function StepHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.stepHead}>
      <View style={styles.stepIconBubble}>{icon}</View>
      <View style={styles.stepHeadBody}>
        <Text variant="h2" color={colors.text.primary}>
          {title}
        </Text>
        <Text variant="bodySm" color={colors.text.muted}>
          {description}
        </Text>
      </View>
    </View>
  );
}

function IdentityStep({ form, errors, showErrors, onChange }: StepProps) {
  return (
    <Card>
      <StepHeading
        icon={<Goal size={18} color={colors.brand.primary} strokeWidth={2.25} />}
        title="What is the league?"
        description="Name it, pick a sport, and tell players what to expect."
      />
      <View style={styles.fieldStack}>
        <Input
          label="League name"
          value={form.name}
          onChangeText={(v) => onChange('name', v)}
          error={showErrors ? errors.name : undefined}
          placeholder="Mile High Spring League"
        />
        <View style={styles.fieldRow}>
          <Select
            label="Sport"
            value={form.sport}
            options={SPORT_OPTIONS}
            onChange={(v) => onChange('sport', v as SportKey)}
            width={220}
          />
          <Input
            label="City"
            value={form.city}
            onChangeText={(v) => onChange('city', v)}
            error={showErrors ? errors.city : undefined}
            placeholder="Denver, CO"
            containerStyle={styles.flex}
          />
        </View>
        <View style={styles.fieldRow}>
          <Select
            label="Skill level"
            value={form.level}
            options={LEVEL_OPTIONS}
            onChange={(v) => onChange('level', v as LeagueLevel)}
            width={220}
          />
          <Input
            label="Season name"
            value={form.seasonName}
            onChangeText={(v) => onChange('seasonName', v)}
            error={showErrors ? errors.seasonName : undefined}
            placeholder="Spring 2026"
            containerStyle={styles.flex}
          />
        </View>
        <Input
          label="Description"
          variant="multiline"
          value={form.description}
          onChangeText={(v) => onChange('description', v)}
          placeholder="What teams should know before registering."
        />
      </View>
    </Card>
  );
}

function FormatStep({ form, errors, showErrors, onChange }: StepProps) {
  return (
    <Card>
      <StepHeading
        icon={<Trophy size={18} color={colors.brand.primary} strokeWidth={2.25} />}
        title="How is the league played?"
        description="Pick a competition format and how many divisions to split teams into."
      />
      <View style={styles.fieldStack}>
        <View>
          <Text
            variant="caption"
            color={colors.text.secondary}
            style={styles.label}
          >
            Format
          </Text>
          <View style={styles.formatGrid}>
            {FORMAT_OPTIONS.map((opt) => {
              const selected = form.format === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => onChange('format', opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={opt.label}
                  style={({ hovered }: WebPressableState) => [
                    styles.formatCard,
                    hovered ? styles.formatCardHover : null,
                    selected ? styles.formatCardSelected : null,
                  ]}
                >
                  <View style={styles.formatHead}>
                    <Text variant="bodySm" color={colors.text.primary} weight="600">
                      {opt.label}
                    </Text>
                    <View
                      style={[
                        styles.formatRadio,
                        selected ? styles.formatRadioSelected : null,
                      ]}
                    >
                      {selected ? (
                        <Check
                          size={10}
                          color={colors.text.inverse}
                          strokeWidth={3}
                        />
                      ) : null}
                    </View>
                  </View>
                  <Text variant="caption" color={colors.text.muted}>
                    {LEAGUE_FORMAT_DESCRIPTION[opt.value]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.fieldRow}>
          <Input
            label="Number of divisions"
            variant="number"
            value={form.divisionCount}
            onChangeText={(v) => onChange('divisionCount', v)}
            error={showErrors ? errors.divisionCount : undefined}
            placeholder="2"
            helpText="Use 1 for a single-pool league."
            containerStyle={styles.flex}
          />
        </View>
      </View>
    </Card>
  );
}

function RegistrationStep({
  form,
  errors,
  showErrors,
  onChange,
}: StepProps) {
  const feeCents = (() => {
    const n = Number(form.feeDollars);
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  })();
  return (
    <Card>
      <StepHeading
        icon={<Users size={18} color={colors.brand.primary} strokeWidth={2.25} />}
        title="When do teams register and how much?"
        description="Set the registration window, fee, and roster cap."
      />
      <View style={styles.fieldStack}>
        <View style={styles.fieldRow}>
          <Input
            label="Registration opens (YYYY-MM-DD)"
            value={form.registrationOpenIso}
            onChangeText={(v) => onChange('registrationOpenIso', v)}
            error={showErrors ? errors.registrationOpenIso : undefined}
            placeholder="2026-02-15"
            containerStyle={styles.flex}
          />
          <Input
            label="Registration closes (YYYY-MM-DD)"
            value={form.registrationCloseIso}
            onChangeText={(v) => onChange('registrationCloseIso', v)}
            error={showErrors ? errors.registrationCloseIso : undefined}
            placeholder="2026-04-08"
            containerStyle={styles.flex}
          />
        </View>
        <View style={styles.fieldRow}>
          <Input
            label="Team fee (USD)"
            variant="number"
            value={form.feeDollars}
            onChangeText={(v) => onChange('feeDollars', v)}
            error={showErrors ? errors.feeDollars : undefined}
            helpText={`Charged per team — ${formatCurrency(feeCents)} preview`}
            placeholder="1920"
            containerStyle={styles.flex}
          />
          <Input
            label="Max teams"
            variant="number"
            value={form.maxTeams}
            onChangeText={(v) => onChange('maxTeams', v)}
            error={showErrors ? errors.maxTeams : undefined}
            placeholder="12"
            containerStyle={styles.flex}
          />
        </View>
      </View>
    </Card>
  );
}

function ScheduleStep({ form, errors, showErrors, onChange }: StepProps) {
  return (
    <Card>
      <StepHeading
        icon={
          <CalendarRange
            size={18}
            color={colors.brand.primary}
            strokeWidth={2.25}
          />
        }
        title="When does the season run?"
        description="Anchor your weekly slot and the season window. The fixture generator picks it up next."
      />
      <View style={styles.fieldStack}>
        <View style={styles.fieldRow}>
          <Input
            label="Season start"
            value={form.seasonStartIso}
            onChangeText={(v) => onChange('seasonStartIso', v)}
            error={showErrors ? errors.seasonStartIso : undefined}
            placeholder="2026-04-15"
            containerStyle={styles.flex}
          />
          <Input
            label="Season end"
            value={form.seasonEndIso}
            onChangeText={(v) => onChange('seasonEndIso', v)}
            error={showErrors ? errors.seasonEndIso : undefined}
            placeholder="2026-06-30"
            containerStyle={styles.flex}
          />
        </View>
        <View style={styles.fieldRow}>
          <Select
            label="Cadence"
            value={form.cadence}
            options={CADENCE_OPTIONS}
            onChange={(v) => onChange('cadence', v as LeagueCadence)}
            width={220}
          />
          <Input
            label="Weekly slot label"
            value={form.weeklySlotLabel}
            onChangeText={(v) => onChange('weeklySlotLabel', v)}
            error={showErrors ? errors.weeklySlotLabel : undefined}
            placeholder="Sun · 9 AM – 1 PM"
            helpText="What teams will see in their schedule"
            containerStyle={styles.flex}
          />
        </View>
        <View style={styles.helperBlock}>
          <Wand2 size={14} color={colors.brand.primary} strokeWidth={2.25} />
          <Text variant="caption" color={colors.text.secondary}>
            After saving, run the Fixture Generator to lay out matches against
            your facility availability.
          </Text>
        </View>
      </View>
    </Card>
  );
}

interface ReviewStepProps {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onJumpToStep: (key: StepKey) => void;
}

function ReviewStep({ form, onChange, onJumpToStep }: ReviewStepProps) {
  const feeCents = (() => {
    const n = Number(form.feeDollars);
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  })();
  return (
    <View style={styles.fieldStack}>
      <Card>
        <StepHeading
          icon={<Eye size={18} color={colors.brand.primary} strokeWidth={2.25} />}
          title="Review and publish"
          description="Confirm the highlights, then choose how to release the league."
        />
        <View style={styles.summaryGrid}>
          <SummaryGroup
            label="Identity"
            onEdit={() => onJumpToStep('identity')}
            rows={[
              ['Name', form.name || '—'],
              [
                'Sport',
                SPORT_OPTIONS.find((s) => s.value === form.sport)?.label ?? form.sport,
              ],
              ['City', form.city || '—'],
              ['Level', LEAGUE_LEVEL_LABEL[form.level]],
              ['Season', form.seasonName || '—'],
            ]}
          />
          <SummaryGroup
            label="Format"
            onEdit={() => onJumpToStep('format')}
            rows={[
              ['Format', LEAGUE_FORMAT_LABEL[form.format]],
              ['Divisions', form.divisionCount || '—'],
            ]}
          />
          <SummaryGroup
            label="Registration"
            onEdit={() => onJumpToStep('registration')}
            rows={[
              ['Opens', form.registrationOpenIso || '—'],
              ['Closes', form.registrationCloseIso || '—'],
              [
                'Team fee',
                feeCents === 0 ? 'Free' : formatCurrency(feeCents),
              ],
              ['Max teams', form.maxTeams || '—'],
            ]}
          />
          <SummaryGroup
            label="Schedule"
            onEdit={() => onJumpToStep('schedule')}
            rows={[
              ['Starts', form.seasonStartIso || '—'],
              ['Ends', form.seasonEndIso || '—'],
              ['Cadence', LEAGUE_CADENCE_LABEL[form.cadence]],
              ['Weekly slot', form.weeklySlotLabel || '—'],
            ]}
          />
        </View>
      </Card>

      <Card>
        <StepHeading
          icon={
            <ClipboardList
              size={18}
              color={colors.brand.primary}
              strokeWidth={2.25}
            />
          }
          title="How should we release it?"
          description="You can flip to live whenever — drafts are always editable."
        />
        <View style={styles.publishOptions}>
          <PublishOption
            value="draft"
            label="Save as draft"
            description="Keep working on it. Nothing visible to teams yet."
            tone="neutral"
            selected={form.publishMode === 'draft'}
            onSelect={() => onChange('publishMode', 'draft')}
          />
          <PublishOption
            value="publish_now"
            label="Publish now"
            description="Open registration immediately and notify subscribed players."
            tone="brand"
            selected={form.publishMode === 'publish_now'}
            onSelect={() => onChange('publishMode', 'publish_now')}
          />
          <PublishOption
            value="schedule_publish"
            label="Schedule publish"
            description="Auto-publish when registration window opens."
            tone="alpine"
            selected={form.publishMode === 'schedule_publish'}
            onSelect={() => onChange('publishMode', 'schedule_publish')}
          />
        </View>
      </Card>
    </View>
  );
}

interface SummaryGroupProps {
  label: string;
  rows: [string, string][];
  onEdit: () => void;
}

function SummaryGroup({ label, rows, onEdit }: SummaryGroupProps) {
  return (
    <View style={styles.summaryGroup}>
      <View style={styles.summaryGroupHead}>
        <Text variant="caption" color={colors.text.muted}>
          {label.toUpperCase()}
        </Text>
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${label} step`}
          hitSlop={6}
        >
          <Text variant="caption" color={colors.brand.primary}>
            Edit
          </Text>
        </Pressable>
      </View>
      <View style={styles.summaryRows}>
        {rows.map(([k, v]) => (
          <View key={k} style={styles.summaryRow}>
            <Text variant="caption" color={colors.text.muted}>
              {k}
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {v}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface PublishOptionProps {
  value: FormState['publishMode'];
  label: string;
  description: string;
  tone: 'neutral' | 'brand' | 'alpine';
  selected: boolean;
  onSelect: () => void;
}

function PublishOption({
  label,
  description,
  tone,
  selected,
  onSelect,
}: PublishOptionProps) {
  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ hovered }: WebPressableState) => [
        styles.publishOption,
        hovered ? styles.publishOptionHover : null,
        selected ? styles.publishOptionSelected : null,
      ]}
    >
      <View style={styles.publishHead}>
        <Text variant="bodySm" color={colors.text.primary} weight="600">
          {label}
        </Text>
        {tone === 'alpine' ? (
          <Tag size="sm" tone="alpine" label="Auto-release" />
        ) : tone === 'brand' ? (
          <Tag size="sm" tone="brand" label="Recommended" />
        ) : null}
      </View>
      <Text variant="caption" color={colors.text.muted}>
        {description}
      </Text>
      <View
        style={[
          styles.publishRadio,
          selected ? styles.publishRadioSelected : null,
        ]}
      >
        {selected ? (
          <Check
            size={12}
            color={colors.text.inverse}
            strokeWidth={3}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  rail: {
    width: 220,
    minWidth: 220,
    gap: spacing.md,
  },
  railEyebrow: {
    paddingHorizontal: spacing.sm,
  },
  railList: {
    gap: 4,
  },
  railRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  railRowHover: {
    backgroundColor: colors.surface.containerLow,
  },
  railRowActive: {
    backgroundColor: colors.brand.soft,
  },
  railBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface.containerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railBadgeActive: {
    backgroundColor: colors.brand.primary,
  },
  railBadgeComplete: {
    backgroundColor: colors.status.success,
  },
  railBadgeError: {
    backgroundColor: colors.status.error,
  },
  railErrorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.error,
    marginLeft: 'auto',
  },
  body: {
    flex: 1,
    minWidth: 320,
    gap: spacing.lg,
  },
  stepHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepIconBubble: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHeadBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  fieldStack: {
    gap: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  flex: {
    flex: 1,
    minWidth: 200,
  },
  label: {
    marginBottom: spacing.xs,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  formatCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 240,
    backgroundColor: colors.surface.containerLow,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 84,
  },
  formatCardHover: {
    backgroundColor: colors.surface.containerHigh,
  },
  formatCardSelected: {
    backgroundColor: colors.brand.soft,
    ...shadows.glow,
  },
  formatHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  formatRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatRadioSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  helperBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryGroup: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 220,
    backgroundColor: colors.surface.containerLow,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryGroupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryRows: {
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  publishOptions: {
    gap: spacing.md,
  },
  publishOption: {
    backgroundColor: colors.surface.containerLow,
    borderRadius: radii.lg,
    padding: spacing.md,
    paddingRight: spacing.xxxl,
    gap: 4,
    position: 'relative',
  },
  publishOptionHover: {
    backgroundColor: colors.surface.containerHigh,
  },
  publishOptionSelected: {
    backgroundColor: colors.brand.soft,
    ...shadows.glow,
  },
  publishHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  publishRadio: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishRadioSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  wizardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  wizardFooterActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
});
