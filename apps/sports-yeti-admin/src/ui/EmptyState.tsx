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
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.root, style]} accessibilityRole="summary">
      {icon ? (
        <IconBadge size={48} tone="brand" style={styles.iconBadge}>
          {icon}
        </IconBadge>
      ) : null}
      <Text variant="h3" color={colors.text.primary} align="center">
        {title}
      </Text>
      {description ? (
        <Text
          variant="body"
          color={colors.text.secondary}
          align="center"
          style={styles.description}
        >
          {description}
        </Text>
      ) : null}
      {primaryAction || secondaryAction ? (
        <View style={styles.actions}>
          {secondaryAction ? (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="ghost"
              size="md"
            />
          ) : null}
          {primaryAction ? (
            <Button
              label={primaryAction.label}
              onPress={primaryAction.onPress}
              variant="solid"
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
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  iconBadge: {
    marginBottom: spacing.md,
  },
  description: {
    maxWidth: 360,
    marginTop: spacing['2xs'],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
