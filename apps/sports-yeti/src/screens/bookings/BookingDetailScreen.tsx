import React, { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  CalendarClock,
  ChevronLeft,
  Clock,
  MapPin,
  Receipt,
  Share2,
  Users,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  EmptyState,
  Modal,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { BOOKINGS } from '../../mocks/bookings';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'BookingDetails'>;
type Route = RouteProp<RootStackParamList, 'BookingDetails'>;

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

export function BookingDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const booking = BOOKINGS.find((b) => b.id === route.params.id);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!booking) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Booking not found"
          description="This reservation may have been cancelled or expired."
          primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const balanceDueCents = booking.totalCents - booking.paidCents;

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share booking"
            hitSlop={8}
            onPress={async () => {
              Haptics.selectionAsync();
              await Share.share({
                title: booking.facilityName,
                message: `${booking.facilityName} · ${booking.prettyDate} · ${booking.prettyTime}`,
              });
            }}
            style={styles.iconBtn}
          >
            <Share2 size={20} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
        </View>

        <Image source={{ uri: booking.cover }} style={styles.cover} contentFit="cover" />

        <View style={styles.heroBlock}>
          <Tag tone={STATUS_TONE[booking.status]} leadingDot label={STATUS_LABEL[booking.status]} />
          <Text variant="h1" color={colors.text.primary}>
            {booking.facilityName}
          </Text>
          <Text variant="body" color={colors.text.secondary}>
            {booking.spaceName} · {booking.city}
          </Text>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <CalendarClock size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {booking.prettyDate}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {booking.prettyTime}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Clock size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {booking.sport}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                Hosted by {booking.hostName} · {booking.hostHandle}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Users size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {booking.partySize} players
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                Capacity per space.
              </Text>
            </View>
          </View>
        </Card>

        {booking.notes ? (
          <Card style={styles.notesCard}>
            <Text variant="eyebrow" color={colors.brand.primary}>
              Notes
            </Text>
            <Text variant="body" color={colors.text.primary}>
              {booking.notes}
            </Text>
          </Card>
        ) : null}

        <Card style={styles.receiptCard}>
          <View style={styles.receiptHead}>
            <Receipt size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <Text variant="h3" color={colors.text.primary}>
              Receipt
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text variant="body" color={colors.text.secondary}>
              Total
            </Text>
            <Text variant="button" color={colors.text.primary}>
              {formatCurrency(booking.totalCents)}
            </Text>
          </View>
          <View style={styles.receiptRow}>
            <Text variant="body" color={colors.text.secondary}>
              Paid
            </Text>
            <Text variant="button" color={colors.text.primary}>
              {formatCurrency(booking.paidCents)}
            </Text>
          </View>
          <View style={styles.receiptDivider} />
          <View style={styles.receiptRow}>
            <Text variant="body" color={colors.text.primary}>
              {balanceDueCents > 0 ? 'Balance due' : 'Balance'}
            </Text>
            <Text
              variant="h3"
              color={balanceDueCents > 0 ? colors.status.live : colors.brand.primary}
            >
              {formatCurrency(Math.max(0, balanceDueCents))}
            </Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Text variant="eyebrow" color={colors.text.secondary}>
            VENUE
          </Text>
          <Pressable
            onPress={() =>
              navigation.navigate('FacilityDetails', { id: booking.facilityId })
            }
            style={styles.venueLink}
            accessibilityRole="button"
            accessibilityLabel={`Open ${booking.facilityName} details`}
          >
            <MapPin size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <Text variant="button" color={colors.brand.primary}>
              View facility
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {booking.status === 'pending' ? (
          <Button
            label={`Pay balance · ${formatCurrency(balanceDueCents)}`}
            variant="gradient"
            size="lg"
            fullWidth
            onPress={() =>
              toast.show({
                variant: 'success',
                title: 'Payment confirmed',
                description: `${formatCurrency(balanceDueCents)} captured via Apple Pay.`,
              })
            }
          />
        ) : booking.status === 'confirmed' ? (
          <View style={styles.actionRow}>
            <Button
              label="Cancel"
              variant="ghost"
              size="md"
              onPress={() => setConfirmCancel(true)}
            />
            <Button
              label="Open team chat"
              variant="gradient"
              size="md"
              onPress={() =>
                navigation.navigate('Chat', {
                  chatId: 'chat-friday-night',
                  title: 'Booking chat',
                })
              }
            />
          </View>
        ) : null}
      </View>

      <Modal
        visible={confirmCancel}
        onRequestClose={() => setConfirmCancel(false)}
        variant="destructive"
        title="Cancel this booking?"
        description="A full refund is possible up to 24 hours before the start time."
        primaryAction={{
          label: 'Cancel booking',
          onPress: () => {
            setConfirmCancel(false);
            toast.show({
              variant: 'info',
              title: 'Booking cancelled',
              description: `${formatCurrency(booking.paidCents)} refund pending.`,
            });
            navigation.goBack();
          },
        }}
        secondaryAction={{
          label: 'Keep booking',
          onPress: () => setConfirmCancel(false),
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
    justifyContent: 'space-between',
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
    gap: spacing.sm,
  },
  detailsCard: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailBody: {
    flex: 1,
    gap: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  notesCard: {
    gap: spacing.sm,
  },
  receiptCard: {
    gap: spacing.md,
  },
  receiptHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  section: {
    gap: spacing.sm,
  },
  venueLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.brand.soft,
    borderRadius: radii.lg,
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
