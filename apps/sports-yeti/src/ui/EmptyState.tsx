import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing } from '../theme';
import { Button } from './Button';
import { IconBadge } from './IconBadge';
import { Text } from './Text';

export type EmptyStateAlign = 'center' | 'start';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  align?: EmptyStateAlign;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  align = 'center',
  style,
}: EmptyStateProps) {
  const alignedStyle = align === 'center' ? styles.center : styles.start;
  return (
    <View style={[styles.root, alignedStyle, style]} accessibilityRole="summary">
      {icon ? (
        <IconBadge size={64} tone="brand" style={styles.iconBadge}>
          {icon}
        </IconBadge>
      ) : null}
      <Text
        variant="h2"
        color={colors.text.primary}
        align={align === 'center' ? 'center' : 'left'}
      >
        {title}
      </Text>
      {description ? (
        <Text
          variant="body"
          color={colors.text.secondary}
          align={align === 'center' ? 'center' : 'left'}
          style={styles.description}
        >
          {description}
        </Text>
      ) : null}
      {primaryAction || secondaryAction ? (
        <View style={[styles.actions, alignedStyle]}>
          {primaryAction ? (
            <Button
              label={primaryAction.label}
              onPress={primaryAction.onPress}
              variant="gradient"
              size="md"
            />
          ) : null}
          {secondaryAction ? (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="ghost"
              size="md"
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  center: {
    alignItems: 'center',
  },
  start: {
    alignItems: 'flex-start',
  },
  iconBadge: {
    marginBottom: spacing.sm,
  },
  description: {
    maxWidth: 320,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
