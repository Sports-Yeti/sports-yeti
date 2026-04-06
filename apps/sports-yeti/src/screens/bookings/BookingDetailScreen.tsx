import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, BOOKING_STATUS } from '../../constants';
import type { Booking } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QR_SIZE = SCREEN_WIDTH * 0.6;

interface BookingDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning,
  confirmed: COLORS.success,
  cancelled: COLORS.error,
  completed: COLORS.textSecondary,
};

export function BookingDetailScreen({ route, navigation }: BookingDetailScreenProps) {
  const { id } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = async () => {
    try {
      setError(null);
      const data = await api.getBooking(id);
      setBooking(data);
    } catch (err) {
      console.error('Failed to load booking:', err);
      setError('Failed to load booking details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadBooking();
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await api.cancelBooking(id);
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
              loadBooking();
            } catch (err) {
              console.error('Failed to cancel booking:', err);
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleViewFacility = () => {
    if (booking?.space?.facility_id) {
      navigation.navigate('FacilityDetails', { id: booking.space.facility_id });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  const isUpcoming = () => {
    if (!booking) return false;
    return (
      new Date(booking.start_time) > new Date() &&
      booking.status !== 'cancelled' &&
      booking.status !== 'completed'
    );
  };

  const canCancel = () => {
    if (!booking) return false;
    return (
      isUpcoming() &&
      (booking.status === 'pending' || booking.status === 'confirmed')
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😞</Text>
        <Text style={styles.errorText}>{error || 'Booking not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBooking}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = BOOKING_STATUS_COLORS[booking.status] || COLORS.textSecondary;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Status Header */}
      <View
        style={[styles.statusHeader, { backgroundColor: statusColor + '15' }]}
      >
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {BOOKING_STATUS[booking.status as keyof typeof BOOKING_STATUS] ||
              booking.status}
          </Text>
        </View>
        {booking.checked_in_at && (
          <Text style={styles.checkedInText}>
            Checked in at {formatTime(booking.checked_in_at)}
          </Text>
        )}
      </View>

      {/* QR Code Section */}
      {booking.qr_code_url && booking.status !== 'cancelled' && (
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Check-in QR Code</Text>
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: booking.qr_code_url }}
              style={styles.qrCode}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.qrHint}>
            Show this code at the facility for check-in
          </Text>
          {booking.qr_code && (
            <View style={styles.bookingCodeContainer}>
              <Text style={styles.bookingCodeLabel}>Booking Code</Text>
              <Text style={styles.bookingCode}>{booking.qr_code}</Text>
            </View>
          )}
        </View>
      )}

      {/* Booking Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(booking.start_time)}</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🕐</Text>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⏱️</Text>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {getDuration(booking.start_time, booking.end_time)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Space & Facility */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity
          style={styles.locationCard}
          onPress={handleViewFacility}
          disabled={!booking.space?.facility_id}
        >
          <View style={styles.locationIcon}>
            <Text style={styles.locationIconText}>🏟️</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.spaceName}>
              {booking.space?.name || 'Unknown Space'}
            </Text>
            <Text style={styles.facilityName}>
              {booking.space?.facility?.name || 'Unknown Facility'}
            </Text>
            {booking.space?.sport_type && (
              <View style={styles.sportTag}>
                <Text style={styles.sportTagText}>
                  {booking.space.sport_type}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Purpose & Notes */}
      {(booking.purpose || booking.notes) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Info</Text>
          <View style={styles.notesCard}>
            {booking.purpose && (
              <View style={styles.noteItem}>
                <Text style={styles.noteLabel}>Purpose</Text>
                <Text style={styles.noteValue}>{booking.purpose}</Text>
              </View>
            )}
            {booking.notes && (
              <View style={styles.noteItem}>
                <Text style={styles.noteLabel}>Notes</Text>
                <Text style={styles.noteValue}>{booking.notes}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Payment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Amount</Text>
            <Text style={styles.paymentAmount}>
              ${Number(booking.amount).toFixed(2)}
            </Text>
          </View>
          {booking.status === 'confirmed' && (
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeIcon}>✓</Text>
              <Text style={styles.paidBadgeText}>Paid</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      {canCancel() && (
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Already Passed Notice */}
      {!isUpcoming() && booking.status !== 'cancelled' && (
        <View style={styles.pastNotice}>
          <Text style={styles.pastNoticeIcon}>📋</Text>
          <Text style={styles.pastNoticeText}>
            {booking.status === 'completed'
              ? 'This booking has been completed.'
              : 'This booking has already passed.'}
          </Text>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  statusHeader: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  checkedInText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  qrSection: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  qrContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  qrCode: {
    width: QR_SIZE,
    height: QR_SIZE,
  },
  qrHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  bookingCodeContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  bookingCodeLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  bookingCode: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  detailIcon: {
    fontSize: 24,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginLeft: 48,
  },
  locationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  locationIconText: {
    fontSize: 24,
  },
  locationInfo: {
    flex: 1,
  },
  spaceName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  facilityName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  sportTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  sportTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteItem: {
    marginBottom: SPACING.sm,
  },
  noteLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  noteValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  paymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  paymentAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success + '15',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  paidBadgeIcon: {
    fontSize: 16,
    color: COLORS.success,
  },
  paidBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  actionsSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelButton: {
    backgroundColor: COLORS.error + '15',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  pastNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  pastNoticeIcon: {
    fontSize: 20,
  },
  pastNoticeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});
