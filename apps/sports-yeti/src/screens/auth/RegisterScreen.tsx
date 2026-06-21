import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Phone, User } from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, spacing } from '../../theme';
import {
  Button,
  Card,
  Chip,
  Input,
  ProgressBar,
  Text,
  useToast,
  type InputRef,
} from '../../ui';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const ROLE_OPTIONS = [
  { key: 'player', label: 'Player' },
  { key: 'referee', label: 'Referee' },
  { key: 'league_admin', label: 'League Admin' },
  { key: 'facility_manager', label: 'Facility Manager' },
] as const;

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roles: string[];
}

const STEP_COUNT = 3;

interface StepErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  roles?: string;
}

function validateStep(step: number, form: FormState): StepErrors {
  const errors: StepErrors = {};
  if (step === 1) {
    if (!form.name.trim()) errors.name = 'Tell us your name';
    if (!form.email) errors.email = 'Enter an email so we can reach you';
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errors.email = "That doesn't look like an email";
  }
  if (step === 2) {
    if (!form.password) errors.password = 'Set a password';
    else if (form.password.length < 8)
      errors.password = 'At least 8 characters, please';
    if (!form.confirmPassword) errors.confirmPassword = 'Confirm your password';
    else if (form.confirmPassword !== form.password)
      errors.confirmPassword = "Those don't match — try again";
  }
  if (step === 3) {
    if (form.roles.length === 0) errors.roles = 'Pick at least one role';
  }
  return errors;
}

const STEP_TITLES: Record<number, { eyebrow: string; primary: string; accent: string; subtitle: string }> = {
  1: {
    eyebrow: 'STEP 1 OF 3',
    primary: 'Let’s get to',
    accent: 'know you.',
    subtitle: 'Just the basics so teammates can find you.',
  },
  2: {
    eyebrow: 'STEP 2 OF 3',
    primary: 'Lock it',
    accent: 'down.',
    subtitle: 'Pick a password you can remember.',
  },
  3: {
    eyebrow: 'STEP 3 OF 3',
    primary: 'How do you',
    accent: 'show up?',
    subtitle: 'Choose every role that fits — you can change later.',
  },
};

export function RegisterScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roles: ['player'],
  });
  const [submitted, setSubmitted] = useState(false);

  const emailRef = useRef<InputRef>(null);
  const phoneRef = useRef<InputRef>(null);
  const confirmRef = useRef<InputRef>(null);

  const errors = useMemo(() => validateStep(step, form), [step, form]);
  const showError = (field: keyof StepErrors) =>
    submitted ? errors[field] : undefined;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    clearError();
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const goPrev = () => {
    if (step === 1) {
      navigation.canGoBack()
        ? navigation.goBack()
        : navigation.navigate('Welcome');
      return;
    }
    setSubmitted(false);
    setStep((s) => s - 1);
  };

  const goNext = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    setSubmitted(false);

    if (step < STEP_COUNT) {
      setStep((s) => s + 1);
      return;
    }

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.confirmPassword,
        phone: form.phone.trim() || undefined,
        roles: form.roles,
      });
      toast.show({
        variant: 'success',
        title: 'Welcome to SportsYeti!',
        description: 'Your account is ready.',
      });
    } catch {
      toast.show({
        variant: 'error',
        title: 'Could not create your account',
        description: error || 'Please try again in a moment.',
      });
    }
  };

  const titles = STEP_TITLES[step]!;

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
          <Pressable
            onPress={goPrev}
            accessibilityRole="button"
            accessibilityLabel={step === 1 ? 'Cancel sign up' : 'Previous step'}
            hitSlop={12}
            style={styles.back}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
          <View style={styles.progressShell}>
            <ProgressBar
              value={step / STEP_COUNT}
              tone="brand"
              size="sm"
              accessibilityLabel={`Step ${step} of ${STEP_COUNT}`}
            />
          </View>
        </View>

        <ScrollView
          style={styles.fill}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
        >
          <View style={styles.heroBlock}>
            <Text variant="eyebrow" color={colors.brand.primary}>
              {titles.eyebrow}
            </Text>
            <Text variant="display" color={colors.text.primary}>
              {titles.primary}
            </Text>
            <Text variant="display" color={colors.brand.primary}>
              {titles.accent}
            </Text>
            <Text
              variant="bodyLg"
              color={colors.text.secondary}
              style={styles.heroSubtitle}
            >
              {titles.subtitle}
            </Text>
          </View>

          <Card style={styles.formCard}>
            {step === 1 ? (
              <View style={styles.formFields}>
                <Input
                  label="Full name"
                  value={form.name}
                  onChangeText={(v) => update('name', v)}
                  error={showError('name')}
                  placeholder="Maria Sanchez"
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  leadingIcon={
                    <User size={18} color={colors.text.secondary} strokeWidth={2.25} />
                  }
                />
                <Input
                  ref={emailRef}
                  label="Email"
                  variant="email"
                  value={form.email}
                  onChangeText={(v) => update('email', v)}
                  error={showError('email')}
                  placeholder="you@example.com"
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  leadingIcon={
                    <Mail size={18} color={colors.text.secondary} strokeWidth={2.25} />
                  }
                />
                <Input
                  ref={phoneRef}
                  label="Phone (optional)"
                  variant="number"
                  value={form.phone}
                  onChangeText={(v) => update('phone', v)}
                  helpText="Used only for game reminders"
                  placeholder="+1 555 555 0102"
                  returnKeyType="done"
                  leadingIcon={
                    <Phone size={18} color={colors.text.secondary} strokeWidth={2.25} />
                  }
                />
              </View>
            ) : null}

            {step === 2 ? (
              <View style={styles.formFields}>
                <Input
                  label="Password"
                  variant="password"
                  value={form.password}
                  onChangeText={(v) => update('password', v)}
                  error={showError('password')}
                  helpText="At least 8 characters"
                  placeholder="•••••••••"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                />
                <Input
                  ref={confirmRef}
                  label="Confirm password"
                  variant="password"
                  value={form.confirmPassword}
                  onChangeText={(v) => update('confirmPassword', v)}
                  error={showError('confirmPassword')}
                  placeholder="•••••••••"
                  returnKeyType="done"
                  onSubmitEditing={goNext}
                />
              </View>
            ) : null}

            {step === 3 ? (
              <View style={styles.formFields}>
                <Text variant="button" color={colors.text.secondary}>
                  Pick all that apply
                </Text>
                <View style={styles.rolesWrap}>
                  {ROLE_OPTIONS.map((role) => (
                    <Chip
                      key={role.key}
                      label={role.label}
                      selected={form.roles.includes(role.key)}
                      onPress={() => toggleRole(role.key)}
                    />
                  ))}
                </View>
                {showError('roles') ? (
                  <Text variant="caption" color={colors.status.error}>
                    {showError('roles')}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <Button
              label={
                isLoading
                  ? 'Creating your account...'
                  : step === STEP_COUNT
                  ? 'Create account'
                  : 'Continue'
              }
              variant="gradient"
              size="lg"
              fullWidth
              disabled={isLoading}
              onPress={goNext}
            />
          </Card>

          {step === 1 ? (
            <View style={styles.footer}>
              <Text variant="body" color={colors.text.secondary}>
                Already have an account?
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                hitSlop={8}
              >
                <Text variant="button" color={colors.brand.primary}>
                  Sign in
                </Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  fill: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressShell: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  heroBlock: {
    gap: 4,
  },
  heroSubtitle: {
    marginTop: spacing.md,
  },
  formCard: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  formFields: {
    gap: spacing.lg,
  },
  rolesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
