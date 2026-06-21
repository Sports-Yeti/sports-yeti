import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Text } from './Text';

export interface BadgeProps {
  count?: number;
  dot?: boolean;
  tone?: 'brand' | 'live' | 'success' | 'warning';
}

const TONE_BG = {
  brand: colors.brand.primary,
  live: colors.status.live,
  success: colors.status.success,
  warning: colors.status.warning,
} as const;

export function Badge({ count, dot = false, tone = 'brand' }: BadgeProps) {
  if (dot) {
    return <View style={[styles.dot, { backgroundColor: TONE_BG[tone] }]} />;
  }
  if (typeof count !== 'number' || count <= 0) return null;
  const display = count > 99 ? '99+' : `${count}`;
  return (
    <View style={[styles.badge, { backgroundColor: TONE_BG[tone] }]}>
      <Text variant="caption" color={colors.text.inverse} style={styles.text}>
        {display}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
