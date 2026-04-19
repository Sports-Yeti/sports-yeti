import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChartBarBig, Download } from 'lucide-react-native';
import { PageHeader, PageScroll, StatCard } from '../../admin';
import { Button, Card, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { METRIC_SERIES } from '../../mocks/insights';
import { formatCurrency } from '../../lib/format';

export function AnalyticsScreen() {
  const toast = useToast();

  return (
    <PageScroll>
      <PageHeader
        variant="hero"
        eyebrow="LEAGUE INTELLIGENCE"
        title="A high-altitude view"
        subtitle="Cross-product trends across leagues, players, and venues."
        meta="Last 12 weeks · auto-refreshed every 24h"
        trailing={
          <Button
            label="Export PDF"
            variant="ghost"
            size="sm"
            leadingIcon={<Download size={14} color={colors.brand.primary} strokeWidth={2.25} />}
            onPress={() =>
              toast.show({ variant: 'success', title: 'PDF report exported (mock)' })
            }
          />
        }
      />

      <View style={styles.statsRow}>
        {METRIC_SERIES.map((m) => (
          <StatCard
            key={m.id}
            label={m.label}
            value={
              m.unit === 'currency'
                ? formatCurrency(m.totalCents ?? 0)
                : (m.totalCount ?? 0).toLocaleString()
            }
            changePct={m.changePct}
            tone="brand"
            icon={<ChartBarBig size={14} color={colors.brand.deep} strokeWidth={2.25} />}
          />
        ))}
      </View>

      {METRIC_SERIES.map((m) => (
        <Card key={m.id}>
          <View style={styles.cardHead}>
            <Text variant="h3" color={colors.text.primary}>
              {m.label}
            </Text>
            <Tag
              size="sm"
              tone={m.changePct >= 0 ? 'success' : 'live'}
              leadingDot
              label={`${m.changePct >= 0 ? '+' : ''}${m.changePct.toFixed(1)}%`}
            />
          </View>
          <View style={styles.sparkRow}>
            {m.points.map((v, i) => {
              const max = Math.max(...m.points, 1);
              const h = Math.max(8, Math.round((v / max) * 96));
              return (
                <View
                  key={i}
                  style={[styles.sparkBar, { height: h }]}
                  accessibilityLabel={`Week ${i + 1}: ${v}`}
                />
              );
            })}
          </View>
          <View style={styles.sparkLabels}>
            <Text variant="caption" color={colors.text.muted}>
              12w ago
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              {m.unit === 'currency'
                ? formatCurrency(m.points[m.points.length - 1] ?? 0)
                : (m.points[m.points.length - 1] ?? 0).toLocaleString()}
            </Text>
          </View>
        </Card>
      ))}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sparkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 112,
  },
  sparkBar: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
  },
  sparkLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
});
