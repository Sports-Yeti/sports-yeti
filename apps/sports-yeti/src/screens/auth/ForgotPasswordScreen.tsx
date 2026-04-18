import React, { useState } from 'react';
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
import { ArrowLeft, Mail, MailCheck } from 'lucide-react-native';
import { colors, spacing } from '../../theme';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Text,
  useToast,
} from '../../ui';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

function isEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function ForgotPasswordScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const error =
    submitted && (!email
      ? 'Enter the email on your account'
      : !isEmail(email)
      ? "That doesn't look like an email"
      : undefined);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!email || !isEmail(email)) return;
    setIsSending(true);
    try {
      // TODO: wire to api.requestPasswordReset(email) when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSent(true);
    } catch {
      toast.show({
        variant: 'error',
        title: "Couldn't send reset link",
        description: 'Please try again in a moment.',
      });
    } finally {
      setIsSending(false);
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
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate('Login')
            }
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            hitSlop={12}
            style={styles.back}
          >
            <ArrowLeft size={22} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>

          {sent ? (
            <Card style={styles.formCard}>
              <EmptyState
                icon={
                  <MailCheck
                    size={28}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                }
                title="Check your inbox"
                description={`We sent a reset link to ${email}. It expires in 1 hour.`}
                primaryAction={{
                  label: 'Back to sign in',
                  onPress: () => navigation.navigate('Login'),
                }}
                secondaryAction={{
                  label: 'Send again',
                  onPress: handleSubmit,
                }}
              />
            </Card>
          ) : (
            <>
              <View style={styles.heroBlock}>
                <Text variant="display" color={colors.text.primary}>
                  Reset your
                </Text>
                <Text variant="display" color={colors.brand.primary}>
                  password.
                </Text>
                <Text
                  variant="bodyLg"
                  color={colors.text.secondary}
                  style={styles.heroSubtitle}
                >
                  We'll email you a link to set a new one.
                </Text>
              </View>

              <Card style={styles.formCard}>
                <Input
                  label="Email"
                  variant="email"
                  value={email}
                  onChangeText={setEmail}
                  error={error || undefined}
                  placeholder="you@example.com"
                  autoFocus
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit}
                  leadingIcon={
                    <Mail size={18} color={colors.text.secondary} strokeWidth={2.25} />
                  }
                />
                <Button
                  label={isSending ? 'Sending...' : 'Send reset link'}
                  variant="gradient"
                  size="lg"
                  fullWidth
                  disabled={isSending}
                  onPress={handleSubmit}
                />
              </Card>
            </>
          )}
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
});
