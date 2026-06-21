import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';
import { ws } from '../primitives/pressable';
import { UIText } from '../text/ui-text';

export type ModalVariant = 'info' | 'success' | 'destructive';

export interface ModalAction {
  label: string;
  onPress: () => void;
  loading?: boolean;
}

export interface UIModalProps {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  description?: string;
  variant?: ModalVariant;
  /** Optional icon node — renders above title in a tinted disc. */
  icon?: React.ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  /** When false, backdrop tap does NOT close the modal. */
  dismissible?: boolean;
  /** Custom body content (renders below description). */
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Centered dialog primitive. Replaces window.confirm() / Alert.alert()
 * for destructive confirmations and informational decisions.
 *
 * Use BottomSheet (separate primitive) for filter pickers / action menus.
 */
export function UIModal({
  visible,
  onRequestClose,
  title,
  description,
  variant = 'info',
  icon,
  primaryAction,
  secondaryAction,
  dismissible = true,
  children,
  style,
}: UIModalProps) {
  const { colors, spacing, radii, shadows } = useTheme();

  const accent =
    variant === 'destructive'
      ? colors.status.error
      : variant === 'success'
      ? colors.status.success
      : colors.brand.primary;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      // iOS — focus trap. Web is handled via the Pressable backdrop.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...({ accessibilityViewIsModal: true } as any)}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.surface.overlay }]}
        onPress={dismissible ? onRequestClose : undefined}
        accessibilityRole={dismissible ? 'button' : undefined}
        accessibilityLabel={dismissible ? 'Close dialog' : undefined}
      >
        <Pressable
          // Stop bubbling so taps inside the sheet don't dismiss.
          onPress={() => undefined}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface.card,
              borderRadius: radii.lg,
              padding: spacing.xl,
              gap: spacing.md,
              ...shadows.popover,
            },
            style,
          ]}
        >
          {icon ? (
            <View
              style={{
                alignSelf: 'center',
                width: 56,
                height: 56,
                borderRadius: radii.lg,
                backgroundColor: hexAlpha(accent, 0.14),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </View>
          ) : null}
          <UIText variant="h3" align="center">
            {title}
          </UIText>
          {description ? (
            <UIText variant="body" align="center" color={colors.text.secondary}>
              {description}
            </UIText>
          ) : null}
          {children}
          {(primaryAction || secondaryAction) && (
            <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.sm }]}>
              {secondaryAction ? (
                <Pressable
                  onPress={secondaryAction.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={secondaryAction.label}
                  style={(s) => [
                    styles.secondary,
                    {
                      borderColor: colors.border.strong,
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.sm,
                      opacity: ws(s).pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <UIText variant="button" color={colors.text.primary}>
                    {secondaryAction.label}
                  </UIText>
                </Pressable>
              ) : null}
              {primaryAction ? (
                <Pressable
                  onPress={primaryAction.onPress}
                  disabled={primaryAction.loading}
                  accessibilityRole="button"
                  accessibilityLabel={primaryAction.label}
                  accessibilityState={{ disabled: primaryAction.loading }}
                  style={(s) => [
                    styles.primary,
                    {
                      backgroundColor: accent,
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.sm,
                      opacity: primaryAction.loading
                        ? 0.6
                        : ws(s).pressed
                        ? 0.85
                        : 1,
                    },
                  ]}
                >
                  <UIText variant="button" color={colors.text.inverse}>
                    {primaryAction.loading ? 'Working…' : primaryAction.label}
                  </UIText>
                </Pressable>
              ) : null}
            </View>
          )}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

function hexAlpha(color: string, alpha: number): string {
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  primary: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
