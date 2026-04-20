import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';

export interface BottomSheetProps {
  visible: boolean;
  onRequestClose: () => void;
  /** Optional title in the handle bar. */
  title?: string;
  /**
   * Snap points as a percentage of the viewport height (0–1) or a fixed
   * pixel number. Only the first value is used in this Phase-0 implementation
   * (full multi-snap support arrives with `react-native-gesture-handler`).
   */
  snapPoints?: Array<number | `${number}%`>;
  /** Allow swipe / backdrop-tap to close. */
  enableSwipeToClose?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bottom sheet primitive. Slides up from the bottom on both platforms.
 *
 * Used for filter pickers, sort menus, action menus, share targets, the
 * Role Switcher, and the BidComposeSheet.
 *
 * Phase-0 keeps it deliberately lightweight (no gesture handler dep) —
 * polish phase swaps the animation for `react-native-reanimated`.
 */
export function BottomSheet({
  visible,
  onRequestClose,
  title,
  snapPoints = ['50%'],
  enableSwipeToClose = true,
  children,
  style,
}: BottomSheetProps) {
  const { colors, spacing, radii, shadows } = useTheme();
  const translateY = useRef(new Animated.Value(600)).current;

  const screenHeight = Dimensions.get('window').height;
  const firstSnap = snapPoints[0];
  const sheetHeight =
    typeof firstSnap === 'number'
      ? firstSnap
      : Math.round((parseFloat(firstSnap) / 100) * screenHeight);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : sheetHeight,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible, sheetHeight, translateY]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onRequestClose}
    >
      <View style={styles.fill}>
        <Pressable
          accessibilityRole={enableSwipeToClose ? 'button' : undefined}
          accessibilityLabel={enableSwipeToClose ? 'Close sheet' : undefined}
          onPress={enableSwipeToClose ? onRequestClose : undefined}
          style={[styles.backdrop, { backgroundColor: colors.surface.overlay }]}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface.card,
              borderTopLeftRadius: radii.cardLg,
              borderTopRightRadius: radii.cardLg,
              height: sheetHeight,
              paddingBottom: spacing.xl,
              transform: [{ translateY }],
              ...shadows.popover,
            },
            style,
          ]}
        >
          <View
            style={[
              styles.handle,
              {
                backgroundColor: colors.border.soft,
                marginVertical: spacing.sm,
              },
            ]}
          />
          {title ? (
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingBottom: spacing.sm,
              }}
            >
              <UIText variant="h3">{title}</UIText>
            </View>
          ) : null}
          <View style={[styles.body, { paddingHorizontal: spacing.lg }]}>
            {children}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: '100%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  body: {
    flex: 1,
  },
});
