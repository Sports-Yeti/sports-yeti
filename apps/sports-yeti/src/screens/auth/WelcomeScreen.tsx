import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { colors, spacing } from '../../theme';
import { Button, Text } from '../../ui';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

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
          { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.heroBlock}>
          <View
            style={[styles.logoMark, { marginTop: height * 0.06 }]}
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
          <Button
            label="Get Started"
            variant="soft"
            size="lg"
            fullWidth
            trailingIcon={
              <ArrowRight
                size={18}
                color={colors.brand.deep}
                strokeWidth={2.5}
              />
            }
            onPress={() => navigation.navigate('Onboarding')}
          />
          <Pressable
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Sign in to your account"
            style={styles.signInLink}
            hitSlop={12}
          >
            <Text
              variant="button"
              color={colors.text.inverse}
              align="center"
            >
              I already have an account
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
    gap: spacing.lg,
  },
  logoMark: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  wordmark: {
    letterSpacing: -0.4,
  },
  tagline: {
    opacity: 0.92,
    paddingHorizontal: spacing.lg,
  },
  actions: {
    gap: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  signInLink: {
    paddingVertical: spacing.md,
  },
});
