import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Facility, Space, Booking } from '../../types';

interface RouteParams {
  id: string;
}

interface SpaceFormState {
  name: string;
  sport_type: string;
  capacity: string;
  hourly_rate: string;
  surface_type: string;
  is_indoor: boolean;
  is_active: boolean;
}

const EMPTY_SPACE_FORM: SpaceFormState = {
  name: '',
  sport_type: 'Basketball',
  capacity: '0',
  hourly_rate: '0',
  surface_type: '',
  is_indoor: true,
  is_active: true,
};

interface SpaceFormModalProps {
  visible: boolean;
  facilityId: string;
  editingSpace: Space | null;
  onClose: () => void;
  onSaved: () => void;
}

function SpaceFormModal({
  visible,
  facilityId,
  editingSpace,
  onClose,
  onSaved,
}: SpaceFormModalProps) {
  const [form, setForm] = useState<SpaceFormState>(EMPTY_SPACE_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (editingSpace) {
      setForm({
        name: editingSpace.name,
        sport_type: editingSpace.sport_type ?? 'Basketball',
        capacity: String(Number(editingSpace.capacity ?? 0)),
        hourly_rate: String(Number(editingSpace.hourly_rate ?? 0)),
        surface_type: editingSpace.surface_type ?? '',
        is_indoor: editingSpace.is_indoor,
        is_active: editingSpace.is_active,
      });
    } else {
      setForm(EMPTY_SPACE_FORM);
    }
    setErrorMsg(null);
  }, [visible, editingSpace]);

  const updateForm = <K extends keyof SpaceFormState>(key: K, value: SpaceFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrorMsg('Name is required');
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        sport_type: form.sport_type.trim(),
        capacity: parseInt(form.capacity, 10) || 0,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        surface_type: form.surface_type.trim() || null,
        is_indoor: form.is_indoor,
        is_active: form.is_active,
      };
      if (editingSpace) {
        await api.updateSpace(facilityId, editingSpace.id, payload);
      } else {
        await api.createSpace(facilityId, payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      setErrorMsg((e as Error).message ?? 'Failed to save space');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingSpace ? 'Edit Space' : 'Add Space'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalLabel}>Name *</Text>
            <TextInput
              style={styles.modalInput}
              value={form.name}
              onChangeText={(v) => updateForm('name', v)}
              placeholder="e.g. Court A"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.modalLabel}>Sport Type</Text>
            <TextInput
              style={styles.modalInput}
              value={form.sport_type}
              onChangeText={(v) => updateForm('sport_type', v)}
              placeholder="e.g. Basketball"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.modalLabel}>Capacity</Text>
            <TextInput
              style={styles.modalInput}
              value={form.capacity}
              onChangeText={(v) => updateForm('capacity', v)}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
            />

            <Text style={styles.modalLabel}>Hourly Rate ($)</Text>
            <TextInput
              style={styles.modalInput}
              value={form.hourly_rate}
              onChangeText={(v) => updateForm('hourly_rate', v)}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
            />

            <Text style={styles.modalLabel}>Surface Type</Text>
            <TextInput
              style={styles.modalInput}
              value={form.surface_type}
              onChangeText={(v) => updateForm('surface_type', v)}
              placeholder="e.g. Hardwood, Turf"
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.toggleRow}>
              <Text style={styles.modalLabel}>Indoor</Text>
              <Switch
                value={form.is_indoor}
                onValueChange={(v) => updateForm('is_indoor', v)}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                thumbColor={form.is_indoor ? COLORS.primary : COLORS.textMuted}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.modalLabel}>Active</Text>
              <Switch
                value={form.is_active}
                onValueChange={(v) => updateForm('is_active', v)}
                trackColor={{ false: COLORS.border, true: COLORS.success + '80' }}
                thumbColor={form.is_active ? COLORS.success : COLORS.textMuted}
              />
            </View>

            {errorMsg && <Text style={styles.modalError}>{errorMsg}</Text>}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSave, isSaving && styles.modalSaveDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.textLight} />
              ) : (
                <Text style={styles.modalSaveText}>
                  {editingSpace ? 'Save Changes' : 'Create Space'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function FacilityDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as RouteParams;

  const [facility, setFacility] = useState<Facility | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'spaces' | 'bookings' | 'info'>('spaces');
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);

  const loadFacility = useCallback(async () => {
    setIsLoading(true);
    try {
      const facilityData = await api.getFacility(id);
      setFacility(facilityData);

      const today = new Date().toISOString().split('T')[0];
      const bookingsResponse = await api.getBookings({
        facility_id: id,
        start_date: today,
        per_page: 10,
      });
      setUpcomingBookings(bookingsResponse.data);
    } catch (error) {
      console.error('Failed to load facility:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadFacility();
  }, [loadFacility]);

  function formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const handleAddSpace = () => {
    setEditingSpace(null);
    setShowSpaceModal(true);
  };

  const handleEditSpace = (space: Space) => {
    setEditingSpace(space);
    setShowSpaceModal(true);
  };

  const handleDeleteSpace = async (space: Space) => {
    if (!confirm(`Delete space "${space.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteSpace(id, space.id);
      await loadFacility();
    } catch (e) {
      alert((e as Error).message ?? 'Failed to delete space');
    }
  };

  function renderSpaceCard(space: Space) {
    return (
      <View key={space.id} style={styles.spaceCard}>
        <View style={styles.spaceHeader}>
          <View style={styles.spaceInfo}>
            <Text style={styles.spaceName}>{space.name}</Text>
            <Text style={styles.spaceSport}>{space.sport_type}</Text>
          </View>
          <View style={styles.spaceStatus}>
            <View
              style={[
                styles.statusDot,
                space.is_active ? styles.statusDotActive : styles.statusDotInactive,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                space.is_active ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {space.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.spaceDetails}>
          <View style={styles.spaceDetailItem}>
            <Text style={styles.spaceDetailLabel}>Hourly Rate</Text>
            <Text style={styles.spaceDetailValue}>
              ${Number(space.hourly_rate ?? 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.spaceDetailItem}>
            <Text style={styles.spaceDetailLabel}>Capacity</Text>
            <Text style={styles.spaceDetailValue}>
              {Number(space.capacity ?? 0)} people
            </Text>
          </View>
          <View style={styles.spaceDetailItem}>
            <Text style={styles.spaceDetailLabel}>Type</Text>
            <Text style={styles.spaceDetailValue}>
              {space.is_indoor ? 'Indoor' : 'Outdoor'}
            </Text>
          </View>
          {space.surface_type && (
            <View style={styles.spaceDetailItem}>
              <Text style={styles.spaceDetailLabel}>Surface</Text>
              <Text style={styles.spaceDetailValue}>{space.surface_type}</Text>
            </View>
          )}
        </View>

        {space.features && space.features.length > 0 && (
          <View style={styles.featuresRow}>
            {space.features.map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.spaceActions}>
          <TouchableOpacity
            style={styles.spaceActionButton}
            onPress={() => handleEditSpace(space)}
          >
            <Text style={styles.spaceActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.spaceActionButton, styles.spaceActionButtonDanger]}
            onPress={() => handleDeleteSpace(space)}
          >
            <Text style={styles.spaceActionTextDanger}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderBookingCard(booking: Booking) {
    const statusColors: Record<string, string> = {
      confirmed: COLORS.success,
      pending: COLORS.warning,
      cancelled: COLORS.error,
      completed: COLORS.textSecondary,
    };

    return (
      <TouchableOpacity key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingTime}>
          <Text style={styles.bookingTimeText}>
            {formatDateTime(booking.start_time)}
          </Text>
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingSpace}>{booking.space?.name}</Text>
          <Text style={styles.bookingUser}>{booking.user?.name || 'Unknown'}</Text>
        </View>
        <View
          style={[
            styles.bookingStatus,
            { backgroundColor: (statusColors[booking.status] || COLORS.textSecondary) + '20' },
          ]}
        >
          <Text
            style={[
              styles.bookingStatusText,
              { color: statusColors[booking.status] || COLORS.textSecondary },
            ]}
          >
            {booking.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (isLoading || !facility) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction}>
            <Text style={styles.headerActionText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.heroSection}>
          {facility.image_url ? (
            <Image source={{ uri: facility.image_url }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderText}>🏟️</Text>
            </View>
          )}

          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <View
                style={[
                  styles.statusBadge,
                  facility.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    facility.is_active
                      ? styles.statusBadgeTextActive
                      : styles.statusBadgeTextInactive,
                  ]}
                >
                  {facility.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Text style={styles.heroTitle}>{facility.name}</Text>
              <Text style={styles.heroAddress}>
                {facility.address}, {facility.city}, {facility.state}{' '}
                {facility.zip_code}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{facility.spaces?.length || 0}</Text>
            <Text style={styles.statLabel}>Spaces</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{upcomingBookings.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          {facility.phone && (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>📞</Text>
              <Text style={styles.statLabel}>{facility.phone}</Text>
            </View>
          )}
        </View>

        <View style={styles.tabs}>
          {(['spaces', 'bookings', 'info'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'spaces' && (
            <View style={styles.spacesSection}>
              <View style={styles.spacesHeader}>
                <Text style={styles.sectionTitle}>Spaces</Text>
                <TouchableOpacity style={styles.addSpaceButton} onPress={handleAddSpace}>
                  <Text style={styles.addSpaceButtonText}>+ Add Space</Text>
                </TouchableOpacity>
              </View>
              {facility.spaces && facility.spaces.length > 0 ? (
                facility.spaces.map(renderSpaceCard)
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No spaces configured</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'bookings' && (
            <View style={styles.bookingsSection}>
              <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(renderBookingCard)
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No upcoming bookings</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'info' && (
            <View style={styles.infoSection}>
              {facility.description && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoValue}>{facility.description}</Text>
                </View>
              )}

              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>
                  {facility.phone || 'No phone'}
                  {'\n'}
                  {facility.email || 'No email'}
                </Text>
              </View>

              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {facility.address}
                  {'\n'}
                  {facility.city}, {facility.state} {facility.zip_code}
                  {'\n'}
                  {facility.country}
                </Text>
              </View>

              {facility.operating_hours && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Operating Hours</Text>
                  {Object.entries(facility.operating_hours).map(([day, hours]) => (
                    <View key={day} style={styles.hoursRow}>
                      <Text style={styles.hoursDay}>{day}</Text>
                      <Text style={styles.hoursTime}>
                        {formatTime(hours.open)} - {formatTime(hours.close)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {facility.amenities && facility.amenities.length > 0 && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Amenities</Text>
                  <View style={styles.amenitiesGrid}>
                    {facility.amenities.map((amenity, index) => (
                      <View key={index} style={styles.amenityItem}>
                        <Text style={styles.amenityCheck}>✓</Text>
                        <Text style={styles.amenityName}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <SpaceFormModal
        visible={showSpaceModal}
        facilityId={id}
        editingSpace={editingSpace}
        onClose={() => setShowSpaceModal(false)}
        onSaved={loadFacility}
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  headerAction: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
  },
  headerActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    position: 'relative',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.sidebarHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 64,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: SPACING.lg,
  },
  heroContent: {},
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  statusBadgeActive: {
    backgroundColor: COLORS.success,
  },
  statusBadgeInactive: {
    backgroundColor: COLORS.error,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  statusBadgeTextActive: {
    color: COLORS.textLight,
  },
  statusBadgeTextInactive: {
    color: COLORS.textLight,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  heroAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: SPACING.md,
  },
  spacesSection: {
    gap: SPACING.md,
  },
  spacesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addSpaceButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  addSpaceButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  spaceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  spaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  spaceInfo: {},
  spaceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  spaceSport: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  spaceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotActive: {
    backgroundColor: COLORS.success,
  },
  statusDotInactive: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  statusTextActive: {
    color: COLORS.success,
  },
  statusTextInactive: {
    color: COLORS.error,
  },
  spaceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  spaceDetailItem: {},
  spaceDetailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  spaceDetailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  featureTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featureText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  spaceActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  spaceActionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  spaceActionButtonDanger: {
    backgroundColor: COLORS.error + '15',
  },
  spaceActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  spaceActionTextDanger: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '600',
  },
  bookingsSection: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  bookingTime: {},
  bookingTimeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingSpace: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  bookingUser: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  bookingStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookingStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoSection: {
    gap: SPACING.lg,
  },
  infoBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  hoursDay: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  hoursTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    width: '45%',
  },
  amenityCheck: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
  },
  amenityName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  emptySection: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalClose: { fontSize: FONT_SIZES.lg, color: COLORS.textMuted },
  modalScroll: { padding: SPACING.lg },
  modalLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  modalError: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalCancel: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.text, fontSize: FONT_SIZES.md, fontWeight: '500' },
  modalSave: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  modalSaveDisabled: { opacity: 0.5 },
  modalSaveText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
