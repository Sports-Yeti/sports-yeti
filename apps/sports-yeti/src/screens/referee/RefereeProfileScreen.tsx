import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Referee } from '../../types';

const ALL_SPORT_TYPES = ['basketball', 'soccer', 'football', 'baseball', 'volleyball', 'hockey', 'tennis', 'softball'];
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced', 'pro'];

export function RefereeProfileScreen() {
  const queryClient = useQueryClient();
  const [sportTypes, setSportTypes] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [certification, setCertification] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [bio, setBio] = useState('');
  const [radiusMiles, setRadiusMiles] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileId, setProfileId] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['referee-profile'],
    queryFn: () => api.getRefereeProfile(),
    retry: false,
  });

  useEffect(() => {
    if (profile) {
      setHasProfile(true);
      setProfileId(profile.id);
      setSportTypes(profile.sport_types);
      const level =
        profile.experience_level === 'expert' ? 'pro' : profile.experience_level;
      setExperienceLevel(level);
      setCertification(profile.certification ?? '');
      setHourlyRate(Number(profile.hourly_rate).toString());
      setBio(profile.bio ?? '');
      setRadiusMiles(
        profile.radius_miles != null ? String(profile.radius_miles) : ''
      );
      setIsAvailable(profile.is_available);
    }
  }, [profile]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Referee> & { radius_miles?: number }) =>
      api.createRefereeProfile(data),
    onSuccess: (newProfile) => {
      setHasProfile(true);
      setProfileId(newProfile.id);
      queryClient.invalidateQueries({ queryKey: ['referee-profile'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Referee> & { radius_miles?: number }) =>
      api.updateRefereeProfile(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referee-profile'] });
    },
  });

  const toggleSport = (sport: string) => {
    setSportTypes((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleSave = () => {
    const parsedRadius = parseInt(radiusMiles, 10);
    const data: Partial<Referee> & { radius_miles?: number } = {
      sport_types: sportTypes,
      experience_level: experienceLevel,
      certification: certification || null,
      hourly_rate: parseFloat(hourlyRate) || 0,
      bio: bio || null,
      is_available: isAvailable,
    };

    if (!Number.isNaN(parsedRadius) && parsedRadius > 0) {
      data.radius_miles = parsedRadius;
    }

    if (hasProfile) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sport Types</Text>
        <View style={styles.chipGrid}>
          {ALL_SPORT_TYPES.map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[styles.sportChip, sportTypes.includes(sport) && styles.sportChipActive]}
              onPress={() => toggleSport(sport)}
            >
              <Text style={[styles.sportChipText, sportTypes.includes(sport) && styles.sportChipTextActive]}>
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience Level</Text>
        <View style={styles.chipGrid}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.levelChip, experienceLevel === level && styles.levelChipActive]}
              onPress={() => setExperienceLevel(level)}
            >
              <Text style={[styles.levelChipText, experienceLevel === level && styles.levelChipTextActive]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certification</Text>
        <TextInput
          style={styles.input}
          value={certification}
          onChangeText={setCertification}
          placeholder="e.g., USSF Grade 8, NFHS Certified"
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hourly Rate ($)</Text>
        <TextInput
          style={styles.input}
          value={hourlyRate}
          onChangeText={setHourlyRate}
          placeholder="Enter your hourly rate"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Travel Radius (miles)</Text>
        <TextInput
          style={styles.input}
          value={radiusMiles}
          onChangeText={setRadiusMiles}
          placeholder="e.g. 25"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell leagues and teams about your experience..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Available for Games</Text>
            <Text style={styles.toggleDescription}>
              Toggle off to stop receiving game requests
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
            thumbColor={isAvailable ? COLORS.primary : COLORS.disabled}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color={COLORS.textLight} size="small" />
        ) : (
          <Text style={styles.saveButtonText}>
            {hasProfile ? 'Update Profile' : 'Create Profile'}
          </Text>
        )}
      </TouchableOpacity>

      {isSuccess && (
        <Text style={styles.successText}>Profile saved successfully!</Text>
      )}

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  sportChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  sportChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  sportChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sportChipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  levelChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  levelChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  levelChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  levelChipTextActive: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  successText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
