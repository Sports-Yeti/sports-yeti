import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { Text } from '../ui';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import type { AdminRouteName } from './nav';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  meta?: string;
  crumbs?: Crumb[];
  onNavigate?: (route: AdminRouteName) => void;
  trailing?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  meta,
  crumbs,
  onNavigate,
  trailing,
}: PageHeaderProps) {
  return (
    <View style={styles.wrap}>
      {crumbs && crumbs.length > 0 && onNavigate ? (
        <Breadcrumbs crumbs={crumbs} onNavigate={onNavigate} />
      ) : null}
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <Text variant="h1" color={colors.text.primary}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="body" color={colors.text.secondary}>
              {subtitle}
            </Text>
          ) : null}
          {meta ? (
            <Text variant="caption" color={colors.text.muted}>
              {meta}
            </Text>
          ) : null}
        </View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  titleBlock: {
    gap: spacing['2xs'],
    flex: 1,
    minWidth: 0,
  },
  trailing: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
});
