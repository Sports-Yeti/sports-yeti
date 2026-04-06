import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { League, MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const CAMP_STATUSES = ['draft', 'open', 'closed', 'completed', 'cancelled'] as const;
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'all'] as const;

export function CampFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'CampForm'>>();
  const queryClient = useQueryClient();
  const editId = route.params?.id;
  const isEdit = !!editId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationFee, setRegistrationFee] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [skillLevel, setSkillLevel] = useState('all');
  const [ageGroup, setAgeGroup] = useState('');
  const [status, setStatus] = useState<string>('draft');

  const { data: leaguesData } = useQuery({
    queryKey: ['leagues', { per_page: 100 }],
    queryFn: () => api.getLeagues({ per_page: 100 }),
  });
  const leagues = leaguesData?.data ?? [];

  const { data: existingCamp, isLoading: isLoadingCamp } = useQuery({
    queryKey: ['camp', editId],
    queryFn: () => api.getCamp(editId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingCamp) {
      setName(existingCamp.name);
      setDescription(existingCamp.description ?? '');
      setLeagueId(existingCamp.league_id);
      setStartDate(existingCamp.start_date.split('T')[0]);
      setEndDate(existingCamp.end_date.split('T')[0]);
      setRegistrationFee(String(existingCamp.registration_fee));
      setMaxParticipants(String(existingCamp.max_participants));
      setSkillLevel(existingCamp.skill_level);
      setAgeGroup(existingCamp.age_group ?? '');
      setStatus(existingCamp.status);
    }
  }, [existingCamp]);

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createCamp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camps'] });
      navigation.goBack();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.updateCamp(editId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camps'] });
      queryClient.invalidateQueries({ queryKey: ['camp', editId] });
      navigation.goBack();
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const isValid = name.trim() && leagueId && startDate && endDate && registrationFee && maxParticipants;

  const handleSubmit = () => {
    if (!isValid) return;
    const data = {
      name: name.trim(),
      description: description.trim() || null,
      league_id: leagueId,
      start_date: startDate,
      end_date: endDate,
      registration_fee: parseFloat(registrationFee),
      max_participants: parseInt(maxParticipants, 10),
      skill_level: skillLevel,
      age_group: ageGroup.trim() || null,
      status,
    };
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoadingCamp) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'Edit Camp' : 'Create Camp'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.form}>
        {mutationError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              {(mutationError as Error).message || 'Something went wrong'}
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Camp name" placeholderTextColor={COLORS.textMuted} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>League</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {leagues.map((league: League) => (
              <TouchableOpacity
                key={league.id}
                style={[styles.chip, leagueId === league.id && styles.chipActive]}
                onPress={() => setLeagueId(league.id)}
              >
                <Text style={[styles.chipText, leagueId === league.id && styles.chipTextActive]}>
                  {league.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Camp description..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>End Date</Text>
            <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Registration Fee ($)</Text>
            <TextInput style={styles.input} value={registrationFee} onChangeText={setRegistrationFee} placeholder="0.00" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Max Participants</Text>
            <TextInput style={styles.input} value={maxParticipants} onChangeText={setMaxParticipants} placeholder="20" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Skill Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {SKILL_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.chip, skillLevel === level && styles.chipActive]}
                onPress={() => setSkillLevel(level)}
              >
                <Text style={[styles.chipText, skillLevel === level && styles.chipTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Age Group (optional)</Text>
          <TextInput style={styles.input} value={ageGroup} onChangeText={setAgeGroup} placeholder="e.g., 8-12, U14" placeholderTextColor={COLORS.textMuted} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {CAMP_STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, status === s && styles.chipActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.chipText, status === s && styles.chipTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (!isValid || isSaving) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <Text style={styles.submitButtonText}>{isEdit ? 'Update Camp' : 'Create Camp'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, paddingBottom: SPACING.md,
  },
  backButton: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  form: {
    backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, borderRadius: 12,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl,
  },
  errorBanner: { backgroundColor: COLORS.error + '15', padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.lg },
  errorBannerText: { color: COLORS.error, fontSize: FONT_SIZES.sm },
  field: { marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.background, borderRadius: 8, paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  textArea: { minHeight: 100 },
  row: { flexDirection: 'row', gap: SPACING.md },
  chipScroll: { flexGrow: 0 },
  chip: {
    backgroundColor: COLORS.background, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 20, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  chipTextActive: { color: COLORS.textLight },
  submitButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: 8, alignItems: 'center', marginTop: SPACING.sm },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
