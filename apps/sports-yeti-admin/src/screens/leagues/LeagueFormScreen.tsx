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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { League } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'LeagueForm'>;

interface FormData {
  name: string;
  description: string;
  sport_type: string;
  location: string;
  timezone: string;
  registration_fee: string;
  is_active: boolean;
  season_start_date: string;
  season_end_date: string;
  registration_open_date: string;
  registration_close_date: string;
  max_teams: string;
  status: 'draft' | 'published';
}

interface FormErrors {
  name?: string;
  sport_type?: string;
  registration_fee?: string;
  max_teams?: string;
}

const SPORT_TYPES = [
  'Basketball',
  'Soccer',
  'Football',
  'Baseball',
  'Volleyball',
  'Hockey',
  'Tennis',
  'Golf',
  'Swimming',
  'Other',
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Pacific/Honolulu',
  'UTC',
];

export function LeagueFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const queryClient = useQueryClient();
  const leagueId = route.params?.id;
  const isEditing = !!leagueId;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    sport_type: 'Basketball',
    location: '',
    timezone: 'America/New_York',
    registration_fee: '0',
    is_active: true,
    season_start_date: '',
    season_end_date: '',
    registration_open_date: '',
    registration_close_date: '',
    max_teams: '',
    status: 'draft',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);

  // Fetch existing league data if editing
  const { data: existingLeague, isLoading: isLoadingLeague } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => api.getLeague(leagueId!),
    enabled: isEditing,
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingLeague) {
      setFormData({
        name: existingLeague.name,
        description: existingLeague.description ?? '',
        sport_type: existingLeague.sport_type ?? 'Basketball',
        location: existingLeague.location ?? '',
        timezone: existingLeague.timezone ?? 'America/New_York',
        registration_fee: String(Number(existingLeague.registration_fee ?? 0)),
        is_active: existingLeague.is_active,
        season_start_date: existingLeague.season_start_date ?? '',
        season_end_date: existingLeague.season_end_date ?? '',
        registration_open_date: existingLeague.registration_open_date ?? '',
        registration_close_date: existingLeague.registration_close_date ?? '',
        max_teams: existingLeague.max_teams != null ? String(existingLeague.max_teams) : '',
        status: existingLeague.status === 'published' ? 'published' : 'draft',
      });
    }
  }, [existingLeague]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<League>) => api.createLeague(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      navigation.goBack();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<League>) => api.updateLeague(leagueId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      queryClient.invalidateQueries({ queryKey: ['league', leagueId] });
      navigation.goBack();
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.sport_type) {
      newErrors.sport_type = 'Sport type is required';
    }

    const fee = parseFloat(formData.registration_fee);
    if (isNaN(fee) || fee < 0) {
      newErrors.registration_fee = 'Registration fee must be a valid number';
    }

    if (formData.max_teams.trim()) {
      const maxTeams = parseInt(formData.max_teams, 10);
      if (isNaN(maxTeams) || maxTeams < 0) {
        newErrors.max_teams = 'Max teams must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const data: Partial<League> = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      sport_type: formData.sport_type,
      location: formData.location.trim() || null,
      timezone: formData.timezone,
      registration_fee: parseFloat(formData.registration_fee),
      is_active: formData.is_active,
      season_start_date: formData.season_start_date.trim() || null,
      season_end_date: formData.season_end_date.trim() || null,
      registration_open_date: formData.registration_open_date.trim() || null,
      registration_close_date: formData.registration_close_date.trim() || null,
      max_teams: formData.max_teams.trim() ? parseInt(formData.max_teams, 10) : null,
      status: formData.status,
    };

    if (isEditing) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isEditing && isLoadingLeague) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backLink} onPress={handleBack}>
            <Text style={styles.backLinkText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Edit League' : 'Create League'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Save Changes' : 'Create League'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>League Name *</Text>
            <TextInput
              style={[styles.textInput, errors.name && styles.textInputError]}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Enter league name"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Enter league description"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Sport Type */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Sport Type *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowSportPicker(!showSportPicker)}
            >
              <Text style={styles.selectButtonText}>{formData.sport_type}</Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
            {showSportPicker && (
              <View style={styles.pickerContainer}>
                {SPORT_TYPES.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.pickerOption,
                      formData.sport_type === sport && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      updateField('sport_type', sport);
                      setShowSportPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.sport_type === sport && styles.pickerOptionTextActive,
                      ]}
                    >
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.sport_type && (
              <Text style={styles.errorText}>{errors.sport_type}</Text>
            )}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Location & Settings</Text>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location}
              onChangeText={(value) => updateField('location', value)}
              placeholder="City, State"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Timezone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Timezone</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowTimezonePicker(!showTimezonePicker)}
            >
              <Text style={styles.selectButtonText}>{formData.timezone}</Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
            {showTimezonePicker && (
              <View style={styles.pickerContainer}>
                {TIMEZONES.map((tz) => (
                  <TouchableOpacity
                    key={tz}
                    style={[
                      styles.pickerOption,
                      formData.timezone === tz && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      updateField('timezone', tz);
                      setShowTimezonePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.timezone === tz && styles.pickerOptionTextActive,
                      ]}
                    >
                      {tz}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Registration Fee */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Registration Fee ($)</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.registration_fee && styles.textInputError,
              ]}
              value={formData.registration_fee}
              onChangeText={(value) => updateField('registration_fee', value)}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
            />
            {errors.registration_fee && (
              <Text style={styles.errorText}>{errors.registration_fee}</Text>
            )}
          </View>

          {/* Active Status */}
          <View style={styles.fieldContainer}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.fieldLabel}>Active Status</Text>
                <Text style={styles.fieldHint}>
                  Inactive leagues are hidden from players
                </Text>
              </View>
              <Switch
                value={formData.is_active}
                onValueChange={(value) => updateField('is_active', value)}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                thumbColor={formData.is_active ? COLORS.primary : COLORS.textMuted}
              />
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Season & Registration</Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Season Start Date</Text>
            <TextInput
              style={styles.textInput}
              value={formData.season_start_date}
              onChangeText={(value) => updateField('season_start_date', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Season End Date</Text>
            <TextInput
              style={styles.textInput}
              value={formData.season_end_date}
              onChangeText={(value) => updateField('season_end_date', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Registration Opens</Text>
            <TextInput
              style={styles.textInput}
              value={formData.registration_open_date}
              onChangeText={(value) => updateField('registration_open_date', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Registration Closes</Text>
            <TextInput
              style={styles.textInput}
              value={formData.registration_close_date}
              onChangeText={(value) => updateField('registration_close_date', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Max Teams</Text>
            <TextInput
              style={[styles.textInput, errors.max_teams && styles.textInputError]}
              value={formData.max_teams}
              onChangeText={(value) => updateField('max_teams', value)}
              placeholder="Leave blank for unlimited"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
            />
            {errors.max_teams && (
              <Text style={styles.errorText}>{errors.max_teams}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.fieldLabel}>Publish League</Text>
                <Text style={styles.fieldHint}>
                  Drafts are hidden from players. Published leagues are visible.
                </Text>
              </View>
              <Switch
                value={formData.status === 'published'}
                onValueChange={(value) =>
                  updateField('status', value ? 'published' : 'draft')
                }
                trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                thumbColor={formData.status === 'published' ? COLORS.primary : COLORS.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Error Message */}
        {(createMutation.error || updateMutation.error) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              {(createMutation.error as Error)?.message ||
                (updateMutation.error as Error)?.message ||
                'An error occurred. Please try again.'}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    alignItems: 'flex-start',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
  },
  backLink: {
    marginBottom: SPACING.sm,
  },
  backLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  fieldHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textInputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
  },
  selectButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  selectArrow: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  pickerOptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  pickerOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  errorBanner: {
    backgroundColor: COLORS.error + '15',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: SPACING.xxl,
  },
});
