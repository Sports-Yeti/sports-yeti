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
import type { League, MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export function WaiverFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'WaiverForm'>>();
  const queryClient = useQueryClient();
  const editId = route.params?.id;
  const isEdit = !!editId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [isRequired, setIsRequired] = useState(true);

  const { data: leaguesData } = useQuery({
    queryKey: ['leagues', { per_page: 100 }],
    queryFn: () => api.getLeagues({ per_page: 100 }),
  });
  const leagues = leaguesData?.data ?? [];

  const { data: existingWaiver, isLoading: isLoadingWaiver } = useQuery({
    queryKey: ['waiver', editId],
    queryFn: () => api.getWaiver(editId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingWaiver) {
      setTitle(existingWaiver.title);
      setContent(existingWaiver.content);
      setLeagueId(existingWaiver.league_id);
      setIsRequired(existingWaiver.is_required);
    }
  }, [existingWaiver]);

  const createMutation = useMutation({
    mutationFn: (data: { league_id: string; title: string; content: string; is_required: boolean }) =>
      api.createWaiver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waivers'] });
      navigation.goBack();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { league_id: string; title: string; content: string; is_required: boolean }) =>
      api.updateWaiver(editId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waivers'] });
      queryClient.invalidateQueries({ queryKey: ['waiver', editId] });
      navigation.goBack();
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !leagueId) return;
    const data = { league_id: leagueId, title: title.trim(), content: content.trim(), is_required: isRequired };
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoadingWaiver) {
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
        <Text style={styles.title}>{isEdit ? 'Edit Waiver' : 'Create Waiver'}</Text>
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
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter waiver title"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>League</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leagueScroll}>
            {leagues.map((league: League) => (
              <TouchableOpacity
                key={league.id}
                style={[styles.leagueChip, leagueId === league.id && styles.leagueChipActive]}
                onPress={() => setLeagueId(league.id)}
              >
                <Text style={[styles.leagueChipText, leagueId === league.id && styles.leagueChipTextActive]}>
                  {league.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Enter waiver content..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Required</Text>
            <Text style={styles.switchHint}>Players must sign this waiver</Text>
          </View>
          <Switch
            value={isRequired}
            onValueChange={setIsRequired}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
            thumbColor={isRequired ? COLORS.primary : COLORS.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (!title.trim() || !content.trim() || !leagueId || isSaving) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!title.trim() || !content.trim() || !leagueId || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <Text style={styles.submitButtonText}>{isEdit ? 'Update Waiver' : 'Create Waiver'}</Text>
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
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  errorBanner: {
    backgroundColor: COLORS.error + '15', padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.lg,
  },
  errorBannerText: { color: COLORS.error, fontSize: FONT_SIZES.sm },
  field: { marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.background, borderRadius: 8, paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  textArea: { minHeight: 160 },
  leagueScroll: { flexGrow: 0 },
  leagueChip: {
    backgroundColor: COLORS.background, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 20, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  leagueChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  leagueChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  leagueChipTextActive: { color: COLORS.textLight },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.xl, paddingVertical: SPACING.sm,
  },
  switchHint: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  submitButton: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: 8, alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
