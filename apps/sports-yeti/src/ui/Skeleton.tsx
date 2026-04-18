import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, type Radii } from '../theme';

export type SkeletonVariant = 'box' | 'circle' | 'text';

export interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number | `${number}%`;
  radius?: keyof Radii | number;
  variant?: SkeletonVariant;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = '100%',
  height,
  radius = 'md',
  variant = 'box',
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (value) => {
        if (mounted) setReduceMotion(value);
      },
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.5);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduceMotion]);

  const computedHeight =
    height ?? (variant === 'text' ? 16 : variant === 'circle' ? width : 16);

  const computedRadius =
    variant === 'circle'
      ? (typeof computedHeight === 'number' ? computedHeight / 2 : 9999)
      : typeof radius === 'number'
      ? radius
      : radii[radius];

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Loading content"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        {
          width: width as number | `${number}%`,
          height: computedHeight as number | `${number}%`,
          borderRadius: computedRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface.chip,
  },
});
