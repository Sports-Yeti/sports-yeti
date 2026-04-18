import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii } from '../theme';

export type SkeletonVariant = 'box' | 'circle' | 'text';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  variant?: SkeletonVariant;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = '100%',
  height = 16,
  variant = 'box',
  radius,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
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
  }, [opacity]);

  const computedRadius =
    typeof radius === 'number'
      ? radius
      : variant === 'circle'
      ? height / 2
      : variant === 'text'
      ? radii.sm
      : radii.sm;

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        // @ts-expect-error width/height accept percent strings or numbers
        { width, height, borderRadius: computedRadius, opacity },
        style,
      ]}
    />
  );
}

interface SkeletonRowsProps {
  rows?: number;
  height?: number;
  gap?: number;
}

export function SkeletonRows({ rows = 5, height = 48, gap = 8 }: SkeletonRowsProps) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface.chip,
  },
});
