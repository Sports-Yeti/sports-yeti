import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { CalendarPlus, ChevronLeft, MapPin } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import { Card, EmptyState, Tabs, Tag, Text } from '../../ui';
import { type Booking } from '../../mocks/bookings';
import { formatCurrency } from '../../lib/format';
import { useBookings } from '../../features/bookings-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

const STATUS_TONE = {
  confirmed: 'success' as const,
  pending: 'warning' as const,
  cancelled: 'live' as const,
  completed: 'neutral' as const,
};

const STATUS_LABEL = {
  confirmed: 'Confirmed',
  pending: 'Awaiting payment',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${booking.facilityName}, ${booking.prettyDate}`}>
      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <Image
            source={{ uri: booking.cover }}
            style={styles.thumb}
            contentFit="cover"
            accessibilityLabel="Facility cover"
          />
          <View style={styles.cardBody}>
            <View style={styles.cardHead}>
              <Tag tone={STATUS_TONE[booking.status]} size="sm" leadingDot label={STATUS_LABEL[booking.status]} />
              <Text variant="caption" color={colors.text.secondary}>
                {booking.prettyDate}
              </Text>
            </View>
            <Text variant="h3" color={colors.text.primary}>
              {booking.facilityName}
            </Text>
            <View style={styles.metaRow}>
              <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
              <Text variant="bodySm" color={colors.text.secondary}>
                {booking.spaceName}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text variant="bodySm" color={colors.text.secondary}>
                {booking.prettyTime}
              </Text>
              <Text variant="button" color={colors.brand.primary}>
                {booking.totalCents === 0 ? 'Free' : formatCurrency(booking.totalCents)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export function BookingsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('upcoming');

  // Seeded + session reservations (FacilityDetail bookings land here).
  const bookings = useBookings();
  const visible = bookings.filter((b) =>
    tab === 'upcoming'
      ? b.status === 'confirmed' || b.status === 'pending'
      : b.status === 'completed' || b.status === 'cancelled',
  );

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          My Bookings
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabsWrap}>
        <Tabs variant="segmented" items={TABS} value={tab} onChange={setTab} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <EmptyState
            icon={
              <CalendarPlus
                size={28}
                color={colors.brand.primary}
                strokeWidth={2.25}
              />
            }
            title={tab === 'upcoming' ? 'Nothing booked' : 'No past bookings'}
            description={
              tab === 'upcoming'
                ? 'Reserve a court, field, or rink to see it here.'
                : 'Your completed and cancelled bookings show up here.'
            }
            primaryAction={
              tab === 'upcoming'
                ? {
                    label: 'Browse facilities',
                    onPress: () => navigation.navigate('Facilities'),
                  }
                : undefined
            }
          />
        ) : (
          visible.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPress={() => navigation.navigate('BookingDetails', { id: b.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: radii.md,
    backgroundColor: colors.surface.chip,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
