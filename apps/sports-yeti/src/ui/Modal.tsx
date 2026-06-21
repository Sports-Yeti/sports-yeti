import React, { useMemo } from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Button } from './Button';
import { Text } from './Text';

export type ModalVariant = 'info' | 'destructive' | 'success';

export interface ModalAction {
  label: string;
  onPress: () => void;
  loading?: boolean;
}

export interface ModalProps {
  visible: boolean;
  onRequestClose: () => void;
  variant?: ModalVariant;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction: ModalAction;
  secondaryAction?: ModalAction;
  dismissible?: boolean;
  children?: React.ReactNode;
}

const VARIANT_ICON = {
  info: Info,
  destructive: AlertTriangle,
  success: CheckCircle2,
} as const;

const VARIANT_TINT: Record<ModalVariant, string> = {
  info: colors.brand.primary,
  destructive: colors.status.error,
  success: '#2E7D32',
};

export function Modal({
  visible,
  onRequestClose,
  variant = 'info',
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  dismissible = true,
  children,
}: ModalProps) {
  const Icon = VARIANT_ICON[variant];
  const tint = VARIANT_TINT[variant];

  const computedIcon = useMemo(() => {
    if (icon) return icon;
    return (
      <View style={[styles.iconBubble, { backgroundColor: `${tint}1A` }]}>
        <Icon size={28} color={tint} strokeWidth={2.25} />
      </View>
    );
  }, [Icon, icon, tint]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onRequestClose : undefined}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={dismissible ? onRequestClose : undefined}
        accessibilityElementsHidden={!dismissible}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          accessible
          accessibilityViewIsModal
          accessibilityRole="alert"
          accessibilityLabel={title}
          style={[styles.sheet, shadows.card]}
        >
          {computedIcon}

          <View style={styles.body}>
            <Text variant="h2" color={colors.text.primary} align="center">
              {title}
            </Text>
            {description ? (
              <Text variant="body" color={colors.text.secondary} align="center">
                {description}
              </Text>
            ) : null}
            {children}
          </View>

          <View style={styles.actions}>
            {secondaryAction ? (
              <Button
                label={secondaryAction.label}
                onPress={secondaryAction.onPress}
                variant="ghost"
                size="md"
                fullWidth
              />
            ) : null}
            <Button
              label={primaryAction.label}
              onPress={primaryAction.onPress}
              variant={variant === 'destructive' ? 'solid' : 'gradient'}
              size="md"
              fullWidth
              disabled={primaryAction.loading}
            />
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface.card,
    borderRadius: radii.cardLg,
    padding: spacing.xxl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: '100%',
    gap: spacing.sm,
    alignItems: 'center',
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
