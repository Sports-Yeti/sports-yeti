import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Edit3, MapPin, Star } from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Tag, Text, useToast } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { facilityById } from '../../mocks/facilities';
import { BOOKINGS } from '../../mocks/bookings';
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

export function FacilityDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const facility = facilityById(route.params.id);

  if (!facility) {
    return (
      <PageScroll>
        <PageHeader
          title="Facility not found"
          crumbs={[{ label: 'Facilities', route: 'Facilities' }, { label: '—' }]}
          onNavigate={(r) => navigation.navigate(r)}
        />
        <EmptyState
          title="Facility not found"
          primaryAction={{ label: 'Back to facilities', onPress: () => navigation.navigate('Facilities') }}
        />
      </PageScroll>
    );
  }

  const facilityBookings = BOOKINGS.filter((b) => b.facilityId === facility.id);
  const upcoming = facilityBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');

  return (
    <PageScroll>
      <PageHeader
        title={facility.name}
        subtitle={facility.address}
        crumbs={[
          { label: 'Facilities', route: 'Facilities' },
          { label: facility.name },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        meta={facility.hoursLabel}
        trailing={
          <Button
            label="Edit"
            variant="ghost"
            size="sm"
            leadingIcon={<Edit3 size={14} color={colors.brand.primary} strokeWidth={2.25} />}
            onPress={() =>
              toast.show({ variant: 'info', title: 'Facility editor coming soon' })
            }
          />
        }
      />

      <Image source={{ uri: facility.cover }} style={styles.cover} />

      <View style={styles.statsRow}>
        <StatCard
          label="Spaces"
          value={String(facility.spaces.length)}
          helper={`${facility.spaces.filter((s) => s.isIndoor).length} indoor`}
          tone="brand"
        />
        <StatCard
          label="Rating"
          value={facility.rating.toFixed(1)}
          helper={`${facility.reviewCount} reviews`}
          tone="success"
          icon={<Star size={14} color={colors.status.success} strokeWidth={2.25} />}
        />
        <StatCard
          label="Bookings · 30d"
          value={String(facilityBookings.length)}
          helper={`${upcoming.length} upcoming`}
          tone="warning"
        />
        <StatCard
          label="Avg. hourly"
          value={formatCurrency(
            Math.round(
              facility.spaces.reduce((acc, s) => acc + s.hourlyRateCents, 0) /
                Math.max(facility.spaces.length, 1),
            ),
          )}
          tone="brand"
        />
      </View>

      <View style={styles.twoCol}>
        <Card style={styles.col}>
          <Text variant="h3" color={colors.text.primary}>
            Spaces
          </Text>
          {facility.spaces.map((s) => (
            <View key={s.id} style={styles.spaceRow}>
              <View style={styles.spaceBody}>
                <Text variant="bodySm" color={colors.text.primary} weight="600">
                  {s.name}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {s.surface} · capacity {s.capacity} · {s.isIndoor ? 'Indoor' : 'Outdoor'}
                </Text>
              </View>
              <Text variant="bodySm" color={colors.brand.primary}>
                {s.hourlyRateCents === 0 ? 'Free' : `${formatCurrency(s.hourlyRateCents)}/hr`}
              </Text>
            </View>
          ))}
        </Card>

        <Card style={styles.col}>
          <Text variant="h3" color={colors.text.primary}>
            Amenities
          </Text>
          <View style={styles.amenities}>
            {facility.amenities.map((a) => (
              <Tag key={a} size="sm" tone="neutral" label={a} />
            ))}
          </View>
          <View style={styles.metaRow}>
            <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary}>
              {facility.address}
            </Text>
          </View>
        </Card>
      </View>

      <Card>
        <View style={styles.cardHead}>
          <Text variant="h3" color={colors.text.primary}>
            Recent bookings
          </Text>
          <Button
            label="Open booking calendar"
            variant="ghost"
            size="sm"
            onPress={() => navigation.navigate('Bookings')}
          />
        </View>
        {facilityBookings.slice(0, 5).map((b) => (
          <View key={b.id} style={styles.bookingRow}>
            <View style={styles.bookingBody}>
              <Text variant="bodySm" color={colors.text.primary}>
                {b.spaceName} · {b.hostName}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                {new Date(b.startsAtIso).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Tag
              size="sm"
              tone={
                b.status === 'confirmed'
                  ? 'success'
                  : b.status === 'pending'
                  ? 'warning'
                  : 'neutral'
              }
              label={b.status}
            />
            <Button
              label="Open"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('BookingDetail', { id: b.id })}
            />
          </View>
        ))}
      </Card>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    height: 200,
    borderRadius: radii.card,
    backgroundColor: colors.surface.chip,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  col: {
    flex: 1,
    minWidth: 320,
    gap: spacing.md,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  spaceBody: {
    flex: 1,
    gap: 2,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  bookingBody: {
    flex: 1,
    gap: 2,
  },
});
