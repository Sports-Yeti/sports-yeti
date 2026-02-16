import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { api } from '../services/api';
import type { Booking } from '../types';

interface BookingDetailModalProps {
  booking: Booking;
  isVisible: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: COLORS.success,
  pending: COLORS.warning,
  cancelled: COLORS.error,
  completed: COLORS.textSecondary,
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || COLORS.textSecondary;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function BookingDetailModal({
  booking,
  isVisible,
  onClose,
  onUpdate,
}: BookingDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(newStatus: 'confirmed' | 'cancelled') {
    setIsUpdating(true);
    setError(null);

    try {
      if (newStatus === 'cancelled') {
        await api.cancelBooking(booking.id);
      } else {
        await api.updateBooking(booking.id, { status: newStatus });
      }
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Booking Details</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(booking.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(booking.status) },
                  ]}
                >
                  {booking.status}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Booking Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Information</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Booking ID</Text>
                <Text style={styles.infoValue}>{booking.id}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Start Time</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(booking.start_time)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>End Time</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(booking.end_time)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Amount</Text>
                <Text style={[styles.infoValue, styles.amountText]}>
                  {formatCurrency(booking.amount)}
                </Text>
              </View>

              {booking.purpose && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Purpose</Text>
                  <Text style={styles.infoValue}>{booking.purpose}</Text>
                </View>
              )}

              {booking.notes && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Notes</Text>
                  <Text style={styles.infoValue}>{booking.notes}</Text>
                </View>
              )}

              {booking.checked_in_at && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Checked In</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(booking.checked_in_at)}
                  </Text>
                </View>
              )}
            </View>

            {/* Space Info */}
            {booking.space && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Space & Facility</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Space</Text>
                  <Text style={styles.infoValue}>{booking.space.name}</Text>
                </View>

                {booking.space.facility && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Facility</Text>
                      <Text style={styles.infoValue}>
                        {booking.space.facility.name}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Address</Text>
                      <Text style={styles.infoValue}>
                        {booking.space.facility.address}
                        {'\n'}
                        {booking.space.facility.city},{' '}
                        {booking.space.facility.state}{' '}
                        {booking.space.facility.zip_code}
                      </Text>
                    </View>
                  </>
                )}

                {booking.space.sport_type && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sport Type</Text>
                    <Text style={styles.infoValue}>{booking.space.sport_type}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Hourly Rate</Text>
                  <Text style={styles.infoValue}>
                    {formatCurrency(booking.space.hourly_rate)}
                  </Text>
                </View>
              </View>
            )}

            {/* User Info */}
            {booking.user && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{booking.user.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{booking.user.email}</Text>
                </View>

                {booking.user.phone && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{booking.user.phone}</Text>
                  </View>
                )}
              </View>
            )}

            {/* QR Code */}
            {booking.qr_code_url && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Check-in QR Code</Text>
                <View style={styles.qrContainer}>
                  <Text style={styles.qrPlaceholder}>
                    QR Code: {booking.qr_code}
                  </Text>
                </View>
              </View>
            )}

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {booking.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => handleStatusChange('confirmed')}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={COLORS.textLight} size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            )}

            {(booking.status === 'pending' || booking.status === 'confirmed') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleStatusChange('cancelled')}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={COLORS.textLight} size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Cancel Booking</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.closeActionButton]}
              onPress={onClose}
            >
              <Text style={styles.closeActionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxWidth: 600,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.textSecondary,
    lineHeight: 28,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  amountText: {
    color: COLORS.success,
    fontWeight: '600',
  },
  qrContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrPlaceholder: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  confirmButton: {
    backgroundColor: COLORS.success,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  closeActionButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeActionButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});
