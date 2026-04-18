import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing } from '../theme';
import { Text } from './Text';

export interface BottomSheetProps {
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
  /** Accepts numbers (px) or percentage strings like "50%". First value used as initial. */
  snapPoints?: Array<number | string>;
  enableSwipeToClose?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

function resolveHeight(point: number | string): number {
  if (typeof point === 'number') return point;
  const trimmed = point.trim();
  if (trimmed.endsWith('%')) {
    const pct = parseFloat(trimmed.slice(0, -1));
    return (Number.isFinite(pct) ? pct : 50) * 0.01 * WINDOW_HEIGHT;
  }
  const parsed = parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : WINDOW_HEIGHT * 0.5;
}

export function BottomSheet({
  visible,
  onRequestClose,
  title,
  snapPoints = ['50%'],
  enableSwipeToClose = true,
  contentStyle,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetHeight = resolveHeight(snapPoints[0] ?? '50%');

  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetHeight,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity, sheetHeight]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={enableSwipeToClose ? onRequestClose : undefined}
            accessibilityLabel="Close sheet"
            accessibilityRole="button"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            shadows.card,
            {
              height: sheetHeight + insets.bottom,
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ translateY }],
            },
          ]}
          accessibilityViewIsModal
          accessibilityRole="menu"
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          {title ? (
            <Text variant="h3" color={colors.text.primary} style={styles.title}>
              {title}
            </Text>
          ) : null}
          <View style={[styles.content, contentStyle]}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: radii.cardLg,
    borderTopRightRadius: radii.cardLg,
    paddingHorizontal: spacing.xl,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface.chip,
  },
  title: {
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
  },
});
