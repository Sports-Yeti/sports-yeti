import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Apple, ArrowRight, Mail } from 'lucide-react-native';
import { colors, radii, spacing } from '../../theme';
import { Button, Text, useToast } from '../../ui';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const GoogleMark = () => (
  <View style={styles.googleMark}>
    <Text variant="button" color={colors.text.primary}>
      G
    </Text>
  </View>
);

export function WelcomeScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { height } = useWindowDimensions();

  const handleSocial = (provider: 'apple' | 'google') => {
    toast.show({
      variant: 'info',
      title: `${provider === 'apple' ? 'Apple' : 'Google'} sign-in coming soon`,
      description: 'Connect with email in the meantime.',
    });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...colors.gradient.cta]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.huge,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <View style={styles.heroBlock}>
          <View
            style={[styles.logoMark, { marginTop: height * 0.04 }]}
            accessibilityRole="image"
            accessibilityLabel="SportsYeti logo"
          >
            <Text variant="display" color={colors.text.inverse}>
              SY
            </Text>
          </View>
          <Text
            variant="display"
            color={colors.text.inverse}
            align="center"
            style={styles.wordmark}
          >
            SportsYeti
          </Text>
          <Text
            variant="bodyLg"
            color={colors.text.inverse}
            align="center"
            style={styles.tagline}
          >
            Find your next pickup, league match, or scrimmage. Built for players
            who play.
          </Text>
        </View>

        <View style={styles.actions}>
          {Platform.OS === 'ios' ? (
            <Pressable
              onPress={() => handleSocial('apple')}
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
              style={({ pressed }) => [
                styles.appleBtn,
                pressed ? styles.pressed : null,
              ]}
            >
              <Apple
                size={20}
                color={colors.text.inverse}
                strokeWidth={2}
                fill={colors.text.inverse}
              />
              <Text variant="button" color={colors.text.inverse}>
                Continue with Apple
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => handleSocial('google')}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
            style={({ pressed }) => [
              styles.googleBtn,
              pressed ? styles.pressed : null,
            ]}
          >
            <GoogleMark />
            <Text variant="button" color={colors.text.primary}>
              Continue with Google
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text
              variant="caption"
              color={colors.text.inverse}
              style={styles.dividerLabel}
            >
              or
            </Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            label="Continue with email"
            variant="soft"
            size="lg"
            fullWidth
            leadingIcon={
              <Mail size={18} color={colors.brand.deep} strokeWidth={2.5} />
            }
            onPress={() => navigation.navigate('Onboarding')}
          />

          <View style={styles.signInRow}>
            <Text variant="body" color={colors.text.inverse}>
              Already have an account?
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Login')}
              accessibilityRole="button"
              accessibilityLabel="Sign in to your account"
              hitSlop={12}
            >
              <Text variant="button" color={colors.text.inverse}>
                Sign in
              </Text>
            </Pressable>
          </View>

          <View style={styles.fineRow}>
            <Text
              variant="caption"
              color={colors.text.inverse}
              align="center"
              style={styles.fine}
            >
              By continuing you agree to the{' '}
              <Text variant="caption" color={colors.text.inverse} style={styles.link}>
                Terms
              </Text>
              {' & '}
              <Text variant="caption" color={colors.text.inverse} style={styles.link}>
                Privacy Policy
              </Text>
              .
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('Onboarding')}
            accessibilityRole="button"
            accessibilityLabel="See how SportsYeti works"
            hitSlop={8}
            style={styles.tourLink}
          >
            <ArrowRight
              size={14}
              color={colors.text.inverse}
              strokeWidth={2.5}
            />
            <Text variant="button" color={colors.text.inverse}>
              How it works
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.brand.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  heroBlock: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logoMark: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  wordmark: {
    letterSpacing: -0.4,
  },
  tagline: {
    opacity: 0.92,
    paddingHorizontal: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: '#000',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.surface.card,
  },
  googleMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
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
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dividerLabel: {
    opacity: 0.85,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  fineRow: {
    paddingHorizontal: spacing.md,
  },
  fine: {
    opacity: 0.85,
  },
  link: {
    textDecorationLine: 'underline',
  },
  tourLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
});
