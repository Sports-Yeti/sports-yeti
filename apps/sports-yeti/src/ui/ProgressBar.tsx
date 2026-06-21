import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme';
import { Text } from './Text';

export type ProgressTone = 'brand' | 'success' | 'warning' | 'error';
export type ProgressSize = 'sm' | 'md';

export interface ProgressBarProps {
  value?: number;
  variant?: 'determinate' | 'indeterminate';
  tone?: ProgressTone;
  size?: ProgressSize;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const TONE_COLOR: Record<ProgressTone, string> = {
  brand: colors.brand.primary,
  success: '#2E7D32',
  warning: '#B26200',
  error: '#C62828',
};

const SIZE_HEIGHT: Record<ProgressSize, number> = {
  sm: 4,
  md: 8,
};

export function ProgressBar({
  value = 0,
  variant = 'determinate',
  tone = 'brand',
  size = 'md',
  showLabel = false,
  style,
  accessibilityLabel,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const height = SIZE_HEIGHT[size];
  const tint = TONE_COLOR[tone];

  const indeterminateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant !== 'indeterminate') return undefined;
    const loop = Animated.loop(
      Animated.timing(indeterminateAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [indeterminateAnim, variant]);

  const indeterminateLeft = indeterminateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-40%', '100%'],
  });

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[styles.track, { height, borderRadius: height / 2 }]}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel ?? 'Progress'}
        accessibilityValue={
          variant === 'determinate'
            ? { min: 0, max: 100, now: Math.round(clamped * 100) }
            : undefined
        }
      >
        {variant === 'determinate' ? (
          <View
            style={[
              styles.fill,
              {
                width: `${clamped * 100}%`,
                backgroundColor: tint,
                borderRadius: height / 2,
              },
            ]}
          />
        ) : (
          <Animated.View
            style={[
              styles.fill,
              styles.indeterminate,
              {
                left: indeterminateLeft,
                backgroundColor: tint,
                borderRadius: height / 2,
              },
            ]}
          />
        )}
      </View>
      {showLabel && variant === 'determinate' ? (
        <Text variant="caption" color={colors.text.secondary} style={styles.label}>
          {Math.round(clamped * 100)}%
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  track: {
    flex: 1,
    backgroundColor: colors.surface.chip,
    overflow: 'hidden',
    borderRadius: radii.sm,
  },
  fill: {
    height: '100%',
  },
  indeterminate: {
    position: 'absolute',
    width: '40%',
  },
  label: {
    minWidth: 36,
    textAlign: 'right',
  },
});
