import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Edit3, MapPin } from 'lucide-react-native';
import { OrgAvatar } from '@sports-yeti/ui';
import {
  bookingsForSpace,
  facilityById,
  organizationById,
  ownershipForFacility,
  rentalConfigForSpace,
  spacesByFacility,
  userById,
  type Booking,
  type Space,
  type SpaceRentalMode,
} from '@sports-yeti/mocks';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Tabs, Tag, Text } from '../../ui';
import { OrgBrandingProvider } from '../../features/org-branding';
import { colors, spacing } from '../../theme';
import {
  formatCurrency,
  formatRange,
  formatRelative,
} from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'spaces', label: 'Spaces' },
  { key: 'availability', label: 'Availability' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'managers', label: 'Managers' },
  { key: 'analytics', label: 'Analytics' },
];

const RENTAL_TONE: Record<
  SpaceRentalMode,
  'success' | 'info' | 'warning'
> = {
  internal: 'info',
  external: 'success',
  both: 'warning',
};

const RENTAL_LABEL: Record<SpaceRentalMode, string> = {
  internal: 'Internal',
  external: 'External',
  both: 'Both',
};

export function FacilityDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const facility = useMemo(
    () => facilityById(route.params.id),
    [route.params.id],
  );
  const org = useMemo(
    () => (facility ? organizationById(facility.ownerOrgId) : undefined),
    [facility],
  );
  const ownership = useMemo(
    () => (facility ? ownershipForFacility(facility.id) : undefined),
    [facility],
  );
  const spaces = useMemo(
    () => (facility ? spacesByFacility(facility.id) : []),
    [facility],
  );
  const allBookings: Booking[] = useMemo(
    () => spaces.flatMap((s) => bookingsForSpace(s.id)),
    [spaces],
  );
  const [tab, setTab] = useState('overview');

  if (!facility || !org) {
    return (
      <PageScroll>
        <PageHeader title="Facility not found" />
        <EmptyState
          title="Facility not found"
          primaryAction={{
            label: 'Back to facilities',
            onPress: () => navigation.navigate('Facilities'),
          }}
        />
      </PageScroll>
    );
  }

  const externalRentals = allBookings.filter(
    (b) => b.kind === 'external_rental',
  );
  const internalGames = allBookings.filter(
    (b) => b.kind === 'internal_game',
  );
  const pendingRentals = externalRentals.filter(
    (b) => b.status === 'requested',
  );

  // Mock utilization: % of week-hours booked (Phase 7 expands this).
  const utilizationPct = Math.min(
    100,
    Math.round((allBookings.length / Math.max(1, spaces.length * 14)) * 100),
  );

  const inner = (
    <PageScroll>
      <PageHeader
        title={facility.name}
        subtitle={`${facility.address} · ${facility.city}, ${facility.state}`}
        crumbs={[
          { label: 'Venues' },
          { label: 'Facilities', route: 'Facilities' },
          { label: facility.name },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        trailing={
          <View style={[styles.headerTrail, { gap: spacing.sm }]}>
            <OrgAvatar
              name={org.name}
              logoUrl={org.logoUrl}
              brandColor={org.brandColor}
              size="md"
            />
            <Button
              size="sm"
              variant="outline"
              label="Edit"
              leadingIcon={
                <Edit3 size={14} color={colors.text.primary} strokeWidth={2.4} />
              }
              onPress={() =>
                navigation.navigate('FacilityForm', { id: facility.id })
              }
            />
          </View>
        }
      />

      <View style={[styles.statRow, { gap: spacing.md }]}>
        <StatCard label="Spaces" value={String(spaces.length)} tone="brand" />
        <StatCard
          label="Pending rentals"
          value={String(pendingRentals.length)}
          tone="warning"
          urgent={pendingRentals.length > 0}
        />
        <StatCard
          label="Internal games"
          value={String(internalGames.length)}
          tone="success"
        />
        <StatCard
          label="Utilization (mock)"
          value={`${utilizationPct}%`}
          tone="alpine"
          progress={utilizationPct / 100}
        />
      </View>

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'overview' ? (
        <Card padded>
          <Text variant="h3">About</Text>
          <View style={[styles.iconRow, { gap: spacing.xs }]}>
            <MapPin size={14} color={colors.text.muted} />
            <Text variant="bodySm" color={colors.text.secondary}>
              {facility.address}, {facility.city}, {facility.state}{' '}
              {facility.zip}
            </Text>
          </View>
          {facility.description ? (
            <Text variant="body" color={colors.text.secondary}>
              {facility.description}
            </Text>
          ) : null}
          <View style={[styles.metaRow, { gap: spacing.xs, marginTop: 12 }]}>
            {facility.amenities.map((a) => (
              <Tag key={a} tone="neutral" size="sm" label={a} />
            ))}
          </View>
        </Card>
      ) : null}

      {tab === 'spaces' ? (
        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <Text variant="h3">Spaces</Text>
            <Button
              size="sm"
              variant="solid"
              label="Add space"
              onPress={() => navigation.navigate('SpaceForm', { id: facility.id })}
            />
          </View>
          {spaces.map((s: Space) => {
            const cfg = rentalConfigForSpace(s.id);
            return (
              <View key={s.id} style={[styles.spaceRow, { gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodySm" weight="600">
                    {s.name}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {s.surface} · {s.isIndoor ? 'Indoor' : 'Outdoor'} ·{' '}
                    capacity {s.capacity}
                  </Text>
                </View>
                {cfg ? (
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Tag
                      size="sm"
                      tone={RENTAL_TONE[cfg.rentalMode]}
                      label={RENTAL_LABEL[cfg.rentalMode]}
                    />
                    {cfg.externalHourlyRateCents ? (
                      <Text variant="caption" color={colors.text.muted}>
                        {formatCurrency(cfg.externalHourlyRateCents)}/hr ext.
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  label="Edit"
                  onPress={() =>
                    navigation.navigate('SpaceForm', { id: s.id })
                  }
                />
              </View>
            );
          })}
        </Card>
      ) : null}

      {tab === 'availability' ? (
        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <Text variant="h3">Recurring availability</Text>
            <Button
              size="sm"
              variant="outline"
              label="Open editor"
              onPress={() =>
                navigation.navigate('FacilityAvailability', { id: facility.id })
              }
            />
          </View>
          <Text variant="body" color={colors.text.secondary}>
            Per-space day-of-week × time grid with peak/off-peak pricing
            overrides. Use the editor to set ongoing availability for the
            season.
          </Text>
        </Card>
      ) : null}

      {tab === 'rentals' ? (
        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <Text variant="h3">External rentals</Text>
            <Button
              size="sm"
              variant="outline"
              label="Public listing"
              onPress={() =>
                navigation.navigate('ExternalRentalListing', {
                  id: facility.id,
                })
              }
            />
          </View>
          {externalRentals.length === 0 ? (
            <Text variant="body" color={colors.text.secondary}>
              No external rentals yet. Mark a space as external to start
              accepting requests.
            </Text>
          ) : (
            externalRentals.map((b) => (
              <View key={b.id} style={[styles.bookingRow, { gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodySm" weight="600">
                    {b.externalRenter?.organizationName ?? 'Unknown renter'}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {formatRange(b.startIso, b.endIso)}
                  </Text>
                </View>
                <Tag
                  size="sm"
                  tone={
                    b.status === 'approved'
                      ? 'success'
                      : b.status === 'rejected'
                      ? 'error'
                      : 'warning'
                  }
                  label={b.status}
                  leadingDot
                />
                <Button
                  size="sm"
                  variant="ghost"
                  label="Review"
                  onPress={() =>
                    navigation.navigate('ExternalBookingRequest', {
                      id: b.id,
                    })
                  }
                />
              </View>
            ))
          )}
        </Card>
      ) : null}

      {tab === 'bookings' ? (
        <Card padded>
          <Text variant="h3">All bookings</Text>
          {allBookings.map((b) => (
            <View key={b.id} style={[styles.bookingRow, { gap: spacing.sm }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodySm" weight="600">
                  {b.kind === 'internal_game'
                    ? 'League game'
                    : b.externalRenter?.organizationName ?? 'External rental'}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {formatRange(b.startIso, b.endIso)} · requested{' '}
                  {formatRelative(b.startIso)}
                </Text>
              </View>
              <Tag
                size="sm"
                tone={b.kind === 'internal_game' ? 'info' : 'success'}
                label={b.kind === 'internal_game' ? 'Internal' : 'External'}
              />
            </View>
          ))}
        </Card>
      ) : null}

      {tab === 'managers' ? (
        <Card padded>
          <View style={[styles.cardHead, { gap: spacing.sm }]}>
            <Text variant="h3">Facility managers</Text>
            <Button
              size="sm"
              variant="outline"
              label="Manage access"
              onPress={() => undefined}
            />
          </View>
          {ownership?.managerUserIds.map((uid) => {
            const u = userById(uid);
            return (
              <View key={uid} style={[styles.bookingRow, { gap: spacing.sm }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodySm" weight="600">
                    {u?.name ?? uid}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {u?.email ?? '—'}
                  </Text>
                </View>
                <Tag size="sm" tone="success" label="Facility Mgr" leadingDot />
              </View>
            );
          })}
        </Card>
      ) : null}

      {tab === 'analytics' ? (
        <Card padded>
          <Text variant="h3">Utilization (mock)</Text>
          <Text variant="body" color={colors.text.secondary}>
            Phase 7 (FM admin surface) computes true utilization from
            booked-hours ÷ available-hours, plus revenue split + peak/off-peak
            heatmaps. This card stays as a placeholder until then.
          </Text>
        </Card>
      ) : null}
    </PageScroll>
  );

  return <OrgBrandingProvider org={org}>{inner}</OrgBrandingProvider>;
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
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
});
