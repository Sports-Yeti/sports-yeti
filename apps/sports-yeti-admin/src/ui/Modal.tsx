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
  disabled?: boolean;
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
  width?: number;
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
  success: colors.status.success,
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
  width = 480,
  children,
}: ModalProps) {
  const Icon = VARIANT_ICON[variant];
  const tint = VARIANT_TINT[variant];

  const computedIcon = useMemo(() => {
    if (icon) return icon;
    return (
      <View style={[styles.iconBubble, { backgroundColor: `${tint}1A` }]}>
        <Icon size={20} color={tint} strokeWidth={2.25} />
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
          style={[styles.sheet, shadows.popover, { maxWidth: width }]}
        >
          <View style={styles.header}>
            {computedIcon}
            <View style={styles.headerText}>
              <Text variant="h2" color={colors.text.primary}>
                {title}
              </Text>
              {description ? (
                <Text variant="bodySm" color={colors.text.secondary}>
                  {description}
                </Text>
              ) : null}
            </View>
          </View>

          {children ? <View style={styles.body}>{children}</View> : null}

          <View style={styles.actions}>
            {secondaryAction ? (
              <Button
                label={secondaryAction.label}
                onPress={secondaryAction.onPress}
                variant="ghost"
                size="md"
                disabled={secondaryAction.disabled}
              />
            ) : null}
            <Button
              label={primaryAction.label}
              onPress={primaryAction.onPress}
              variant={variant === 'destructive' ? 'destructive' : 'solid'}
              size="md"
              loading={primaryAction.loading}
              disabled={primaryAction.disabled}
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
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    gap: spacing['2xs'],
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
});
