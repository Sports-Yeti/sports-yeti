import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import {
  Checkbox,
  CheckboxGroup,
  Combobox,
  DatePicker,
  FileUpload,
  Form,
  FormActions,
  FormField,
  FormRow,
  FormSection,
  Input,
  NumberInput,
  PasswordInput,
  RadioGroup,
  Select,
  TextArea,
  Toggle,
  useFieldController,
  type CheckboxOption,
  type ComboboxOption,
  type RadioOption,
  type SelectOption,
  type UploadedFile,
} from '../forms';

/**
 * Live, working showcase of every form primitive in the package.
 * Drop this into any screen during development to verify the design
 * system end-to-end:
 *   <FormControlsGallery />
 */
export function FormControlsGallery() {
  const { colors, spacing } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.bg }}
      contentContainerStyle={{
        padding: spacing.lg,
        gap: spacing.lg,
        paddingBottom: spacing.huge * 2,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: spacing.xs }}>
        <UIText variant="h2" color={colors.text.primary}>
          Form Controls
        </UIText>
        <UIText variant="bodySm" color={colors.text.secondary}>
          Every primitive in @sports-yeti/ui rendered with both standalone
          and FormField patterns.
        </UIText>
      </View>

      <StandaloneSection />
      <FormFieldSection />
      <SelectionSection />
      <PickerSection />
      <UploadSection />
      <RHFSection />
    </ScrollView>
  );
}

// ---------- Standalone (no FormField wrapper) ----------

function StandaloneSection() {
  const [text, setText] = useState('');
  const [pw, setPw] = useState('');
  const [bio, setBio] = useState('');
  const [count, setCount] = useState<number | null>(null);

  return (
    <FormSection
      title="Standalone controls"
      description="No FormField wrapper — controls own their own label/help/error."
    >
      <Input
        label="Email"
        placeholder="you@sportsyeti.com"
        variant="email"
        value={text}
        onChangeText={setText}
        clearable
        helpText="Magic-link sign-in only."
      />
      <PasswordInput
        label="Password"
        placeholder="••••••••"
        value={pw}
        onChangeText={setPw}
        showStrength
        isNewPassword
      />
      <TextArea
        label="Bio"
        placeholder="Tell teammates a little about your game…"
        value={bio}
        onChangeText={setBio}
        showCounter
        maxLength={200}
        minRows={3}
      />
      <NumberInput
        label="Game fee"
        placeholder="0.00"
        value={count}
        onChangeNumber={setCount}
        format={{ style: 'currency', currency: 'USD' }}
        leftAddon="$"
        min={0}
        max={9999}
        step={0.5}
        showSteppers
      />
    </FormSection>
  );
}

// ---------- FormField-wrapped ----------

function FormFieldSection() {
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <FormSection
      title="FormField wrappers"
      description="Label/help/error/required marker provided by FormField; controls auto-wire via context."
    >
      <FormRow columns={2}>
        <FormField
          label="Website"
          description="Public URL for your team page."
        >
          <Input
            variant="url"
            value={website}
            onChangeText={setWebsite}
            leftAddon="https://"
            placeholder="sportsyeti.com/teams/…"
          />
        </FormField>

        <FormField
          label="Phone"
          required
          error={
            phone && phone.length < 10 ? 'At least 10 digits' : undefined
          }
        >
          <Input
            variant="phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="(303) 555-0142"
          />
        </FormField>
      </FormRow>

      <FormField
        label="Internal notes"
        description="Visible to admins only. Markdown supported."
      >
        <TextArea
          value={notes}
          onChangeText={setNotes}
          minRows={4}
          showCounter
          maxLength={500}
          placeholder="Anything we should remember about this booking?"
        />
      </FormField>
    </FormSection>
  );
}

// ---------- Selection (Toggle / Checkbox / Radio) ----------

const NOTIFICATION_OPTIONS: CheckboxOption<'push' | 'email' | 'sms'>[] = [
  { value: 'push', label: 'Push notifications', description: 'Game reminders, invites, replies.' },
  { value: 'email', label: 'Email digest', description: 'Weekly summary of activity.' },
  { value: 'sms', label: 'SMS', description: 'Game-day status only.', disabled: true },
];

const SKILL_RADIOS: RadioOption<'beginner' | 'intermediate' | 'advanced' | 'pro'>[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to the sport.' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with basics.' },
  { value: 'advanced', label: 'Advanced', description: 'Competitive league experience.' },
  { value: 'pro', label: 'Pro', description: 'Paid or semi-pro level.' },
];

function SelectionSection() {
  const [push, setPush] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [available, setAvailable] = useState(true);
  const [accepted, setAccepted] = useState<boolean>(false);
  const [channels, setChannels] = useState<('push' | 'email' | 'sms')[]>(['push']);
  const [skill, setSkill] =
    useState<'beginner' | 'intermediate' | 'advanced' | 'pro' | null>('intermediate');

  return (
    <FormSection
      title="Selection"
      description="Toggle / Checkbox / RadioGroup with FormField row layout."
    >
      <FormField
        label="Push notifications"
        description="Game reminders, invites, and replies."
        orientation="row"
      >
        <Toggle value={push} onValueChange={setPush} />
      </FormField>

      <FormField
        label="Email digest"
        description="Weekly summary of activity and matches."
        orientation="row"
      >
        <Toggle value={emailDigest} onValueChange={setEmailDigest} />
      </FormField>

      <FormField
        label="Available to sub"
        description="Captains can ping you for last-minute roster gaps."
        orientation="row"
      >
        <Toggle value={available} onValueChange={setAvailable} tone="success" />
      </FormField>

      <Checkbox
        value={accepted}
        onValueChange={setAccepted}
        label="I accept the league waiver"
        description="You can review the full text on the next step."
      />

      <FormField
        label="Notification channels"
        description="Pick all that apply."
      >
        <CheckboxGroup
          options={NOTIFICATION_OPTIONS}
          value={channels}
          onChange={setChannels}
        />
      </FormField>

      <FormField label="Skill level" required>
        <RadioGroup
          options={SKILL_RADIOS}
          value={skill}
          onChange={setSkill}
        />
      </FormField>
    </FormSection>
  );
}

// ---------- Pickers (Select / Combobox / DatePicker) ----------

const SPORT_OPTIONS: SelectOption<'basketball' | 'soccer' | 'volleyball' | 'tennis' | 'pickleball'>[] = [
  { value: 'basketball', label: 'Basketball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'pickleball', label: 'Pickleball' },
];

const FACILITY_OPTIONS: ComboboxOption<string>[] = [
  { value: 'yeti-center', label: 'Yeti Center', description: 'Denver, CO' },
  { value: 'mile-high', label: 'Mile High Indoor', description: 'Denver, CO' },
  { value: 'cherry-creek', label: 'Cherry Creek Sports Park', description: 'Cherry Creek, CO' },
  { value: 'rino-rec', label: 'RiNo Rec Center', description: 'Denver, CO' },
];

function PickerSection() {
  const [sport, setSport] = useState<'basketball' | 'soccer' | 'volleyball' | 'tennis' | 'pickleball' | null>(null);
  const [sports, setSports] = useState<string[]>([]);
  const [facility, setFacility] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  return (
    <FormSection
      title="Pickers"
      description="Select / Combobox / DatePicker. Mobile renders as bottom sheets, web as popovers."
    >
      <FormRow columns={2}>
        <FormField label="Primary sport" required>
          <Select
            options={SPORT_OPTIONS}
            value={sport}
            onChange={setSport}
            placeholder="Choose a sport"
          />
        </FormField>

        <FormField
          label="All sports played"
          description="Multi-select. Searchable above 7 items."
        >
          <Select
            multiple
            searchable
            options={SPORT_OPTIONS}
            value={sports}
            onChange={setSports}
            placeholder="Pick all that apply"
          />
        </FormField>
      </FormRow>

      <FormField
        label="Home facility"
        description="Free-text typeahead. Allows creating custom entries."
      >
        <Combobox
          options={FACILITY_OPTIONS}
          value={facility}
          onChange={setFacility}
          allowCreate
          onCreate={(raw) => setFacility(raw)}
          placeholder="Search facilities…"
        />
      </FormField>

      <FormRow columns={2}>
        <FormField label="Game date" required>
          <DatePicker
            mode="date"
            value={scheduledAt}
            onChange={setScheduledAt}
            minDate={new Date()}
            clearable
          />
        </FormField>
        <FormField label="Tip-off time">
          <DatePicker
            mode="time"
            value={time}
            onChange={setTime}
            clearable
          />
        </FormField>
      </FormRow>
    </FormSection>
  );
}

// ---------- File upload ----------

function UploadSection() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  return (
    <FormSection
      title="File upload"
      description="Drag-and-drop on web; system picker on iOS/Android."
    >
      <FormField
        label="Highlight reel"
        description="Up to 3 files, 50 MB each."
      >
        <FileUpload
          accept="video"
          multiple
          maxFiles={3}
          maxSize={50 * 1024 * 1024}
          value={files}
          onChange={setFiles}
        />
      </FormField>
    </FormSection>
  );
}

// ---------- Full RHF + Zod example ----------

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  acceptedTerms: z
    .boolean()
    .refine((v) => v === true, 'You must accept the terms'),
});
type SignUpValues = z.infer<typeof signUpSchema>;

function RHFSection() {
  return (
    <FormSection
      title="react-hook-form + zod"
      description="Wrap any primitive in useFieldController() and the validation flows automatically."
    >
      <Form
        defaultValues={{ name: '', email: '', password: '', acceptedTerms: false }}
        resolver={zodResolver(signUpSchema)}
        onSubmit={async (values) => {
          // eslint-disable-next-line no-console
          console.log('submit', values);
        }}
      >
        <View style={styles.formStack}>
          <ControlledNameField />
          <ControlledEmailField />
          <ControlledPasswordField />
          <ControlledTermsField />
          <FormActions submitLabel="Create account" cancelLabel="Cancel" />
        </View>
      </Form>
    </FormSection>
  );
}

function ControlledNameField() {
  const ctrl = useFieldController<SignUpValues, 'name'>({ name: 'name' });
  return (
    <FormField label="Full name" required error={ctrl.error}>
      <Input
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="Sasha Yeti"
      />
    </FormField>
  );
}

function ControlledEmailField() {
  const ctrl = useFieldController<SignUpValues, 'email'>({ name: 'email' });
  return (
    <FormField label="Email" required error={ctrl.error}>
      <Input
        variant="email"
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        placeholder="you@sportsyeti.com"
      />
    </FormField>
  );
}

function ControlledPasswordField() {
  const ctrl = useFieldController<SignUpValues, 'password'>({ name: 'password' });
  return (
    <FormField
      label="Password"
      required
      description="Min 8 chars, with at least one uppercase letter and number."
      error={ctrl.error}
    >
      <PasswordInput
        value={ctrl.value}
        onChangeText={ctrl.onChange}
        onBlur={ctrl.onBlur}
        showStrength
        isNewPassword
      />
    </FormField>
  );
}

function ControlledTermsField() {
  const ctrl = useFieldController<SignUpValues, 'acceptedTerms'>({
    name: 'acceptedTerms',
  });
  return (
    <FormField error={ctrl.error}>
      <Checkbox
        value={ctrl.value}
        onValueChange={(v) => {
          ctrl.onChange(v);
          ctrl.onBlur();
        }}
        label="I accept the terms of service"
        description="Includes the SportsYeti privacy policy and league waiver."
      />
    </FormField>
  );
}

const styles = StyleSheet.create({
  formStack: {
    gap: 16,
  },
});
