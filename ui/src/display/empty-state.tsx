import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/provider';
import { ws, type WebPressableState } from '../primitives/pressable';
import { UIText } from '../text/ui-text';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  /** Lucide icon node (or any ReactNode) shown above the title. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  align?: 'center' | 'start';
  style?: StyleProp<ViewStyle>;
}

/**
 * Replaces the dead-end "No results" inline text with an illustrated
 * empty state + actionable CTA back into the funnel.
 */
export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  align = 'center',
  style,
}: EmptyStateProps) {
  const { colors, spacing, radii } = useTheme();
  const alignItems = align === 'start' ? 'flex-start' : 'center';
  const textAlign = align === 'start' ? 'left' : 'center';

  return (
    <View
      style={[
        styles.container,
        {
          alignItems,
          padding: spacing.xl,
          gap: spacing.md,
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radii.lg,
            backgroundColor: colors.brand.soft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      ) : null}
      <UIText variant="h3" align={textAlign}>
        {title}
      </UIText>
      {description ? (
        <UIText variant="body" align={textAlign} color={colors.text.secondary}>
          {description}
        </UIText>
      ) : null}
      {(primaryAction || secondaryAction) && (
        <View style={[styles.actionRow, { gap: spacing.sm, marginTop: spacing.sm }]}>
          {primaryAction ? (
            <Pressable
              onPress={primaryAction.onPress}
              accessibilityRole="button"
              accessibilityLabel={primaryAction.label}
              style={(s) => [
                styles.primaryAction,
                {
                  backgroundColor: colors.brand.primary,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  opacity: ws(s).pressed ? 0.85 : ws(s).hovered ? 0.92 : 1,
                },
              ]}
            >
              <UIText variant="button" color={colors.text.inverse}>
                {primaryAction.label}
              </UIText>
            </Pressable>
          ) : null}
          {secondaryAction ? (
            <Pressable
              onPress={secondaryAction.onPress}
              accessibilityRole="button"
              accessibilityLabel={secondaryAction.label}
              style={(s: WebPressableState) => [
                styles.secondaryAction,
                {
                  borderColor: colors.border.strong,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  opacity: s.pressed ? 0.85 : s.hovered ? 0.92 : 1,
                },
              ]}
            >
              <UIText variant="button" color={colors.text.primary}>
                {secondaryAction.label}
              </UIText>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  primaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
