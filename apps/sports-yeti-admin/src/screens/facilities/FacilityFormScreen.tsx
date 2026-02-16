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
import type { Facility, League } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'FacilityForm'>;

interface FormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  email: string;
  league_id: string;
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  league_id?: string;
  email?: string;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export function FacilityFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const queryClient = useQueryClient();
  const facilityId = route.params?.id;
  const isEditing = !!facilityId;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    phone: '',
    email: '',
    league_id: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showLeaguePicker, setShowLeaguePicker] = useState(false);

  // Fetch leagues for the dropdown
  const { data: leaguesData } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => api.getLeagues({ per_page: 100 }),
  });

  const leagues = leaguesData?.data ?? [];

  // Fetch existing facility data if editing
  const { data: existingFacility, isLoading: isLoadingFacility } = useQuery({
    queryKey: ['facility', facilityId],
    queryFn: () => api.getFacility(facilityId!),
    enabled: isEditing,
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingFacility) {
      setFormData({
        name: existingFacility.name,
        description: existingFacility.description ?? '',
        address: existingFacility.address,
        city: existingFacility.city,
        state: existingFacility.state,
        zip_code: existingFacility.zip_code,
        country: existingFacility.country ?? 'USA',
        phone: existingFacility.phone ?? '',
        email: existingFacility.email ?? '',
        league_id: existingFacility.league_id,
        is_active: existingFacility.is_active,
      });
    }
  }, [existingFacility]);

  // Set default league if only one exists
  useEffect(() => {
    if (!isEditing && leagues.length === 1 && !formData.league_id) {
      setFormData((prev) => ({ ...prev, league_id: leagues[0].id }));
    }
  }, [leagues, isEditing, formData.league_id]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Facility>) => api.createFacility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      navigation.goBack();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Facility>) => api.updateFacility(facilityId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facility', facilityId] });
      navigation.goBack();
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'ZIP code is required';
    }

    if (!formData.league_id) {
      newErrors.league_id = 'Please select a league';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const data: Partial<Facility> = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state,
      zip_code: formData.zip_code.trim(),
      country: formData.country,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      league_id: formData.league_id,
      is_active: formData.is_active,
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

  const getSelectedLeagueName = () => {
    const league = leagues.find((l) => l.id === formData.league_id);
    return league?.name ?? 'Select a league';
  };

  if (isEditing && isLoadingFacility) {
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
            {isEditing ? 'Edit Facility' : 'Add Facility'}
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
              {isEditing ? 'Save Changes' : 'Add Facility'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* League */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>League *</Text>
            <TouchableOpacity
              style={[styles.selectButton, errors.league_id && styles.selectButtonError]}
              onPress={() => setShowLeaguePicker(!showLeaguePicker)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !formData.league_id && styles.selectPlaceholder,
                ]}
              >
                {getSelectedLeagueName()}
              </Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
            {showLeaguePicker && (
              <View style={styles.pickerContainer}>
                {leagues.map((league) => (
                  <TouchableOpacity
                    key={league.id}
                    style={[
                      styles.pickerOption,
                      formData.league_id === league.id && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      updateField('league_id', league.id);
                      setShowLeaguePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.league_id === league.id && styles.pickerOptionTextActive,
                      ]}
                    >
                      {league.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.league_id && (
              <Text style={styles.errorText}>{errors.league_id}</Text>
            )}
          </View>

          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Facility Name *</Text>
            <TextInput
              style={[styles.textInput, errors.name && styles.textInputError]}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Enter facility name"
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
              placeholder="Enter facility description"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Location</Text>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Street Address *</Text>
            <TextInput
              style={[styles.textInput, errors.address && styles.textInputError]}
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="123 Main Street"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* City */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>City *</Text>
            <TextInput
              style={[styles.textInput, errors.city && styles.textInputError]}
              value={formData.city}
              onChangeText={(value) => updateField('city', value)}
              placeholder="City"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          {/* State & ZIP Row */}
          <View style={styles.fieldRow}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: SPACING.md }]}>
              <Text style={styles.fieldLabel}>State *</Text>
              <TouchableOpacity
                style={[styles.selectButton, errors.state && styles.selectButtonError]}
                onPress={() => setShowStatePicker(!showStatePicker)}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    !formData.state && styles.selectPlaceholder,
                  ]}
                >
                  {formData.state || 'Select'}
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </TouchableOpacity>
              {showStatePicker && (
                <View style={[styles.pickerContainer, styles.statePickerContainer]}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {US_STATES.map((state) => (
                      <TouchableOpacity
                        key={state}
                        style={[
                          styles.pickerOption,
                          formData.state === state && styles.pickerOptionActive,
                        ]}
                        onPress={() => {
                          updateField('state', state);
                          setShowStatePicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.state === state && styles.pickerOptionTextActive,
                          ]}
                        >
                          {state}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>

            <View style={[styles.fieldContainer, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>ZIP Code *</Text>
              <TextInput
                style={[styles.textInput, errors.zip_code && styles.textInputError]}
                value={formData.zip_code}
                onChangeText={(value) => updateField('zip_code', value)}
                placeholder="12345"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={10}
              />
              {errors.zip_code && <Text style={styles.errorText}>{errors.zip_code}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {/* Phone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="(555) 123-4567"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.textInput, errors.email && styles.textInputError]}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="facility@example.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Active Status */}
          <View style={styles.fieldContainer}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.fieldLabel}>Active Status</Text>
                <Text style={styles.fieldHint}>
                  Inactive facilities are hidden from users
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
  fieldRow: {
    flexDirection: 'row',
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
  selectButtonError: {
    borderColor: COLORS.error,
  },
  selectButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  selectPlaceholder: {
    color: COLORS.textMuted,
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
  statePickerContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
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
