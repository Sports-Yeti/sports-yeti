import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  bookingsForSpace,
  DEMO_USER_ID,
  facilitiesForFmUser,
  spacesByFacility,
  type Booking,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Card, Tag, Text } from '../../ui';
import { colors, spacing } from '../../theme';
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const HOURS_OF_WEEK = 7 * 14; // 14 bookable hours/day

export function FmAnalyticsScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const facilities = useMemo(() => facilitiesForFmUser(DEMO_USER_ID), []);

  const perFacility = useMemo(() => {
    return facilities.map((f) => {
      const spaces = spacesByFacility(f.id);
      const bookings: Booking[] = spaces.flatMap((s) => bookingsForSpace(s.id));
      const totalHours = spaces.length * HOURS_OF_WEEK;
      // Mock: 1 booking ≈ 1.5h
      const bookedHours = bookings.length * 1.5;
      const utilizationPct = Math.min(
        100,
        Math.round((bookedHours / Math.max(1, totalHours)) * 100),
      );
      const externalRevenue = bookings
        .filter((b) => b.kind === 'external_rental' && b.status !== 'rejected')
        .reduce((sum, b) => sum + b.amountCents, 0);
      const internalCount = bookings.filter(
        (b) => b.kind === 'internal_game',
      ).length;
      const externalCount = bookings.filter(
        (b) => b.kind === 'external_rental',
      ).length;
      return {
        facility: f,
        spacesCount: spaces.length,
        bookedHours,
        totalHours,
        utilizationPct,
        externalRevenue,
        internalCount,
        externalCount,
      };
    });
  }, [facilities]);

  const totals = useMemo(
    () =>
      perFacility.reduce(
        (acc, row) => ({
          spaces: acc.spaces + row.spacesCount,
          bookedHours: acc.bookedHours + row.bookedHours,
          totalHours: acc.totalHours + row.totalHours,
          revenue: acc.revenue + row.externalRevenue,
          internal: acc.internal + row.internalCount,
          external: acc.external + row.externalCount,
        }),
        {
          spaces: 0,
          bookedHours: 0,
          totalHours: 0,
          revenue: 0,
          internal: 0,
          external: 0,
        },
      ),
    [perFacility],
  );

  const overallUtilization = Math.min(
    100,
    Math.round((totals.bookedHours / Math.max(1, totals.totalHours)) * 100),
  );

  return (
    <PageScroll>
      <PageHeader
        variant="flatHero"
        eyebrow="ANALYTICS"
        title="Venue utilization"
        subtitle="True utilization = booked hours ÷ available hours. Internal-vs-external split + revenue by facility."
        crumbs={[{ label: 'Operations' }, { label: 'FM analytics' }]}
        onNavigate={(r) => navigation.navigate(r)}
      />

      <View style={[styles.statRow, { gap: spacing.md }]}>
        <StatCard
          label="Overall utilization"
          value={`${overallUtilization}%`}
          tone="alpine"
          progress={overallUtilization / 100}
        />
        <StatCard
          label="External revenue"
          value={formatCurrency(totals.revenue)}
          tone="success"
        />
        <StatCard
          label="Internal games"
          value={String(totals.internal)}
          tone="brand"
        />
        <StatCard
          label="External rentals"
          value={String(totals.external)}
          tone="warning"
        />
      </View>

      {perFacility.map((row) => (
        <Card key={row.facility.id} padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="h3">{row.facility.name}</Text>
              <Text variant="caption" color={colors.text.muted}>
                {row.spacesCount} spaces · {row.facility.city}, {row.facility.state}
              </Text>
            </View>
            <Tag
              size="md"
              tone={row.utilizationPct >= 60 ? 'success' : 'warning'}
              label={`${row.utilizationPct}% utilization`}
              leadingDot
            />
          </View>
          <View style={[styles.metaRow, { gap: spacing.xs }]}>
            <Tag
              size="sm"
              tone="info"
              label={`${row.internalCount} internal`}
            />
            <Tag
              size="sm"
              tone="success"
              label={`${row.externalCount} external`}
            />
            <Tag
              size="sm"
              tone="brand"
              label={`${formatCurrency(row.externalRevenue)} revenue`}
            />
          </View>
          <View style={styles.heatmap}>
            <Text variant="eyebrow" color={colors.text.muted}>
              PEAK HEATMAP (mock)
            </Text>
            <View style={[styles.heatmapRow, { gap: 2 }]}>
              {Array.from({ length: 14 }).map((_, h) => {
                // Mock: heat = (h % 4 == 0 ? hot : warm)
                const intensity = ((row.utilizationPct + h * 7) % 100) / 100;
                return (
                  <View
                    key={h}
                    style={[
                      styles.heatmapCell,
                      {
                        backgroundColor: intensityToColor(intensity),
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.heatmapLabels}>
              <Text variant="caption" color={colors.text.muted}>
                6 AM
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                8 PM
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </PageScroll>
  );
}

function intensityToColor(i: number): string {
  // Cool blue → warm orange
  if (i < 0.25) return '#DBEAFE';
  if (i < 0.5) return '#93C5FD';
  if (i < 0.75) return '#FB923C';
  return '#EA580C';
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  heatmap: {
    marginTop: 16,
    gap: 6,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heatmapCell: {
    flex: 1,
    height: 28,
    borderRadius: 4,
  },
  heatmapLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
