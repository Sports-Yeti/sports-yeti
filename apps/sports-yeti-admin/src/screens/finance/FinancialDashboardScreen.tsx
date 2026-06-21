import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Download, FileBarChart2, Wallet } from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { financeSummary, PAYMENTS, STATUS_LABEL } from '../../mocks/payments';
import { METRIC_SERIES } from '../../mocks/insights';
import { formatCurrency, formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

export function FinancialDashboardScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const summary = financeSummary();
  const revenueSeries = METRIC_SERIES.find((m) => m.id === 'revenue');
  const recentPayments = [...PAYMENTS]
    .filter((p) => p.status === 'completed' || p.status === 'partially_refunded')
    .sort((a, b) => (b.paidAtIso ?? '').localeCompare(a.paidAtIso ?? ''))
    .slice(0, 8);

  return (
    <PageScroll>
      <PageHeader
        variant="hero"
        eyebrow="MONEY MOVEMENT"
        title="Finance"
        subtitle="Net revenue, fees, refunds, and outstanding balances at a glance."
        meta={`Next payout ${formatDate(summary.payoutDateIso)} · ${formatCurrency(summary.netCents)}`}
        trailing={
          <>
            <Button
              label="Export PDF"
              variant="ghost"
              size="sm"
              leadingIcon={<FileBarChart2 size={14} color={colors.brand.primary} strokeWidth={2.25} />}
              onPress={() =>
                toast.show({ variant: 'success', title: 'Monthly PDF generated (mock)' })
              }
            />
            <Button
              label="Export CSV"
              variant="solid"
              size="sm"
              leadingIcon={<Download size={14} color={colors.text.inverse} strokeWidth={2.25} />}
              onPress={() =>
                toast.show({ variant: 'success', title: 'CSV exported (mock)' })
              }
            />
          </>
        }
      />

      <View style={styles.statsRow}>
        <StatCard
          label="Gross collected"
          value={formatCurrency(summary.grossCents)}
          changePct={revenueSeries?.changePct}
          helper="last 30 days"
          tone="brand"
          icon={<Wallet size={14} color={colors.brand.deep} strokeWidth={2.25} />}
        />
        <StatCard
          label="Processor fees"
          value={formatCurrency(summary.feesCents)}
          helper="Stripe + platform"
          tone="warning"
        />
        <StatCard
          label="Refunds"
          value={formatCurrency(summary.refundsCents)}
          helper="this period"
          tone="live"
        />
        <StatCard
          label="Net to your org"
          value={formatCurrency(summary.netCents)}
          helper={`Outstanding ${formatCurrency(summary.outstandingCents)}`}
          tone="success"
        />
      </View>

      <Card>
        <View style={styles.cardHead}>
          <Text variant="h3" color={colors.text.primary}>
            Net revenue · 12 weeks
          </Text>
          {revenueSeries ? (
            <Tag
              size="sm"
              tone={revenueSeries.changePct >= 0 ? 'success' : 'live'}
              leadingDot
              label={`${revenueSeries.changePct >= 0 ? '+' : ''}${revenueSeries.changePct.toFixed(1)}%`}
            />
          ) : null}
        </View>
        {revenueSeries ? (
          <Sparkline points={revenueSeries.points} unit={revenueSeries.unit} />
        ) : null}
      </Card>

      <Card>
        <View style={styles.cardHead}>
          <Text variant="h3" color={colors.text.primary}>
            Recent settled payments
          </Text>
          <Button
            label="Open Payments"
            variant="ghost"
            size="sm"
            onPress={() => navigation.navigate('Payments')}
          />
        </View>
        {recentPayments.map((p) => (
          <View key={p.id} style={styles.row}>
            <View style={styles.rowBody}>
              <Text variant="bodySm" color={colors.text.primary}>
                {p.payerName} · {p.contextLabel}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                {p.paidAtIso ? formatDate(p.paidAtIso) : '—'} · {STATUS_LABEL[p.status]}
              </Text>
            </View>
            <Text variant="bodySm" color={colors.brand.primary}>
              {formatCurrency(p.amountCents)}
            </Text>
            <Button
              label="Open"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('PaymentDetail', { id: p.id })}
            />
          </View>
        ))}
      </Card>
    </PageScroll>
  );
}

function Sparkline({ points, unit }: { points: number[]; unit: 'count' | 'currency' }) {
  const max = Math.max(...points, 1);
  return (
    <View>
      <View style={styles.sparkRow}>
        {points.map((v, i) => {
          const h = Math.max(8, Math.round((v / max) * 80));
          return (
            <View key={i} style={[styles.sparkBar, { height: h }]} accessibilityLabel={`Week ${i + 1}: ${v}`} />
          );
        })}
      </View>
      <View style={styles.sparkLabels}>
        <Text variant="caption" color={colors.text.muted}>
          12w ago
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          {unit === 'currency'
            ? formatCurrency(points[points.length - 1] ?? 0)
            : (points[points.length - 1] ?? 0).toLocaleString()}
        </Text>
      </View>
    </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  sparkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 96,
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
