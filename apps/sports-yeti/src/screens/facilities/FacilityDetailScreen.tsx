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
  Linking,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import type { Facility, Space } from '../../types';

interface FacilityDetailScreenProps {
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

export function FacilityDetailScreen({ route, navigation }: FacilityDetailScreenProps) {
  const { id } = route.params;
  const [facility, setFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFacility = async () => {
    try {
      setError(null);
      const data = await api.getFacility(id);
      setFacility(data);
    } catch (err) {
      console.error('Failed to load facility:', err);
      setError('Failed to load facility details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFacility();
  }, [id]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadFacility();
  };

  const handleCall = () => {
    if (facility?.phone) {
      Linking.openURL(`tel:${facility.phone}`);
    }
  };

  const handleEmail = () => {
    if (facility?.email) {
      Linking.openURL(`mailto:${facility.email}`);
    }
  };

  const handleOpenMaps = () => {
    if (facility) {
      const address = encodeURIComponent(
        `${facility.address}, ${facility.city}, ${facility.state} ${facility.zip_code}`
      );
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
  };

  const handleBookSpace = (space: Space) => {
    // Navigate to booking flow with pre-selected space
    navigation.navigate('Bookings', { spaceId: space.id, facilityId: facility?.id });
  };

  const formatOperatingHours = (
    hours: Record<string, { open: string; close: string }> | null
  ) => {
    if (!hours) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };

    return days.map((day) => {
      const dayHours = hours[day];
      return {
        day: dayLabels[day],
        hours: dayHours ? `${dayHours.open} - ${dayHours.close}` : 'Closed',
        isOpen: !!dayHours,
      };
    });
  };

  const getTodayHours = () => {
    if (!facility?.operating_hours) return null;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const todayHours = facility.operating_hours[today];

    if (!todayHours) return 'Closed today';
    return `Open today: ${todayHours.open} - ${todayHours.close}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !facility) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😞</Text>
        <Text style={styles.errorText}>{error || 'Facility not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFacility}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const operatingHours = formatOperatingHours(facility.operating_hours);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Image */}
      {facility.image_url ? (
        <Image source={{ uri: facility.image_url }} style={styles.headerImage} />
      ) : (
        <View style={styles.headerImagePlaceholder}>
          <Text style={styles.headerImagePlaceholderText}>🏟️</Text>
        </View>
      )}

      {/* Facility Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.facilityName}>{facility.name}</Text>
          {!facility.is_active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inactive</Text>
            </View>
          )}
        </View>

        {facility.description && (
          <Text style={styles.description}>{facility.description}</Text>
        )}

        {/* Today's Hours */}
        {getTodayHours() && (
          <View style={styles.todayHoursContainer}>
            <Text style={styles.todayHoursIcon}>🕐</Text>
            <Text style={styles.todayHoursText}>{getTodayHours()}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenMaps}
          >
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>

          {facility.phone && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
          )}

          {facility.email && (
            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
              <Text style={styles.actionIcon}>✉️</Text>
              <Text style={styles.actionText}>Email</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <TouchableOpacity style={styles.addressCard} onPress={handleOpenMaps}>
            <View style={styles.addressContent}>
              <Text style={styles.addressText}>{facility.address}</Text>
              <Text style={styles.addressText}>
                {facility.city}, {facility.state} {facility.zip_code}
              </Text>
              {facility.country && facility.country !== 'USA' && (
                <Text style={styles.addressText}>{facility.country}</Text>
              )}
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Spaces Section */}
        {facility.spaces && facility.spaces.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Available Spaces ({facility.spaces.length})
            </Text>
            {facility.spaces.map((space) => (
              <View key={space.id} style={styles.spaceCard}>
                <View style={styles.spaceHeader}>
                  <View style={styles.spaceInfo}>
                    <Text style={styles.spaceName}>{space.name}</Text>
                    <Text style={styles.spaceSport}>{space.sport_type}</Text>
                  </View>
                  <View style={styles.spacePrice}>
                    <Text style={styles.priceAmount}>
                      ${Number(space.hourly_rate).toFixed(2)}
                    </Text>
                    <Text style={styles.priceUnit}>/hour</Text>
                  </View>
                </View>

                <View style={styles.spaceDetails}>
                  <View style={styles.spaceDetail}>
                    <Text style={styles.detailIcon}>👥</Text>
                    <Text style={styles.detailText}>
                      Capacity: {space.capacity}
                    </Text>
                  </View>
                  {space.surface_type && (
                    <View style={styles.spaceDetail}>
                      <Text style={styles.detailIcon}>🏠</Text>
                      <Text style={styles.detailText}>
                        {space.is_indoor ? 'Indoor' : 'Outdoor'} • {space.surface_type}
                      </Text>
                    </View>
                  )}
                </View>

                {space.features && space.features.length > 0 && (
                  <View style={styles.featuresContainer}>
                    {space.features.slice(0, 4).map((feature, index) => (
                      <View key={index} style={styles.featureTag}>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                    {space.features.length > 4 && (
                      <View style={styles.featureTag}>
                        <Text style={styles.featureText}>
                          +{space.features.length - 4} more
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.bookButton,
                    !space.is_active && styles.bookButtonDisabled,
                  ]}
                  onPress={() => handleBookSpace(space)}
                  disabled={!space.is_active}
                >
                  <Text
                    style={[
                      styles.bookButtonText,
                      !space.is_active && styles.bookButtonTextDisabled,
                    ]}
                  >
                    {space.is_active ? 'Book This Space' : 'Unavailable'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Amenities Section */}
        {facility.amenities && facility.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {facility.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Text style={styles.amenityIcon}>✓</Text>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Operating Hours Section */}
        {operatingHours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operating Hours</Text>
            <View style={styles.hoursCard}>
              {operatingHours.map((day, index) => (
                <View
                  key={day.day}
                  style={[
                    styles.hoursRow,
                    index < operatingHours.length - 1 && styles.hoursRowBorder,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !day.isOpen && styles.closedText,
                    ]}
                  >
                    {day.day}
                  </Text>
                  <Text
                    style={[
                      styles.hoursText,
                      !day.isOpen && styles.closedText,
                    ]}
                  >
                    {day.hours}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactCard}>
            {facility.phone && (
              <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactText}>{facility.phone}</Text>
              </TouchableOpacity>
            )}
            {facility.email && (
              <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
                <Text style={styles.contactIcon}>✉️</Text>
                <Text style={styles.contactText}>{facility.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

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
  headerImage: {
    width: '100%',
    height: 200,
  },
  headerImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImagePlaceholderText: {
    fontSize: 64,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  facilityName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  inactiveBadge: {
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: '600',
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  todayHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  todayHoursIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  todayHoursText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  addressCard: {
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
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  spaceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  spaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  spaceInfo: {
    flex: 1,
  },
  spaceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  spaceSport: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  spacePrice: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  spaceDetails: {
    marginBottom: SPACING.sm,
  },
  spaceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  featureTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  featureText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  bookButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  bookButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  amenitiesGrid: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: SPACING.xs,
  },
  amenityIcon: {
    fontSize: 14,
    color: COLORS.success,
  },
  amenityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  hoursCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  hoursRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  dayText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  hoursText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  closedText: {
    color: COLORS.disabled,
  },
  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  contactIcon: {
    fontSize: 18,
  },
  contactText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});
