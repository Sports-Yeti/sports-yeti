import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { CalendarClock, MapPin, Users } from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Modal, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { bookingById, STATUS_LABEL, type BookingStatus } from '../../mocks/bookings';
import { facilityById } from '../../mocks/facilities';
import { formatCurrency, formatDate, formatTime } from '../../lib/format';
import { usePaymentActions } from '../../lib/checkout';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE: Record<BookingStatus, 'success' | 'warning' | 'live' | 'neutral'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'live',
  completed: 'neutral',
};

export function BookingDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const booking = bookingById(route.params.id);
  const { chargeBalance, isProcessing } = usePaymentActions();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [extraPaidCents, setExtraPaidCents] = useState(0);

  if (!booking) {
    return (
      <PageScroll>
        <PageHeader
          title="Booking not found"
          crumbs={[{ label: 'Bookings', route: 'Bookings' }, { label: '—' }]}
          onNavigate={(r) => navigation.navigate(r)}
        />
        <EmptyState
          title="Booking not found"
          primaryAction={{ label: 'Back to bookings', onPress: () => navigation.navigate('Bookings') }}
        />
      </PageScroll>
    );
  }

  const facility = facilityById(booking.facilityId);
  const balance = Math.max(
    0,
    booking.amountCents - booking.paidCents - extraPaidCents,
  );

  const handleCharge = async () => {
    const result = await chargeBalance({
      bookingId: booking.id,
      amountCents: balance,
    });
    if (result.status === 'success') {
      setExtraPaidCents((c) => c + balance);
      toast.show({
        variant: 'success',
        title: `Charged ${formatCurrency(balance)}`,
        description: result.id
          ? `Stripe ${result.id} captured.`
          : 'Card on file charged via Stripe.',
      });
      return;
    }
    if (result.status === 'authentication_required') {
      toast.show({
        variant: 'warning',
        title: 'Cardholder action needed',
        description: result.error,
      });
      return;
    }
    toast.show({
      variant: 'error',
      title: 'Charge failed',
      description: result.error,
      action: { label: 'Retry', onPress: handleCharge },
    });
  };

  return (
    <PageScroll>
      <PageHeader
        title={`${booking.facilityName} · ${booking.spaceName}`}
        subtitle={`Hosted by ${booking.hostName}`}
        crumbs={[
          { label: 'Bookings', route: 'Bookings' },
          { label: booking.spaceName },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        meta={`${formatDate(booking.startsAtIso)} · ${formatTime(booking.startsAtIso)} – ${formatTime(booking.endsAtIso)}`}
        trailing={
          <>
            <Tag tone={STATUS_TONE[booking.status]} leadingDot label={STATUS_LABEL[booking.status]} />
            {booking.status === 'confirmed' ? (
              <Button
                label="Cancel booking"
                variant="destructive"
                size="sm"
                onPress={() => setConfirmCancel(true)}
              />
            ) : null}
          </>
        }
      />

      <View style={styles.twoCol}>
        <Card style={styles.col}>
          <Text variant="h3" color={colors.text.primary}>
            Details
          </Text>
          <View style={styles.metaRow}>
            <CalendarClock size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary}>
              {formatDate(booking.startsAtIso, { weekday: 'long', month: 'short', day: 'numeric' })} · {formatTime(booking.startsAtIso)} – {formatTime(booking.endsAtIso)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary}>
              {booking.facilityName} · {booking.spaceName}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Users size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary}>
              {booking.partySize} players · {booking.hostHandle}
            </Text>
          </View>
          {booking.notes ? (
            <Text variant="caption" color={colors.text.muted} style={styles.note}>
              {booking.notes}
            </Text>
          ) : null}
          {facility ? (
            <Button
              label="Open facility"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('FacilityDetail', { id: facility.id })}
            />
          ) : null}
        </Card>

        <Card style={styles.col}>
          <Text variant="h3" color={colors.text.primary}>
            Payment
          </Text>
          <View style={styles.feeRow}>
            <Text variant="body" color={colors.text.secondary}>
              Total
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {formatCurrency(booking.amountCents)}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text variant="body" color={colors.text.secondary}>
              Paid
            </Text>
            <Text variant="bodySm" color={colors.status.success}>
              {formatCurrency(booking.paidCents)}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text variant="body" color={colors.text.primary}>
              Balance
            </Text>
            <Text variant="h3" color={balance > 0 ? colors.status.warning : colors.brand.primary}>
              {formatCurrency(Math.max(0, balance))}
            </Text>
          </View>
          {balance > 0 ? (
            <Button
              label={
                isProcessing
                  ? 'Charging…'
                  : `Charge ${formatCurrency(balance)}`
              }
              variant="solid"
              size="sm"
              disabled={isProcessing}
              onPress={handleCharge}
            />
          ) : null}
        </Card>
      </View>

      <Modal
        visible={confirmCancel}
        onRequestClose={() => setConfirmCancel(false)}
        variant="destructive"
        title="Cancel booking?"
        description="A full refund is possible up to 24 hours before start. The host is notified."
        primaryAction={{
          label: 'Cancel booking',
          onPress: () => {
            setConfirmCancel(false);
            toast.show({
              variant: 'info',
              title: 'Booking cancelled',
              description: `${formatCurrency(booking.paidCents)} refund pending.`,
            });
            navigation.navigate('Bookings');
          },
        }}
        secondaryAction={{
          label: 'Keep booking',
          onPress: () => setConfirmCancel(false),
        }}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  col: {
    flex: 1,
    minWidth: 320,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  note: {
    marginTop: spacing.sm,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
});
