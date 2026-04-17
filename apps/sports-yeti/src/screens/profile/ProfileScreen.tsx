import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../stores';
import { api } from '../../services/api';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  EXPERIENCE_LEVELS,
  AVAILABILITY_STATUS,
} from '../../constants';
import type { Player } from '../../types';

interface ProfileScreenProps {
  navigation?: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

export function ProfileScreen({ navigation }: ProfileScreenProps = {}) {
  const { user, logout } = useAuthStore();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [isPrivate, setIsPrivate] = useState(false);
  const [availableToSub, setAvailableToSub] = useState(false);
  const [certifications, setCertifications] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showTeams, setShowTeams] = useState(true);

  const loadPlayer = async () => {
    try {
      const playerData = await api.getMyPlayer();
      setPlayer(playerData);
      setBio(playerData.bio || '');
      setExperienceLevel(playerData.experience_level);
      setAvailabilityStatus(playerData.availability_status);
      setIsPrivate(playerData.is_private);
      const stats = playerData.stats as Record<string, unknown> | null;
      setAvailableToSub(Boolean(stats?.available_to_sub));
      setCertifications(String(stats?.certifications ?? ''));
      setShowStats(stats?.show_stats !== false);
      setShowHighlights(stats?.show_highlights !== false);
      setShowTeams(stats?.show_teams !== false);
    } catch (error) {
      console.error('Failed to load player:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlayer();
  }, []);

  const handleSave = async () => {
    if (!player) return;

    setIsSaving(true);
    try {
      const updatedPlayer = await api.updatePlayer(player.id, {
        bio,
        experience_level: experienceLevel as Player['experience_level'],
        availability_status: availabilityStatus as Player['availability_status'],
        is_private: isPrivate,
        stats: {
          ...(player.stats as Record<string, unknown> ?? {}),
          available_to_sub: availableToSub,
          certifications,
          show_stats: showStats,
          show_highlights: showHighlights,
          show_teams: showTeams,
        },
      });
      setPlayer(updatedPlayer);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {player?.teams?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Number((player?.stats as Record<string, unknown>)?.games_played ?? 0)}
          </Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Number((player?.stats as Record<string, unknown>)?.camps_attended ?? 0)}
          </Text>
          <Text style={styles.statLabel}>Camps</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Number((player?.stats as Record<string, unknown>)?.highlights_count ?? 0)}
          </Text>
          <Text style={styles.statLabel}>Highlights</Text>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Player Profile</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={styles.saveButton}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isEditing ? (
          <>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={styles.textArea}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Experience Level</Text>
            <View style={styles.optionsRow}>
              {Object.entries(EXPERIENCE_LEVELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.optionButton,
                    experienceLevel === key && styles.optionButtonActive,
                  ]}
                  onPress={() => setExperienceLevel(key)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      experienceLevel === key && styles.optionTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Availability</Text>
            <View style={styles.optionsRow}>
              {Object.entries(AVAILABILITY_STATUS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.optionButton,
                    availabilityStatus === key && styles.optionButtonActive,
                  ]}
                  onPress={() => setAvailabilityStatus(key)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      availabilityStatus === key && styles.optionTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.privacyToggle}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <Text style={styles.privacyLabel}>Private Profile</Text>
              <View
                style={[
                  styles.toggle,
                  isPrivate && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    isPrivate && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.privacyToggle}
              onPress={() => setAvailableToSub(!availableToSub)}
            >
              <Text style={styles.privacyLabel}>Available to Sub</Text>
              <View
                style={[styles.toggle, availableToSub && styles.toggleActive]}
              >
                <View
                  style={[styles.toggleThumb, availableToSub && styles.toggleThumbActive]}
                />
              </View>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Certifications</Text>
            <TextInput
              style={styles.textArea}
              value={certifications}
              onChangeText={setCertifications}
              placeholder="CPR, First Aid, Coaching License..."
              multiline
              numberOfLines={2}
            />
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bio</Text>
              <Text style={styles.infoValue}>
                {player?.bio || 'No bio added yet'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>
                {EXPERIENCE_LEVELS[
                  player?.experience_level as keyof typeof EXPERIENCE_LEVELS
                ] || player?.experience_level}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {AVAILABILITY_STATUS[
                  player?.availability_status as keyof typeof AVAILABILITY_STATUS
                ] || player?.availability_status}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Available to Sub</Text>
              <Text style={[styles.infoValue, { color: availableToSub ? COLORS.success : COLORS.textSecondary }]}>
                {availableToSub ? 'Yes' : 'No'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Certifications</Text>
              <Text style={styles.infoValue}>
                {certifications || 'None'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Profile</Text>
              <Text style={styles.infoValue}>
                {player?.is_private ? 'Private' : 'Public'}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Profile Visibility */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Visibility</Text>
        <TouchableOpacity style={styles.privacyToggle} onPress={() => setShowStats(!showStats)}>
          <Text style={styles.privacyLabel}>Show Stats</Text>
          <View style={[styles.toggle, showStats && styles.toggleActive]}>
            <View style={[styles.toggleThumb, showStats && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.privacyToggle} onPress={() => setShowHighlights(!showHighlights)}>
          <Text style={styles.privacyLabel}>Show Highlights</Text>
          <View style={[styles.toggle, showHighlights && styles.toggleActive]}>
            <View style={[styles.toggleThumb, showHighlights && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.privacyToggle} onPress={() => setShowTeams(!showTeams)}>
          <Text style={styles.privacyLabel}>Show Teams</Text>
          <View style={[styles.toggle, showTeams && styles.toggleActive]}>
            <View style={[styles.toggleThumb, showTeams && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>
      </View>

      {navigation && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('Waivers')}
          >
            <Text style={styles.navRowIcon}>📄</Text>
            <Text style={styles.navRowText}>View Waivers</Text>
            <Text style={styles.navRowChevron}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

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
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  section: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  editButton: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.surface,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  optionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  optionTextActive: {
    color: COLORS.surface,
    fontWeight: '500',
  },
  privacyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  privacyLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  toggleThumbActive: {
    marginLeft: 22,
  },
  infoRow: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  navRowIcon: {
    fontSize: 22,
    marginRight: SPACING.md,
  },
  navRowText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  navRowChevron: {
    fontSize: 22,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '500',
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
