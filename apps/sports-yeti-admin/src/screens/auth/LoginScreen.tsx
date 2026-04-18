import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Apple, KeyRound, Mail, ShieldCheck } from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import { Button, Card, Input, Text, useToast, type InputRef } from '../../ui';

interface FieldErrors {
  email?: string;
  password?: string;
}

function validate(values: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.email) errors.email = 'Enter your work email';
  else if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'That email looks off';
  if (!values.password) errors.password = 'Enter your password';
  else if (values.password.length < 8) errors.password = 'At least 8 characters';
  return errors;
}

export function LoginScreen() {
  const toast = useToast();
  const { login, isLoading, error, clearError } = useAuthStore();
  const passwordRef = useRef<InputRef>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = validate({ email, password });
  const showError = (field: keyof FieldErrors) =>
    submitted || touched[field] ? errors[field] : undefined;

  const handleSubmit = async () => {
    setSubmitted(true);
    clearError();
    if (errors.email || errors.password) return;
    try {
      await login({ email, password });
    } catch {
      toast.show({
        variant: 'error',
        title: 'Sign in failed',
        description: error ?? 'Check your credentials and try again.',
        action: { label: 'Retry', onPress: handleSubmit },
      });
    }
  };

  const handleSSO = (provider: 'google' | 'microsoft' | 'saml') => {
    toast.show({
      variant: 'info',
      title: `${provider === 'google' ? 'Google Workspace' : provider === 'microsoft' ? 'Microsoft Entra' : 'SAML'} sign-in coming soon`,
      description: 'Use email + password while we wire OAuth.',
    });
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text variant="h2" color={colors.text.inverse}>
                SY
              </Text>
            </View>
            <Text variant="h1" color={colors.text.sidebarPrimary}>
              SportsYeti Admin
            </Text>
            <Text variant="body" color={colors.text.sidebarMuted} align="center" style={styles.tagline}>
              Run leagues, venues, and money — all from one console.
            </Text>
          </View>

          <Card style={styles.card} padded={false}>
            <View style={styles.cardInner}>
              <Text variant="h2" color={colors.text.primary}>
                Sign in
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                Admin access only. Contact your owner if you need an invite.
              </Text>

              <View style={styles.ssoBlock}>
                <Pressable
                  onPress={() => handleSSO('google')}
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Google Workspace"
                  style={({ hovered }) => [
                    styles.ssoBtn,
                    // @ts-expect-error rn-web hovered
                    hovered ? styles.ssoBtnHover : null,
                  ]}
                >
                  <View style={styles.googleMark}>
                    <Text variant="button" color={colors.text.primary}>
                      G
                    </Text>
                  </View>
                  <Text variant="button" color={colors.text.primary}>
                    Continue with Google Workspace
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSSO('microsoft')}
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Microsoft Entra"
                  style={({ hovered }) => [
                    styles.ssoBtn,
                    // @ts-expect-error rn-web hovered
                    hovered ? styles.ssoBtnHover : null,
                  ]}
                >
                  <View style={styles.msMark} />
                  <Text variant="button" color={colors.text.primary}>
                    Continue with Microsoft Entra
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSSO('saml')}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in with SAML SSO"
                  style={({ hovered }) => [
                    styles.ssoBtn,
                    // @ts-expect-error rn-web hovered
                    hovered ? styles.ssoBtnHover : null,
                  ]}
                >
                  <KeyRound size={16} color={colors.text.primary} strokeWidth={2.25} />
                  <Text variant="button" color={colors.text.primary}>
                    Single sign-on (SAML)
                  </Text>
                </Pressable>
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text variant="caption" color={colors.text.muted}>
                  or use email
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <Input
                label="Work email"
                variant="email"
                value={email}
                onChangeText={setEmail}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                error={showError('email')}
                placeholder="alex@yetiathletic.com"
                leadingIcon={<Mail size={14} color={colors.text.secondary} strokeWidth={2.25} />}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <Input
                ref={passwordRef}
                label="Password"
                variant="password"
                value={password}
                onChangeText={setPassword}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                error={showError('password')}
                placeholder="At least 8 characters"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
              />

              <View style={styles.footerRow}>
                <Pressable
                  onPress={() =>
                    toast.show({ variant: 'info', title: 'Reset email sent (mock)' })
                  }
                  accessibilityRole="link"
                  accessibilityLabel="Reset your password"
                  hitSlop={6}
                >
                  <Text variant="button" color={colors.brand.primary}>
                    Forgot password?
                  </Text>
                </Pressable>
                <View style={styles.mfaRow}>
                  <ShieldCheck size={12} color={colors.text.muted} strokeWidth={2.25} />
                  <Text variant="caption" color={colors.text.muted}>
                    2FA enforced
                  </Text>
                </View>
              </View>

              <Button
                label={isLoading ? 'Signing in…' : 'Sign in'}
                variant="solid"
                size="lg"
                fullWidth
                loading={isLoading}
                onPress={handleSubmit}
              />
            </View>
          </Card>

          <Text
            variant="caption"
            color={colors.text.sidebarMuted}
            align="center"
            style={styles.legal}
          >
            By signing in you agree to the SportsYeti Terms and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.sidebar,
  },
  fill: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.popover,
  },
  tagline: {
    maxWidth: 360,
    marginTop: spacing.xs,
  },
  card: {
    width: 420,
    maxWidth: '100%',
    borderColor: 'transparent',
  },
  cardInner: {
    padding: spacing.xxl,
    gap: spacing.md,
  },
  ssoBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ssoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.strong,
    backgroundColor: colors.surface.card,
  },
  ssoBtnHover: {
    backgroundColor: colors.surface.bg,
  },
  googleMark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface.bg,
    borderWidth: 1,
    borderColor: colors.border.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msMark: {
    width: 14,
    height: 14,
    backgroundColor: '#0078D4',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.soft,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mfaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legal: {
    maxWidth: 320,
  },
});
