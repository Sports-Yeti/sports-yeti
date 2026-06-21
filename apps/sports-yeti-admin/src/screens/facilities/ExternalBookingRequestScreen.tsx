import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  bookingById,
  facilityById,
  spaceById,
} from '@sports-yeti/mocks';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';
import { Button, Card, Modal, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { formatCurrency, formatRange } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
  goBack: () => void;
}

export function ExternalBookingRequestScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const booking = useMemo(
    () => bookingById(route.params.id),
    [route.params.id],
  );
  const space = useMemo(
    () => (booking ? spaceById(booking.spaceId) : undefined),
    [booking],
  );
  const facility = useMemo(
    () => (space ? facilityById(space.facilityId) : undefined),
    [space],
  );
  const [confirmReject, setConfirmReject] = useState(false);

  if (!booking || !space || !facility) {
    return (
      <PageScroll>
        <PageHeader title="Booking request not found" />
      </PageScroll>
    );
  }

  const renter = booking.externalRenter;

  return (
    <PageScroll>
      <PageHeader
        title="Booking request"
        subtitle={`${facility.name} · ${space.name}`}
        crumbs={[
          { label: 'Venues' },
          { label: 'Facilities', route: 'Facilities' },
          { label: facility.name, route: 'FacilityDetail' },
          { label: 'Request' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
      />

      <Card padded>
        <View style={[styles.head, { gap: spacing.sm }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="h2">
              {renter?.organizationName ?? 'External renter'}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              {renter?.contactName ?? '—'} · {renter?.contactEmail ?? '—'}
            </Text>
            {renter?.contactPhone ? (
              <Text variant="caption" color={colors.text.muted}>
                {renter.contactPhone}
              </Text>
            ) : null}
          </View>
          <Tag
            size="md"
            tone={
              booking.status === 'approved'
                ? 'success'
                : booking.status === 'rejected'
                ? 'error'
                : 'warning'
            }
            leadingDot
            label={booking.status}
          />
        </View>
      </Card>

      <Card padded>
        <Text variant="h3">Slot</Text>
        <Text variant="body">{formatRange(booking.startIso, booking.endIso)}</Text>
        <Text variant="bodySm" color={colors.text.secondary}>
          {space.name} · {facility.name}
        </Text>
      </Card>

      <Card padded>
        <Text variant="h3">Intent</Text>
        <Text variant="body">{renter?.intendedUse ?? '—'}</Text>
        {booking.notes ? (
          <Text variant="bodySm" color={colors.text.muted}>
            Notes · {booking.notes}
          </Text>
        ) : null}
      </Card>

      <Card padded>
        <Text variant="h3">Total</Text>
        <Text variant="h2" color={colors.brand.primary}>
          {formatCurrency(booking.amountCents)}
        </Text>
      </Card>

      {booking.status === 'requested' ? (
        <View style={[styles.actions, { gap: spacing.sm }]}>
          <Button
            size="md"
            variant="ghost"
            label="Back"
            onPress={() => navigation.goBack()}
          />
          <Button
            size="md"
            variant="outline"
            label="Reject"
            onPress={() => setConfirmReject(true)}
          />
          <Button
            size="md"
            variant="solid"
            label="Approve"
            onPress={() =>
              toast.show({
                variant: 'success',
                title: 'Booking approved',
                description: `${renter?.organizationName ?? 'Renter'} locked in for ${formatRange(booking.startIso, booking.endIso)}.`,
              })
            }
          />
        </View>
      ) : null}

      <Modal
        visible={confirmReject}
        onRequestClose={() => setConfirmReject(false)}
        variant="destructive"
        title={`Reject ${renter?.organizationName ?? 'this request'}?`}
        description="Renter will be notified. They can submit a new request for a different time."
        primaryAction={{
          label: 'Reject',
          onPress: () => {
            setConfirmReject(false);
            toast.show({ variant: 'info', title: 'Request rejected (mock)' });
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmReject(false),
        }}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 12,
  },
});
