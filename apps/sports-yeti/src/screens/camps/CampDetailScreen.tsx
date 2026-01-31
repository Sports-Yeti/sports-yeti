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
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, EXPERIENCE_LEVELS } from '../../constants';
import type { Camp } from '../../types';

interface CampDetailScreenProps {
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

const CAMP_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  open: 'Open for Registration',
  closed: 'Registration Closed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const CAMP_STATUS_COLORS: Record<string, string> = {
  draft: COLORS.textSecondary,
  open: COLORS.success,
  closed: COLORS.warning,
  completed: COLORS.textSecondary,
  cancelled: COLORS.error,
};

export function CampDetailScreen({ route, navigation }: CampDetailScreenProps) {
  const { id } = route.params;
  const [camp, setCamp] = useState<Camp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCamp = async () => {
    try {
      setError(null);
      const data = await api.getCamp(id);
      setCamp(data);
    } catch (err) {
      console.error('Failed to load camp:', err);
      setError('Failed to load camp details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCamp();
  }, [id]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadCamp();
  };

  const handleRegister = async () => {
    if (!camp) return;

    Alert.alert(
      'Register for Camp',
      `Would you like to register for "${camp.name}"?\n\nRegistration Fee: $${camp.registration_fee.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            try {
              setIsRegistering(true);
              await api.registerForCamp(id);
              Alert.alert('Success', 'You have been registered for this camp!');
              loadCamp(); // Refresh to update registration count
            } catch (err) {
              console.error('Failed to register:', err);
              Alert.alert('Error', 'Failed to register for camp. Please try again.');
            } finally {
              setIsRegistering(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  const getSpotsRemaining = () => {
    if (!camp) return 0;
    const registered = camp.registrations_count || 0;
    return Math.max(0, camp.max_participants - registered);
  };

  const getRegistrationProgress = () => {
    if (!camp || camp.max_participants === 0) return 0;
    const registered = camp.registrations_count || 0;
    return Math.min((registered / camp.max_participants) * 100, 100);
  };

  const isRegistrationOpen = () => {
    if (!camp) return false;
    return camp.status === 'open' && getSpotsRemaining() > 0;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !camp) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😞</Text>
        <Text style={styles.errorText}>{error || 'Camp not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCamp}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = CAMP_STATUS_COLORS[camp.status] || COLORS.textSecondary;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Image */}
      {camp.image_url ? (
        <Image source={{ uri: camp.image_url }} style={styles.headerImage} />
      ) : (
        <View style={styles.headerImagePlaceholder}>
          <Text style={styles.headerImagePlaceholderText}>⛺</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {CAMP_STATUS_LABELS[camp.status] || camp.status}
            </Text>
          </View>
        </View>

        {/* Camp Name and Price */}
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.campName}>{camp.name}</Text>
            {camp.league && (
              <Text style={styles.leagueName}>{camp.league.name}</Text>
            )}
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceAmount}>
              ${camp.registration_fee.toFixed(2)}
            </Text>
            <Text style={styles.priceLabel}>per person</Text>
          </View>
        </View>

        {/* Description */}
        {camp.description && (
          <Text style={styles.description}>{camp.description}</Text>
        )}

        {/* Quick Info Cards */}
        <View style={styles.infoCardsRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardIcon}>📅</Text>
            <Text style={styles.infoCardTitle}>Duration</Text>
            <Text style={styles.infoCardValue}>
              {getDuration(camp.start_date, camp.end_date)}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardIcon}>🎯</Text>
            <Text style={styles.infoCardTitle}>Skill Level</Text>
            <Text style={styles.infoCardValue}>
              {EXPERIENCE_LEVELS[camp.skill_level as keyof typeof EXPERIENCE_LEVELS] ||
                camp.skill_level}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardIcon}>👥</Text>
            <Text style={styles.infoCardTitle}>Capacity</Text>
            <Text style={styles.infoCardValue}>{camp.max_participants}</Text>
          </View>
        </View>

        {/* Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Camp Dates</Text>
          <View style={styles.datesCard}>
            <View style={styles.dateItem}>
              <View style={styles.dateIconContainer}>
                <Text style={styles.dateIcon}>🏁</Text>
              </View>
              <View>
                <Text style={styles.dateLabel}>Starts</Text>
                <Text style={styles.dateValue}>{formatDate(camp.start_date)}</Text>
              </View>
            </View>
            <View style={styles.dateSeparator} />
            <View style={styles.dateItem}>
              <View style={styles.dateIconContainer}>
                <Text style={styles.dateIcon}>🎉</Text>
              </View>
              <View>
                <Text style={styles.dateLabel}>Ends</Text>
                <Text style={styles.dateValue}>{formatDate(camp.end_date)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Age Group Section */}
        {camp.age_group && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Age Group</Text>
            <View style={styles.ageCard}>
              <Text style={styles.ageIcon}>👤</Text>
              <Text style={styles.ageText}>{camp.age_group}</Text>
            </View>
          </View>
        )}

        {/* Registration Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration</Text>
          <View style={styles.registrationCard}>
            <View style={styles.registrationHeader}>
              <Text style={styles.registrationCount}>
                {camp.registrations_count || 0} / {camp.max_participants}
              </Text>
              <Text style={styles.registrationLabel}>registered</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${getRegistrationProgress()}%` },
                ]}
              />
            </View>
            <Text style={styles.spotsRemaining}>
              {getSpotsRemaining() > 0
                ? `${getSpotsRemaining()} spots remaining`
                : 'No spots remaining'}
            </Text>
          </View>
        </View>

        {/* What's Included (placeholder for sessions) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          <View style={styles.includedCard}>
            <View style={styles.includedItem}>
              <Text style={styles.includedIcon}>✓</Text>
              <Text style={styles.includedText}>
                {getDuration(camp.start_date, camp.end_date)} of training
              </Text>
            </View>
            <View style={styles.includedItem}>
              <Text style={styles.includedIcon}>✓</Text>
              <Text style={styles.includedText}>Professional coaching</Text>
            </View>
            <View style={styles.includedItem}>
              <Text style={styles.includedIcon}>✓</Text>
              <Text style={styles.includedText}>Skills assessment</Text>
            </View>
            <View style={styles.includedItem}>
              <Text style={styles.includedIcon}>✓</Text>
              <Text style={styles.includedText}>Equipment provided</Text>
            </View>
          </View>
        </View>

        {/* Registration Button */}
        <View style={styles.registerSection}>
          <TouchableOpacity
            style={[
              styles.registerButton,
              !isRegistrationOpen() && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!isRegistrationOpen() || isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color={COLORS.textLight} />
            ) : (
              <>
                <Text style={styles.registerButtonText}>
                  {isRegistrationOpen()
                    ? `Register Now - $${camp.registration_fee.toFixed(2)}`
                    : camp.status === 'open'
                    ? 'Camp is Full'
                    : 'Registration Closed'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          {isRegistrationOpen() && (
            <Text style={styles.registerNote}>
              You will be redirected to complete payment
            </Text>
          )}
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
  statusContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  campName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  leagueName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  infoCardTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoCardValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
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
  datesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 18,
  },
  dateLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  dateValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  dateSeparator: {
    height: 1,
    backgroundColor: COLORS.background,
    marginVertical: SPACING.md,
    marginLeft: 56,
  },
  ageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ageIcon: {
    fontSize: 24,
  },
  ageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  registrationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  registrationHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  registrationCount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  registrationLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  spotsRemaining: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  includedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  includedIcon: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  includedText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  registerSection: {
    marginTop: SPACING.md,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  registerButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  registerNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});
