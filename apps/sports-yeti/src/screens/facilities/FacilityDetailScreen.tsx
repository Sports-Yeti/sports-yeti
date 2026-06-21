import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  CalendarPlus,
  Check,
  ChevronLeft,
  Clock,
  MapPin,
  Star,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Modal,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  FACILITIES,
  FACILITY_SPORT_LABEL,
} from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';
import { useCheckout } from '../../lib/checkout';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'FacilityDetails'>;
type Route = RouteProp<RootStackParamList, 'FacilityDetails'>;

const TIME_SLOTS = [
  '7:00 AM',
  '9:00 AM',
  '11:00 AM',
  '1:00 PM',
  '3:00 PM',
  '5:00 PM',
  '7:00 PM',
  '9:00 PM',
];

export function FacilityDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const facility = FACILITIES.find((f) => f.id === route.params.id);
  const checkout = useCheckout();
  const [bookSheetOpen, setBookSheetOpen] = useState(false);
  const [pickedSpace, setPickedSpace] = useState<string | null>(null);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [confirmBook, setConfirmBook] = useState(false);

  if (!facility) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Facility not found"
          primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const handleConfirm = async () => {
    setConfirmBook(false);
    const result = await checkout.pay({
      amountCents: facility.hourlyRateCents,
      merchantLabel: `${facility.name} booking`,
      // TODO: pass createPaymentIntent once backend exposes it.
    });
    if (result.status === 'success') {
      setBookSheetOpen(false);
      toast.show({
        variant: 'success',
        title: 'Booking confirmed',
        description: `${facility.name} · ${pickedSlot}`,
        action: {
          label: 'View',
          onPress: () => navigation.navigate('Bookings'),
        },
      });
      setPickedSpace(null);
      setPickedSlot(null);
      return;
    }
    if (result.status === 'cancelled') {
      toast.show({ variant: 'info', title: 'Booking not charged' });
      return;
    }
    toast.show({
      variant: 'error',
      title: 'Booking failed',
      description: result.error,
      action: { label: 'Retry', onPress: handleConfirm },
    });
  };

  const canBook = !!pickedSpace && !!pickedSlot;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
        </View>

        <Image source={{ uri: facility.cover }} style={styles.cover} contentFit="cover" />

        <View style={styles.heroBlock}>
          <Text variant="h1" color={colors.text.primary}>
            {facility.name}
          </Text>
          <View style={styles.metaRow}>
            <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="body" color={colors.text.secondary}>
              {facility.city} · {facility.distanceMiles} mi
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Star size={14} color="#B26200" strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.secondary}>
              {facility.rating.toFixed(1)} ({facility.reviewCount} reviews)
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Clock size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.secondary}>
              {facility.hours}
            </Text>
          </View>
          <View style={styles.tagsRow}>
            {facility.sports.map((s) => (
              <Tag key={s} tone="brand" size="sm" label={FACILITY_SPORT_LABEL[s]} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            About
          </Text>
          <Text variant="body" color={colors.text.primary}>
            {facility.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Amenities
          </Text>
          <View style={styles.amenityGrid}>
            {facility.amenities.map((a) => (
              <View key={a} style={styles.amenityRow}>
                <Check size={14} color={colors.brand.primary} strokeWidth={2.5} />
                <Text variant="bodySm" color={colors.text.primary}>
                  {a}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Spaces ({facility.spaces.length})
          </Text>
          <View style={styles.spacesList}>
            {facility.spaces.map((s) => (
              <Card key={s.id} style={styles.spaceCard}>
                <View style={styles.spaceBody}>
                  <Text variant="button" color={colors.text.primary}>
                    {s.name}
                  </Text>
                  <Text variant="caption" color={colors.text.secondary}>
                    {s.surface} · up to {s.capacity} players
                  </Text>
                </View>
                <Text variant="bodySm" color={colors.brand.primary}>
                  {facility.hourlyRateCents === 0
                    ? 'Free'
                    : `${formatCurrency(facility.hourlyRateCents)}/hr`}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Book this venue"
          variant="gradient"
          size="lg"
          fullWidth
          leadingIcon={
            <CalendarPlus
              size={18}
              color={colors.text.inverse}
              strokeWidth={2.5}
            />
          }
          onPress={() => setBookSheetOpen(true)}
        />
      </View>

      <BottomSheet
        visible={bookSheetOpen}
        onRequestClose={() => setBookSheetOpen(false)}
        title={`Book ${facility.name}`}
        snapPoints={['70%']}
      >
        <ScrollView contentContainerStyle={styles.sheetContent}>
          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Choose a space
            </Text>
            <View style={styles.spacesList}>
              {facility.spaces.map((s) => {
                const selected = pickedSpace === s.id;
                return (
                  <Pressable
                    key={s.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setPickedSpace(s.id)}
                    style={({ pressed }) => [
                      styles.pickRow,
                      selected ? styles.pickRowSelected : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <View style={styles.pickBody}>
                      <Text variant="button" color={colors.text.primary}>
                        {s.name}
                      </Text>
                      <Text variant="caption" color={colors.text.secondary}>
                        {s.surface}
                      </Text>
                    </View>
                    {selected ? (
                      <Check
                        size={18}
                        color={colors.brand.primary}
                        strokeWidth={2.5}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Tonight's open slots
            </Text>
            <View style={styles.slotGrid}>
              {TIME_SLOTS.map((slot) => {
                const selected = pickedSlot === slot;
                return (
                  <Pressable
                    key={slot}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setPickedSlot(slot)}
                    style={({ pressed }) => [
                      styles.slot,
                      selected ? styles.slotSelected : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text
                      variant="button"
                      color={selected ? colors.text.inverse : colors.text.primary}
                    >
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button
            label={
              checkout.isPaying
                ? 'Processing…'
                : canBook
                ? `Confirm · ${formatCurrency(facility.hourlyRateCents)}`
                : 'Pick space and time'
            }
            variant="gradient"
            size="lg"
            fullWidth
            disabled={!canBook || checkout.isPaying}
            onPress={() => setConfirmBook(true)}
          />
        </ScrollView>
      </BottomSheet>

      <Modal
        visible={confirmBook}
        onRequestClose={() => setConfirmBook(false)}
        variant="info"
        title="Confirm booking"
        description={`${facility.name} · ${pickedSlot} · ${formatCurrency(
          facility.hourlyRateCents,
        )} via Apple Pay or your saved card.`}
        primaryAction={{
          label: checkout.isPaying ? 'Processing…' : 'Pay & confirm',
          onPress: handleConfirm,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmBook(false),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.chip,
  },
  heroBlock: {
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 140,
  },
  spacesList: {
    gap: spacing.sm,
  },
  spaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  spaceBody: {
    flex: 1,
    gap: 2,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  sheetContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetGroup: {
    gap: spacing.md,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.bg,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  pickRowSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  pickBody: {
    flex: 1,
    gap: 2,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border.soft,
    backgroundColor: colors.surface.card,
    minHeight: 44,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
