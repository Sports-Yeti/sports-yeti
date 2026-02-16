import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { api } from '../services/api';
import type { Facility, Space, Booking } from '../types';

interface CreateBookingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: () => void;
  initialDate: Date | null;
  facilities: Facility[];
}

interface FormData {
  facility_id: string;
  space_id: string;
  start_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  notes: string;
}

interface ConflictInfo {
  hasConflict: boolean;
  conflictingBookings: Booking[];
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatTimeForInput(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

export function CreateBookingModal({
  isVisible,
  onClose,
  onCreate,
  initialDate,
  facilities,
}: CreateBookingModalProps) {
  const [formData, setFormData] = useState<FormData>({
    facility_id: '',
    space_id: '',
    start_date: initialDate ? formatDateForInput(initialDate) : formatDateForInput(new Date()),
    start_time: initialDate ? formatTimeForInput(initialDate) : '09:00',
    end_time: initialDate ? formatTimeForInput(new Date(initialDate.getTime() + 60 * 60 * 1000)) : '10:00',
    purpose: '',
    notes: '',
  });

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load spaces when facility changes
  useEffect(() => {
    if (formData.facility_id) {
      loadSpaces(formData.facility_id);
    } else {
      setSpaces([]);
      setFormData((prev) => ({ ...prev, space_id: '' }));
    }
  }, [formData.facility_id]);

  // Check for conflicts when time/space changes
  useEffect(() => {
    if (formData.space_id && formData.start_date && formData.start_time && formData.end_time) {
      checkConflicts();
    } else {
      setConflictInfo(null);
    }
  }, [formData.space_id, formData.start_date, formData.start_time, formData.end_time]);

  async function loadSpaces(facilityId: string) {
    setIsLoadingSpaces(true);
    try {
      const facility = await api.getFacility(facilityId);
      setSpaces(facility.spaces || []);
    } catch (err) {
      console.error('Failed to load spaces:', err);
      setSpaces([]);
    } finally {
      setIsLoadingSpaces(false);
    }
  }

  async function checkConflicts() {
    if (!formData.space_id || !formData.start_date || !formData.start_time || !formData.end_time) {
      return;
    }

    setIsCheckingConflict(true);
    try {
      const startDateTime = parseDateTime(formData.start_date, formData.start_time);
      const endDateTime = parseDateTime(formData.start_date, formData.end_time);

      // Check if the space has any bookings that conflict
      const response = await api.checkBookingConflicts(
        formData.space_id,
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );

      setConflictInfo({
        hasConflict: response.has_conflict,
        conflictingBookings: response.conflicting_bookings || [],
      });
    } catch (err) {
      // If API doesn't exist yet, do local check
      try {
        const response = await api.getBookings({
          space_id: formData.space_id,
          start_date: formData.start_date,
          end_date: formData.start_date,
        });

        const startDateTime = parseDateTime(formData.start_date, formData.start_time);
        const endDateTime = parseDateTime(formData.start_date, formData.end_time);

        const conflicts = response.data.filter((booking) => {
          const bookingStart = new Date(booking.start_time);
          const bookingEnd = new Date(booking.end_time);

          // Check for overlap
          return (
            booking.status !== 'cancelled' &&
            ((startDateTime >= bookingStart && startDateTime < bookingEnd) ||
              (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
              (startDateTime <= bookingStart && endDateTime >= bookingEnd))
          );
        });

        setConflictInfo({
          hasConflict: conflicts.length > 0,
          conflictingBookings: conflicts,
        });
      } catch (fallbackErr) {
        console.error('Failed to check conflicts:', fallbackErr);
        setConflictInfo(null);
      }
    } finally {
      setIsCheckingConflict(false);
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.facility_id) {
      errors.facility_id = 'Please select a facility';
    }
    if (!formData.space_id) {
      errors.space_id = 'Please select a space';
    }
    if (!formData.start_date) {
      errors.start_date = 'Please select a date';
    }
    if (!formData.start_time) {
      errors.start_time = 'Please enter start time';
    }
    if (!formData.end_time) {
      errors.end_time = 'Please enter end time';
    }

    // Validate time order
    if (formData.start_time && formData.end_time) {
      const start = parseDateTime(formData.start_date, formData.start_time);
      const end = parseDateTime(formData.start_date, formData.end_time);
      if (end <= start) {
        errors.end_time = 'End time must be after start time';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    if (conflictInfo?.hasConflict) {
      setError('Cannot create booking due to time conflict');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const startDateTime = parseDateTime(formData.start_date, formData.start_time);
      const endDateTime = parseDateTime(formData.start_date, formData.end_time);

      await api.createBooking({
        space_id: formData.space_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        purpose: formData.purpose || undefined,
        notes: formData.notes || undefined,
      });

      onCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateFormData(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const selectedSpace = spaces.find((s) => s.id === formData.space_id);

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
            <Text style={styles.title}>Create New Booking</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Facility Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Facility *</Text>
              <View style={styles.selectContainer}>
                {facilities.map((facility) => (
                  <TouchableOpacity
                    key={facility.id}
                    style={[
                      styles.selectOption,
                      formData.facility_id === facility.id && styles.selectOptionActive,
                    ]}
                    onPress={() => updateFormData('facility_id', facility.id)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.facility_id === facility.id && styles.selectOptionTextActive,
                      ]}
                    >
                      {facility.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {validationErrors.facility_id && (
                <Text style={styles.errorText}>{validationErrors.facility_id}</Text>
              )}
            </View>

            {/* Space Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Space *</Text>
              {isLoadingSpaces ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : spaces.length > 0 ? (
                <View style={styles.selectContainer}>
                  {spaces.map((space) => (
                    <TouchableOpacity
                      key={space.id}
                      style={[
                        styles.selectOption,
                        formData.space_id === space.id && styles.selectOptionActive,
                        !space.is_active && styles.selectOptionDisabled,
                      ]}
                      onPress={() => space.is_active && updateFormData('space_id', space.id)}
                      disabled={!space.is_active}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          formData.space_id === space.id && styles.selectOptionTextActive,
                          !space.is_active && styles.selectOptionTextDisabled,
                        ]}
                      >
                        {space.name} - ${space.hourly_rate}/hr
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : formData.facility_id ? (
                <Text style={styles.noDataText}>No spaces available</Text>
              ) : (
                <Text style={styles.noDataText}>Select a facility first</Text>
              )}
              {validationErrors.space_id && (
                <Text style={styles.errorText}>{validationErrors.space_id}</Text>
              )}
            </View>

            {/* Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                value={formData.start_date}
                onChangeText={(value) => updateFormData('start_date', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textMuted}
              />
              {validationErrors.start_date && (
                <Text style={styles.errorText}>{validationErrors.start_date}</Text>
              )}
            </View>

            {/* Time Selection */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start Time *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.start_time}
                  onChangeText={(value) => updateFormData('start_time', value)}
                  placeholder="HH:MM"
                  placeholderTextColor={COLORS.textMuted}
                />
                {validationErrors.start_time && (
                  <Text style={styles.errorText}>{validationErrors.start_time}</Text>
                )}
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>End Time *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.end_time}
                  onChangeText={(value) => updateFormData('end_time', value)}
                  placeholder="HH:MM"
                  placeholderTextColor={COLORS.textMuted}
                />
                {validationErrors.end_time && (
                  <Text style={styles.errorText}>{validationErrors.end_time}</Text>
                )}
              </View>
            </View>

            {/* Conflict Warning */}
            {isCheckingConflict && (
              <View style={styles.conflictCheck}>
                <ActivityIndicator size="small" color={COLORS.warning} />
                <Text style={styles.conflictCheckText}>Checking availability...</Text>
              </View>
            )}

            {conflictInfo?.hasConflict && (
              <View style={styles.conflictWarning}>
                <Text style={styles.conflictTitle}>Time Conflict Detected</Text>
                <Text style={styles.conflictDescription}>
                  This time slot overlaps with {conflictInfo.conflictingBookings.length} existing booking(s):
                </Text>
                {conflictInfo.conflictingBookings.slice(0, 3).map((booking) => (
                  <View key={booking.id} style={styles.conflictBooking}>
                    <Text style={styles.conflictBookingText}>
                      {new Date(booking.start_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(booking.end_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {booking.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Purpose */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Purpose</Text>
              <TextInput
                style={styles.input}
                value={formData.purpose}
                onChangeText={(value) => updateFormData('purpose', value)}
                placeholder="e.g., Team practice, Tournament game"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(value) => updateFormData('notes', value)}
                placeholder="Any additional notes..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Estimated Cost */}
            {selectedSpace && formData.start_time && formData.end_time && (
              <View style={styles.estimateSection}>
                <Text style={styles.estimateLabel}>Estimated Cost</Text>
                <Text style={styles.estimateValue}>
                  ${(
                    selectedSpace.hourly_rate *
                    ((parseDateTime(formData.start_date, formData.end_time).getTime() -
                      parseDateTime(formData.start_date, formData.start_time).getTime()) /
                      (1000 * 60 * 60))
                  ).toFixed(2)}
                </Text>
                <Text style={styles.estimateNote}>
                  {selectedSpace.hourly_rate}/hr × {' '}
                  {(
                    (parseDateTime(formData.start_date, formData.end_time).getTime() -
                      parseDateTime(formData.start_date, formData.start_time).getTime()) /
                    (1000 * 60 * 60)
                  ).toFixed(1)}{' '}
                  hours
                </Text>
              </View>
            )}

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.submitButton,
                (conflictInfo?.hasConflict || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={conflictInfo?.hasConflict || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.textLight} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create Booking</Text>
              )}
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
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
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
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectOption: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  selectOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectOptionDisabled: {
    opacity: 0.5,
  },
  selectOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  selectOptionTextActive: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  selectOptionTextDisabled: {
    color: COLORS.textMuted,
  },
  noDataText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  conflictCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '10',
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  conflictCheckText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
  },
  conflictWarning: {
    backgroundColor: COLORS.error + '10',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  conflictTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  conflictDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  conflictBooking: {
    backgroundColor: COLORS.error + '10',
    padding: SPACING.sm,
    borderRadius: 4,
    marginTop: SPACING.xs,
  },
  conflictBookingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  estimateSection: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  estimateLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  estimateValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  estimateNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorMessage: {
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
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
