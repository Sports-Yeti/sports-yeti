import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CalendarRange, Inbox, Plus, Warehouse } from 'lucide-react-native';
import { OrgAvatar, Tag } from '@sports-yeti/ui';
import {
  bookingsForSpace,
  DEMO_USER_ID,
  facilitiesForFmUser,
  organizationById,
  pendingExternalRentals,
  spacesByFacility,
  type Booking,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, Tag as UITag, Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, radii, spacing } from '../../theme';
import {
  formatCurrency,
  formatRange,
  formatRelative,
} from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

export function FmDashboardScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const facilities = useMemo(() => facilitiesForFmUser(DEMO_USER_ID), []);
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Roll-up: bookings across all FM facilities
  const allBookings = useMemo<Booking[]>(() => {
    return facilities.flatMap((f) =>
      spacesByFacility(f.id).flatMap((s) => bookingsForSpace(s.id)),
    );
  }, [facilities]);
  const todayBookings = allBookings.filter((b) =>
    b.startIso.startsWith(todayIso),
  );
  const pending = pendingExternalRentals().filter((b) => {
    const facilityIds = new Set(facilities.map((f) => f.id));
    return facilities.some((f) =>
      spacesByFacility(f.id).some((s) => s.id === b.spaceId),
    ) && facilityIds.size > 0;
  });
  const externalApproved = allBookings.filter(
    (b) => b.kind === 'external_rental' && b.status === 'approved',
  );
  const internalGames = allBookings.filter(
    (b) => b.kind === 'internal_game',
  );
  const totalSpaces = facilities.reduce(
    (sum, f) => sum + spacesByFacility(f.id).length,
    0,
  );

  // Mock utilization: % of week-hours booked across all spaces.
  const utilizationPct = Math.min(
    100,
    Math.round((allBookings.length / Math.max(1, totalSpaces * 14)) * 100),
  );

  // Mock revenue: sum of approved + completed external rental amounts.
  const revenueCents = externalApproved.reduce(
    (sum, b) => sum + b.amountCents,
    0,
  );

  // For per-org branding overlay: use the first facility's owner org.
  const primaryOrg = facilities[0]
    ? organizationById(facilities[0].ownerOrgId)
    : undefined;

  const inner = (
    <PageScroll>
      <PageHeader
        variant="hero"
        eyebrow="FACILITY MANAGER"
        title="Today at your venues"
        subtitle="Pending booking requests, today's slate, and the week's utilization in one view."
        meta={`${facilities.length} facilit${facilities.length === 1 ? 'y' : 'ies'} · ${totalSpaces} spaces`}
        trailing={
          primaryOrg ? (
            <View style={[styles.headerTrail, { gap: spacing.sm }]}>
              <OrgAvatar
                name={primaryOrg.name}
                logoUrl={primaryOrg.logoUrl}
                brandColor={primaryOrg.brandColor}
                size="md"
              />
              <Button
                size="sm"
                variant="solid"
                label="New booking"
                leadingIcon={
                  <Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />
                }
                onPress={() => navigation.navigate('BookingForm')}
              />
            </View>
          ) : null
        }
      />

      <View style={[styles.statRow, { gap: spacing.md }]}>
        <StatCard
          label="Pending requests"
          value={String(pending.length)}
          tone="warning"
          urgent={pending.length > 0}
          onPress={() => navigation.navigate('Approvals')}
        />
        <StatCard
          label="Today's bookings"
          value={String(todayBookings.length)}
          tone="brand"
        />
        <StatCard
          label="Utilization (mock)"
          value={`${utilizationPct}%`}
          tone="alpine"
          progress={utilizationPct / 100}
        />
        <StatCard
          label="Revenue (mock)"
          value={formatCurrency(revenueCents)}
          tone="success"
        />
      </View>

      <Card padded>
        <View style={[styles.cardHead, { gap: spacing.sm }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="h3">Pending booking requests</Text>
            <Text variant="caption" color={colors.text.muted}>
              Approve, reject, or counter — renters are notified instantly.
            </Text>
          </View>
          <Inbox size={20} color={colors.brand.primary} />
        </View>
        {pending.length === 0 ? (
          <Text variant="body" color={colors.text.secondary}>
            No requests waiting. Nicely done.
          </Text>
        ) : (
          pending.slice(0, 5).map((b) => (
            <View key={b.id} style={[styles.row, { gap: spacing.sm }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodySm" weight="600">
                  {b.externalRenter?.organizationName ?? 'External renter'}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {formatRange(b.startIso, b.endIso)} · requested{' '}
                  {formatRelative(b.startIso)}
                </Text>
              </View>
              <UITag size="sm" tone="warning" label={formatCurrency(b.amountCents)} />
              <Button
                size="sm"
                variant="ghost"
                label="Review"
                onPress={() =>
                  navigation.navigate('ExternalBookingRequest', { id: b.id })
                }
              />
              <Button
                size="sm"
                variant="solid"
                label="Approve"
                onPress={() => undefined}
              />
            </View>
          ))
        )}
      </Card>

      <Card padded>
        <View style={[styles.cardHead, { gap: spacing.sm }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="h3">Today's calendar</Text>
            <Text variant="caption" color={colors.text.muted}>
              Internal vs external split for the day.
            </Text>
          </View>
          <Button
            size="sm"
            variant="outline"
            label="Open calendar"
            leadingIcon={
              <CalendarRange
                size={14}
                color={colors.text.primary}
                strokeWidth={2.4}
              />
            }
            onPress={() => navigation.navigate('Bookings')}
          />
        </View>
        {todayBookings.length === 0 ? (
          <Text variant="body" color={colors.text.secondary}>
            No bookings today.
          </Text>
        ) : (
          todayBookings.map((b) => (
            <View key={b.id} style={[styles.row, { gap: spacing.sm }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodySm" weight="600">
                  {b.kind === 'internal_game'
                    ? 'League game'
                    : b.externalRenter?.organizationName ?? 'External rental'}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {formatRange(b.startIso, b.endIso)}
                </Text>
              </View>
              <UITag
                size="sm"
                tone={b.kind === 'internal_game' ? 'info' : 'success'}
                label={b.kind === 'internal_game' ? 'Internal' : 'External'}
              />
            </View>
          ))
        )}
      </Card>

      <Card padded>
        <View style={[styles.cardHead, { gap: spacing.sm }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="h3">Your facilities</Text>
            <Text variant="caption" color={colors.text.muted}>
              Quick access to spaces, availability, and analytics.
            </Text>
          </View>
          <Warehouse size={20} color={colors.brand.primary} />
        </View>
        {facilities.map((f) => {
          const spaces = spacesByFacility(f.id);
          return (
            <View key={f.id} style={[styles.row, { gap: spacing.sm }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodySm" weight="600">
                  {f.name}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {f.city}, {f.state} · {spaces.length} spaces
                </Text>
              </View>
              <Button
                size="sm"
                variant="ghost"
                label="Calendar"
                onPress={() => navigation.navigate('Bookings')}
              />
              <Button
                size="sm"
                variant="ghost"
                label="Availability"
                onPress={() =>
                  navigation.navigate('FacilityAvailability', { id: f.id })
                }
              />
              <Button
                size="sm"
                variant="solid"
                label="Open"
                onPress={() =>
                  navigation.navigate('FacilityDetail', { id: f.id })
                }
              />
            </View>
          );
        })}
      </Card>

      <View style={[styles.summaryRow, { gap: spacing.md }]}>
        <Card padded>
          <Text variant="h3">Mix this week</Text>
          <View style={[styles.metaRow, { gap: spacing.xs }]}>
            <UITag
              size="sm"
              tone="info"
              label={`${internalGames.length} internal games`}
            />
            <UITag
              size="sm"
              tone="success"
              label={`${externalApproved.length} external rentals`}
            />
          </View>
        </Card>
      </View>
    </PageScroll>
  );

  if (primaryOrg) {
    return <OrgBrandingProvider org={primaryOrg}>{inner}</OrgBrandingProvider>;
  }
  return inner;
}

const styles = StyleSheet.create({
  headerTrail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
});
