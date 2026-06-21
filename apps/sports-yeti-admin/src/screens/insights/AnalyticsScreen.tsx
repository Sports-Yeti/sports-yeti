import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ChartBarBig,
  Coins,
  Download,
  Goal,
  Trophy,
  Warehouse,
} from 'lucide-react-native';
import { PageHeader, PageScroll, StatCard } from '../../admin';
import { Button, Card, Tabs, Tag, Text, useToast } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { METRIC_SERIES } from '../../mocks/insights';
import { FACILITIES } from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';

const PERIOD_OPTIONS = [
  { key: 'q1', label: 'Q1 2026' },
  { key: 'q2', label: 'Q2 2026' },
  { key: 'q3', label: 'Q3 2026' },
  { key: 'q4', label: 'Q4 2026' },
];

const SERIES_OPTIONS = [
  { key: 'players', label: 'Players' },
  { key: 'revenue', label: 'Revenue' },
];

// Pick a representative icon per metric ID — keeps Stat cards visually
// distinguishable instead of repeating ChartBarBig four times.
function iconFor(id: string, color: string) {
  switch (id) {
    case 'players':
      return <Goal size={18} color={color} strokeWidth={2.25} />;
    case 'revenue':
      return <Coins size={18} color={color} strokeWidth={2.25} />;
    case 'facilities':
      return <Warehouse size={18} color={color} strokeWidth={2.25} />;
    case 'games':
      return <Trophy size={18} color={color} strokeWidth={2.25} />;
    default:
      return <ChartBarBig size={18} color={color} strokeWidth={2.25} />;
  }
}

export function AnalyticsScreen() {
  const toast = useToast();
  const [period, setPeriod] = useState('q3');
  const [series, setSeries] = useState('revenue');

  const activeSeries = useMemo(
    () => METRIC_SERIES.find((m) => m.id === series) ?? METRIC_SERIES[0],
    [series],
  );

  // Mock facility utilization — derived from FACILITIES so it stays
  // consistent if the mocks change.
  const utilization = useMemo(
    () =>
      FACILITIES.slice(0, 4).map((f, i) => ({
        id: f.id,
        label: f.name,
        // deterministic, varies per facility
        pct: Math.min(0.96, 0.62 + ((f.id.length + i * 7) % 35) / 100),
      })),
    [],
  );

  return (
    <PageScroll>
      <PageHeader
        variant="flatHero"
        eyebrow="LEAGUE INTELLIGENCE"
        title="A high-altitude view"
        subtitle="Cross-product trends across leagues, players, and venues."
        meta="Last 12 weeks · auto-refreshed every 24h"
        trailing={
          <View style={styles.headerActions}>
            <Button
              label="Export Report"
              variant="ghost"
              size="sm"
              leadingIcon={
                <Download
                  size={14}
                  color={colors.brand.primary}
                  strokeWidth={2.25}
                />
              }
              onPress={() =>
                toast.show({
                  variant: 'success',
                  title: 'PDF report exported (mock)',
                })
              }
            />
            {/* Period selector — Stitch reference renders this as a
                solid dark gradient pill. */}
            <Tabs
              items={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
              variant="pillDark"
            />
          </View>
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
            tone={m.id === 'revenue' ? 'alpine' : 'brand'}
            icon={iconFor(
              m.id,
              m.id === 'revenue' ? colors.brand.alpine : colors.brand.primary,
            )}
          />
        ))}
      </View>

      <View style={styles.row}>
        {/* Trends chart card with series toggle */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHead}>
            <View style={styles.chartTitleBlock}>
              <Text variant="h2" color={colors.text.primary}>
                Growth & Revenue Trends
              </Text>
              <Text variant="bodySm" color={colors.text.muted}>
                Comparing player acquisition against league revenue over 12
                months.
              </Text>
            </View>
            <Tabs
              items={SERIES_OPTIONS}
              value={series}
              onChange={setSeries}
              variant="pillDark"
            />
          </View>
          <View style={styles.sparkRow}>
            {(activeSeries?.points ?? []).map((v, i) => {
              const max = Math.max(...(activeSeries?.points ?? [1]), 1);
              const h = Math.max(8, Math.round((v / max) * 200));
              const isLast = i === (activeSeries?.points.length ?? 0) - 1;
              return (
                <View
                  key={i}
                  style={[
                    styles.sparkBar,
                    {
                      height: h,
                      backgroundColor: isLast
                        ? colors.brand.alpine
                        : colors.brand.primary,
                      opacity: isLast ? 1 : 0.45 + (i / 12) * 0.55,
                    },
                  ]}
                  accessibilityLabel={`Week ${i + 1}: ${v}`}
                />
              );
            })}
          </View>
          <View style={styles.sparkLabels}>
            {['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'].map((m) => (
              <Text key={m} variant="caption" color={colors.text.muted}>
                {m}
              </Text>
            ))}
          </View>
        </Card>

        {/* Facility utilization card */}
        <Card style={styles.utilizationCard}>
          <Text variant="h2" color={colors.text.primary}>
            Facility Utilization
          </Text>
          <View style={styles.utilizationList}>
            {utilization.map((u) => {
              const isUrgent = u.pct >= 0.9;
              return (
                <View key={u.id} style={styles.utilizationRow}>
                  <View style={styles.utilizationHead}>
                    <Text
                      variant="bodySm"
                      color={colors.text.primary}
                      weight="600"
                    >
                      {u.label}
                    </Text>
                    <Text
                      variant="bodySm"
                      color={
                        isUrgent ? colors.brand.alpine : colors.brand.primary
                      }
                      weight="600"
                    >
                      {`${Math.round(u.pct * 100)}%`}
                    </Text>
                  </View>
                  <View style={styles.utilizationTrack}>
                    <View
                      style={[
                        styles.utilizationFill,
                        {
                          width: `${Math.round(u.pct * 100)}%`,
                          backgroundColor: isUrgent
                            ? colors.brand.alpine
                            : colors.brand.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
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
          <View style={styles.miniSparkRow}>
            {m.points.map((v, i) => {
              const max = Math.max(...m.points, 1);
              const h = Math.max(8, Math.round((v / max) * 96));
              return (
                <View
                  key={i}
                  style={[styles.miniSparkBar, { height: h }]}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  chartCard: {
    flexBasis: 480,
    flexGrow: 2,
    gap: spacing.lg,
  },
  utilizationCard: {
    flexBasis: 280,
    flexGrow: 1,
    gap: spacing.lg,
  },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  chartTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
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
    gap: 6,
    height: 220,
  },
  sparkBar: {
    flex: 1,
    borderRadius: radii.sm,
  },
  sparkLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  miniSparkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 112,
  },
  miniSparkBar: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
  },
  utilizationList: {
    gap: spacing.lg,
  },
  utilizationRow: {
    gap: 6,
  },
  utilizationHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  utilizationTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface.containerHigh,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 4,
  },
});
