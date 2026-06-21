import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Button, Text } from '../ui';

interface ActionConfig {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface StickyActionBarProps {
  /** Render the bar only when something is dirty / pending. */
  visible: boolean;
  message?: string;
  /** Optional secondary label and handler (e.g. "Discard changes"). */
  secondary?: ActionConfig;
  /** Primary CTA — typically the save / commit handler. */
  primary: ActionConfig;
  /**
   * Stretch the bar across the page (`'stretch'`, default) or render
   * as a floating pill (`'pill'`, used on Settings screen).
   */
  variant?: 'stretch' | 'pill';
  style?: StyleProp<ViewStyle>;
}

const STICKY_WEB_STYLE = (Platform.OS === 'web'
  ? ({ position: 'sticky', bottom: 0 } as unknown as ViewStyle)
  : null) as ViewStyle | null;

/**
 * Floating action footer used at the bottom of long edit screens (e.g.
 * Settings) so users always know how to commit or discard their work
 * without scrolling. Visually a frosted glass pill with a brand
 * gradient primary CTA. Glacier ethos: "frosted floating overlay".
 */
export function StickyActionBar({
  visible,
  message,
  secondary,
  primary,
  variant = 'stretch',
  style,
}: StickyActionBarProps) {
  if (!visible) return null;
  const inner = (
    <View
      style={[
        styles.bar,
        variant === 'pill' ? styles.barPill : styles.barStretch,
        style,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {message ? (
        <Text variant="bodySm" color={colors.text.secondary} style={styles.message}>
          {message}
        </Text>
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={styles.actions}>
        {secondary ? (
          <Button
            label={secondary.label}
            onPress={secondary.onPress}
            variant="ghost"
            size="md"
            disabled={secondary.disabled}
          />
        ) : null}
        <Button
          label={primary.loading ? 'Saving…' : primary.label}
          onPress={primary.onPress}
          variant="solid"
          size="md"
          disabled={primary.loading || primary.disabled}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, STICKY_WEB_STYLE]} pointerEvents="box-none">
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.glassCard,
    borderRadius: radii.pill,
    ...shadows.glow,
  },
  barStretch: {
    width: '100%',
  },
  barPill: {
    alignSelf: 'center',
  },
  message: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
});
