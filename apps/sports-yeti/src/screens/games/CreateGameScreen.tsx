import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import type { Facility, Space } from '../../types';

interface CreateGameScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const SPORTS = [
  { key: 'basketball', label: 'Basketball', icon: '🏀' },
  { key: 'soccer', label: 'Soccer', icon: '⚽' },
  { key: 'football', label: 'Football', icon: '🏈' },
  { key: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { key: 'baseball', label: 'Baseball', icon: '⚾' },
];

const SKILL_LEVELS = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'pro', label: 'Pro' },
];

const GAME_TYPES = [
  { key: 'open_play', label: 'Open Play' },
  { key: 'regular', label: 'Regular' },
  { key: 'playoff', label: 'Playoff' },
  { key: 'friendly', label: 'Friendly' },
];

export function CreateGameScreen({ navigation }: CreateGameScreenProps) {
  const [sport, setSport] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [playerLimit, setPlayerLimit] = useState('');
  const [gameType, setGameType] = useState('open_play');
  const [isRefereeRequired, setIsRefereeRequired] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const [isFacilitiesLoading, setIsFacilitiesLoading] = useState(false);
  const [isSpacesLoading, setIsSpacesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadFacilities = useCallback(async () => {
    setIsFacilitiesLoading(true);
    try {
      const response = await api.getFacilities({ per_page: 50 });
      setFacilities(response.data);
    } catch {
      setError('Failed to load facilities.');
    } finally {
      setIsFacilitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const handleFacilitySelect = async (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setSelectedSpaceId('');
    setSpaces([]);

    if (!facilityId) return;

    setIsSpacesLoading(true);
    try {
      const facility = await api.getFacility(facilityId);
      setSpaces(facility.spaces ?? []);
    } catch {
      setError('Failed to load spaces for this facility.');
    } finally {
      setIsSpacesLoading(false);
    }
  };

  const validate = (): string | null => {
    if (!sport) return 'Please select a sport.';
    if (!skillLevel) return 'Please select a skill level.';
    if (!scheduledAt) return 'Please enter a date and time.';
    if (!playerLimit || parseInt(playerLimit, 10) < 2)
      return 'Player limit must be at least 2.';
    if (!gameType) return 'Please select a game type.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.createGame({
        league_id: '',
        team1_id: '',
        team2_id: '',
        facility_id: selectedFacilityId || undefined,
        space_id: selectedSpaceId || undefined,
        scheduled_at: scheduledAt,
        game_type: gameType === 'open_play' ? 'friendly' : gameType,
      });
      Alert.alert('Success', 'Game created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create game.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderChip = (
    selected: boolean,
    label: string,
    onPress: () => void,
    icon?: string
  ) => (
    <TouchableOpacity
      key={label}
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon ? <Text style={styles.chipIcon}>{icon}</Text> : null}
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')}>
            <Text style={styles.errorDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Sport Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sport</Text>
        <View style={styles.chipRow}>
          {SPORTS.map((s) =>
            renderChip(sport === s.key, s.label, () => setSport(s.key), s.icon)
          )}
        </View>
      </View>

      {/* Skill Level */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skill Level</Text>
        <View style={styles.chipRow}>
          {SKILL_LEVELS.map((s) =>
            renderChip(skillLevel === s.key, s.label, () =>
              setSkillLevel(s.key)
            )
          )}
        </View>
      </View>

      {/* Facility & Space */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Facility</Text>
        {isFacilitiesLoading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.inlineLoader}
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {facilities.map((f) =>
              renderChip(
                selectedFacilityId === f.id,
                f.name,
                () => handleFacilitySelect(f.id),
                '🏟️'
              )
            )}
            {facilities.length === 0 && (
              <Text style={styles.emptyHint}>No facilities available</Text>
            )}
          </ScrollView>
        )}

        {selectedFacilityId ? (
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Space</Text>
            {isSpacesLoading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={styles.inlineLoader}
              />
            ) : (
              <View style={styles.chipRow}>
                {spaces.map((s) =>
                  renderChip(selectedSpaceId === s.id, s.name, () =>
                    setSelectedSpaceId(s.id)
                  )
                )}
                {spaces.length === 0 && (
                  <Text style={styles.emptyHint}>No spaces available</Text>
                )}
              </View>
            )}
          </View>
        ) : null}
      </View>

      {/* Date / Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date & Time</Text>
        <TextInput
          style={styles.textInput}
          placeholder="YYYY-MM-DDTHH:mm:ss"
          placeholderTextColor={COLORS.disabled}
          value={scheduledAt}
          onChangeText={setScheduledAt}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Player Limit */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Player Limit</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 10"
          placeholderTextColor={COLORS.disabled}
          value={playerLimit}
          onChangeText={setPlayerLimit}
          keyboardType="number-pad"
        />
      </View>

      {/* Game Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Type</Text>
        <View style={styles.chipRow}>
          {GAME_TYPES.map((g) =>
            renderChip(gameType === g.key, g.label, () => setGameType(g.key))
          )}
        </View>
      </View>

      {/* Referee Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <Text style={styles.sectionTitle}>Referee Required</Text>
          <Switch
            value={isRefereeRequired}
            onValueChange={setIsRefereeRequired}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={isRefereeRequired ? COLORS.primary : COLORS.disabled}
          />
        </View>
      </View>

      {/* Public / Private Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <Text style={styles.sectionTitle}>Public Game</Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={isPublic ? COLORS.primary : COLORS.disabled}
          />
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={COLORS.textLight} />
        ) : (
          <Text style={styles.submitButtonText}>Create Game</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
  },
  errorDismiss: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    paddingLeft: SPACING.sm,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subSection: {
    marginTop: SPACING.md,
  },
  subSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  chipLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  chipLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  inlineLoader: {
    marginVertical: SPACING.sm,
  },
  emptyHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.disabled,
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});
