import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';

export type SkeletonVariant = 'box' | 'circle' | 'text';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  /** Border radius: pass a token key (`sm` / `md` / `lg`) or a number. */
  radius?: 'sm' | 'md' | 'lg' | 'pill' | number;
  variant?: SkeletonVariant;
  style?: StyleProp<ViewStyle>;
  /**
   * Hide the pulse animation regardless of the user's reduce-motion setting.
   * Useful for static screenshots / Storybook captures.
   */
  staticAnim?: boolean;
}

/**
 * Animated placeholder used in lieu of full-screen <ActivityIndicator>.
 * Compose multiple Skeleton boxes into a per-screen "skeleton mirror"
 * that matches the final layout so users see structure, not a spinner.
 *
 * Honors the OS reduce-motion preference.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = 'md',
  variant = 'box',
  style,
  staticAnim,
}: SkeletonProps) {
  const { colors, radii } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;
  const reducedMotion = useRef(false);

  useEffect(() => {
    let isCancelled = false;
    AccessibilityInfo.isReduceMotionEnabled?.().then((rm) => {
      if (!isCancelled) reducedMotion.current = rm;
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (staticAnim || reducedMotion.current) {
      opacity.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, staticAnim]);

  const resolvedRadius =
    typeof radius === 'number'
      ? radius
      : variant === 'circle'
      ? 9999
      : variant === 'text'
      ? radii.sm
      : radii[radius];

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[
        styles.box,
        {
          width: width as number,
          height: height as number,
          borderRadius: resolvedRadius,
          backgroundColor: colors.surface.chip,
          opacity,
        },
        style,
      ]}
    >
      <View />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
  },
});
