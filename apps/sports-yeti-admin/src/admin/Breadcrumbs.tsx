import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { Text } from '../ui';
import type { AdminRouteName } from './nav';

export interface Crumb {
  label: string;
  route?: AdminRouteName;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
  onNavigate: (route: AdminRouteName) => void;
}

export function Breadcrumbs({ crumbs, onNavigate }: BreadcrumbsProps) {
  if (crumbs.length === 0) return null;
  return (
    <View
      style={styles.row}
      accessibilityRole="header"
      accessibilityLabel="Breadcrumbs"
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <View key={`${crumb.label}-${idx}`} style={styles.row}>
            {crumb.route && !isLast ? (
              <Pressable
                onPress={() => onNavigate(crumb.route!)}
                accessibilityRole="link"
                accessibilityLabel={crumb.label}
                hitSlop={4}
              >
                <Text variant="caption" color={colors.text.secondary}>
                  {crumb.label}
                </Text>
              </Pressable>
            ) : (
              <Text
                variant="caption"
                color={isLast ? colors.text.primary : colors.text.secondary}
                weight={isLast ? '600' : undefined}
              >
                {crumb.label}
              </Text>
            )}
            {!isLast ? (
              <ChevronRight
                size={12}
                color={colors.text.muted}
                strokeWidth={2.25}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
  },
});
