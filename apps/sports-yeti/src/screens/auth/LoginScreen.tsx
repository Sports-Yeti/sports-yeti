import React, { useRef, useState } from 'react';
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
import { ChevronLeft, Mail } from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, spacing } from '../../theme';
import { Button, Card, Input, Text, useToast, type InputRef } from '../../ui';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface FieldErrors {
  email?: string;
  password?: string;
  form?: string;
}

function validate(values: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.email) {
    errors.email = 'Enter the email you signed up with';
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'That email looks off — double check?';
  }
  if (!values.password) {
    errors.password = 'Enter your password';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  return errors;
}

export function LoginScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const passwordRef = useRef<InputRef>(null);
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = validate({ email, password });

  const showError = (field: keyof FieldErrors) =>
    submitted || touched[field as 'email' | 'password']
      ? errors[field]
      : undefined;

  const handleSubmit = async () => {
    setSubmitted(true);
    clearError();
    if (errors.email || errors.password) return;

    try {
      await login({ email, password });
    } catch {
      const message = error || 'Could not sign you in. Check your details and try again.';
      toast.show({
        variant: 'error',
        title: 'Sign in failed',
        description: message,
        action: { label: 'Retry', onPress: handleSubmit },
      });
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.fill}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.xxl,
            },
          ]}
        >
          <Pressable
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Welcome')}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={styles.back}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>

          <View style={styles.heroBlock}>
            <Text variant="display" color={colors.text.primary}>
              Welcome
            </Text>
            <Text variant="display" color={colors.brand.primary}>
              back.
            </Text>
            <Text
              variant="bodyLg"
              color={colors.text.secondary}
              style={styles.heroSubtitle}
            >
              Sign in to find your next game.
            </Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.formFields}>
              <Input
                label="Email"
                variant="email"
                value={email}
                onChangeText={setEmail}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                error={showError('email')}
                placeholder="you@example.com"
                leadingIcon={
                  <Mail size={18} color={colors.text.secondary} strokeWidth={2.25} />
                }
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
              <Pressable
                onPress={() => navigation.navigate('ForgotPassword')}
                accessibilityRole="button"
                accessibilityLabel="Reset your password"
                hitSlop={8}
                style={styles.forgot}
              >
                <Text variant="button" color={colors.brand.primary}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            <Button
              label={isLoading ? 'Signing in...' : 'Sign In'}
              variant="gradient"
              size="lg"
              fullWidth
              disabled={isLoading}
              onPress={handleSubmit}
            />
          </Card>

          <View style={styles.footer}>
            <Text variant="body" color={colors.text.secondary}>
              New to SportsYeti?
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
              accessibilityLabel="Create a new account"
              hitSlop={8}
            >
              <Text variant="button" color={colors.brand.primary}>
                Create an account
              </Text>
            </Pressable>
          </View>
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
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
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
  forgot: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
});
