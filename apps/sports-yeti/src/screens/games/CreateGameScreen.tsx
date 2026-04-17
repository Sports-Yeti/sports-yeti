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
import type { Facility, League, Space, Team } from '../../types';

interface CreateGameScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

type GameMode = 'open_play' | 'league';

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

const LEAGUE_GAME_TYPES = [
  { key: 'regular', label: 'Regular' },
  { key: 'playoff', label: 'Playoff' },
];

export function CreateGameScreen({ navigation }: CreateGameScreenProps) {
  const [gameMode, setGameMode] = useState<GameMode>('open_play');
  const [sport, setSport] = useState('');
  const [skillLevel, setSkillLevel] = useState('');

  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [leagueGameType, setLeagueGameType] = useState('regular');

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [playerLimit, setPlayerLimit] = useState('');
  const [isRefereeRequired, setIsRefereeRequired] = useState(false);

  const [isFacilitiesLoading, setIsFacilitiesLoading] = useState(false);
  const [isLeaguesLoading, setIsLeaguesLoading] = useState(false);
  const [isTeamsLoading, setIsTeamsLoading] = useState(false);
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

  const loadLeagues = useCallback(async () => {
    setIsLeaguesLoading(true);
    try {
      const response = await api.getLeagues({ per_page: 50 });
      setLeagues(response.data);
    } catch {
      setError('Failed to load leagues.');
    } finally {
      setIsLeaguesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    if (gameMode === 'league' && leagues.length === 0) {
      loadLeagues();
    }
  }, [gameMode, leagues.length, loadLeagues]);

  const handleLeagueSelect = async (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    setTeam1Id('');
    setTeam2Id('');
    setTeams([]);

    if (!leagueId) return;

    setIsTeamsLoading(true);
    try {
      const response = await api.getTeams({ league_id: leagueId, per_page: 50 });
      setTeams(response.data);
    } catch {
      setError('Failed to load teams for this league.');
    } finally {
      setIsTeamsLoading(false);
    }
  };

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
    if (!scheduledAt) return 'Please enter a date and time.';
    if (gameMode === 'open_play') {
      if (!playerLimit || parseInt(playerLimit, 10) < 2)
        return 'Max players must be at least 2.';
      return null;
    }
    if (!selectedLeagueId) return 'Please select a league.';
    if (!team1Id) return 'Please select Team 1.';
    if (!team2Id) return 'Please select Team 2.';
    if (team1Id === team2Id) return 'Team 1 and Team 2 must be different.';
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
      const payload =
        gameMode === 'open_play'
          ? {
              facility_id: selectedFacilityId || undefined,
              space_id: selectedSpaceId || undefined,
              scheduled_at: scheduledAt,
              game_type: 'friendly',
              max_players: parseInt(playerLimit, 10),
              referee_required: isRefereeRequired,
              is_open_play: true,
            }
          : {
              league_id: selectedLeagueId,
              team1_id: team1Id,
              team2_id: team2Id,
              facility_id: selectedFacilityId || undefined,
              space_id: selectedSpaceId || undefined,
              scheduled_at: scheduledAt,
              game_type: leagueGameType,
              referee_required: isRefereeRequired,
              is_open_play: false,
            };

      const game = await api.createGame(payload);

      Alert.alert('Success', 'Game created successfully!', [
        {
          text: 'View Game',
          onPress: () => {
            navigation.goBack();
            navigation.navigate('GameDetails', { id: game.id });
          },
        },
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
    icon?: string,
    key?: string
  ) => (
    <TouchableOpacity
      key={key ?? label}
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Type</Text>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              gameMode === 'open_play' && styles.modeButtonActive,
            ]}
            onPress={() => setGameMode('open_play')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeButtonText,
                gameMode === 'open_play' && styles.modeButtonTextActive,
              ]}
            >
              Open Play
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              gameMode === 'league' && styles.modeButtonActive,
            ]}
            onPress={() => setGameMode('league')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeButtonText,
                gameMode === 'league' && styles.modeButtonTextActive,
              ]}
            >
              League Game
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sport</Text>
        <View style={styles.chipRow}>
          {SPORTS.map((s) =>
            renderChip(sport === s.key, s.label, () => setSport(s.key), s.icon, s.key)
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skill Level</Text>
        <View style={styles.chipRow}>
          {SKILL_LEVELS.map((s) =>
            renderChip(skillLevel === s.key, s.label, () => setSkillLevel(s.key), undefined, s.key)
          )}
        </View>
      </View>

      {gameMode === 'league' ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>League</Text>
            {isLeaguesLoading ? (
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
                {leagues.map((l) =>
                  renderChip(
                    selectedLeagueId === l.id,
                    l.name,
                    () => handleLeagueSelect(l.id),
                    '🏆',
                    l.id
                  )
                )}
                {leagues.length === 0 && (
                  <Text style={styles.emptyHint}>No leagues available</Text>
                )}
              </ScrollView>
            )}
          </View>

          {selectedLeagueId ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Teams</Text>
              {isTeamsLoading ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  style={styles.inlineLoader}
                />
              ) : (
                <>
                  <Text style={styles.subSectionTitle}>Team 1</Text>
                  <View style={styles.chipRow}>
                    {teams.map((t) =>
                      renderChip(
                        team1Id === t.id,
                        t.name,
                        () => setTeam1Id(t.id),
                        undefined,
                        `t1-${t.id}`
                      )
                    )}
                    {teams.length === 0 && (
                      <Text style={styles.emptyHint}>No teams in this league</Text>
                    )}
                  </View>
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>Team 2</Text>
                    <View style={styles.chipRow}>
                      {teams
                        .filter((t) => t.id !== team1Id)
                        .map((t) =>
                          renderChip(
                            team2Id === t.id,
                            t.name,
                            () => setTeam2Id(t.id),
                            undefined,
                            `t2-${t.id}`
                          )
                        )}
                    </View>
                  </View>
                </>
              )}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match Type</Text>
            <View style={styles.chipRow}>
              {LEAGUE_GAME_TYPES.map((g) =>
                renderChip(
                  leagueGameType === g.key,
                  g.label,
                  () => setLeagueGameType(g.key),
                  undefined,
                  g.key
                )
              )}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Max Players</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 10"
            placeholderTextColor={COLORS.disabled}
            value={playerLimit}
            onChangeText={setPlayerLimit}
            keyboardType="number-pad"
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Facility (optional)</Text>
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
                '🏟️',
                f.id
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
                  renderChip(
                    selectedSpaceId === s.id,
                    s.name,
                    () => setSelectedSpaceId(s.id),
                    undefined,
                    s.id
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeButtonTextActive: {
    color: COLORS.textLight,
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
