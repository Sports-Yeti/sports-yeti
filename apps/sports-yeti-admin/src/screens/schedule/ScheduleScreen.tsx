import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Game, League, Team, Facility } from '../../types';

type ViewMode = 'list' | 'week';

const GAME_TYPE_COLORS: Record<string, string> = {
  regular: COLORS.primary,
  playoff: COLORS.warning,
  championship: COLORS.error,
  friendly: COLORS.success,
  scrimmage: COLORS.textMuted,
};

const GAME_TYPES = ['regular', 'playoff', 'friendly'] as const;

function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function toLocalDateTimeInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface GameCardProps {
  game: Game;
  onEnterResult: () => void;
}

function GameCard({ game, onEnterResult }: GameCardProps) {
  const typeColor = GAME_TYPE_COLORS[game.game_type] || COLORS.textMuted;
  const statusColors: Record<string, string> = {
    scheduled: COLORS.primary,
    in_progress: COLORS.warning,
    completed: COLORS.success,
    cancelled: COLORS.error,
    postponed: COLORS.textMuted,
  };
  const statusColor = statusColors[game.status] || COLORS.textMuted;
  const canEnterResult = game.status === 'scheduled' || game.status === 'in_progress';

  return (
    <View style={styles.gameCard}>
      <View style={styles.gameCardTop}>
        <View style={styles.gameTeams}>
          <Text style={styles.teamName}>{game.team1?.name ?? 'TBD'}</Text>
          <Text style={styles.vsText}>vs</Text>
          <Text style={styles.teamName}>{game.team2?.name ?? 'TBD'}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
          <Text style={[styles.typeBadgeText, { color: typeColor }]}>{game.game_type}</Text>
        </View>
      </View>

      <View style={styles.gameCardMeta}>
        <Text style={styles.gameTime}>
          {new Date(game.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.gameFacility}>{game.facility?.name ?? 'No Facility'}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.gameStatus, { color: statusColor }]}>{game.status}</Text>
      </View>

      {game.team1_score !== null && game.team2_score !== null && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>{game.team1_score} - {game.team2_score}</Text>
        </View>
      )}

      {canEnterResult && (
        <View style={styles.gameActions}>
          <TouchableOpacity style={styles.resultButton} onPress={onEnterResult}>
            <Text style={styles.resultButtonText}>Enter Result</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

interface CreateGameModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  leagues: League[];
  defaultLeagueId?: string;
}

function CreateGameModal({ visible, onClose, onCreated, leagues, defaultLeagueId }: CreateGameModalProps) {
  const [leagueId, setLeagueId] = useState<string>(defaultLeagueId ?? '');
  const [team1Id, setTeam1Id] = useState<string>('');
  const [team2Id, setTeam2Id] = useState<string>('');
  const [facilityId, setFacilityId] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toLocalDateTimeInputValue(d);
  });
  const [gameType, setGameType] = useState<string>('regular');
  const [seasonNumber, setSeasonNumber] = useState<string>('');
  const [weekNumber, setWeekNumber] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setLeagueId(defaultLeagueId ?? '');
      setTeam1Id('');
      setTeam2Id('');
      setFacilityId('');
      setGameType('regular');
      setSeasonNumber('');
      setWeekNumber('');
      setErrorMsg(null);
    }
  }, [visible, defaultLeagueId]);

  const { data: teamsData } = useQuery({
    queryKey: ['teams-for-league', leagueId],
    queryFn: () => api.getTeams({ league_id: leagueId, per_page: 100 }),
    enabled: visible && !!leagueId,
  });
  const teams: Team[] = teamsData?.data ?? [];

  const { data: facilitiesData } = useQuery({
    queryKey: ['facilities-all'],
    queryFn: () => api.getFacilities({ per_page: 100 }),
    enabled: visible,
  });
  const facilities: Facility[] = facilitiesData?.data ?? [];

  const handleSave = async () => {
    setErrorMsg(null);
    if (!leagueId) return setErrorMsg('League is required');
    if (!team1Id) return setErrorMsg('Team 1 is required');
    if (!team2Id) return setErrorMsg('Team 2 is required');
    if (team1Id === team2Id) return setErrorMsg('Team 1 and Team 2 must differ');
    if (!scheduledAt) return setErrorMsg('Scheduled date/time is required');

    setIsSaving(true);
    try {
      await api.createGame({
        league_id: leagueId,
        team1_id: team1Id,
        team2_id: team2Id,
        facility_id: facilityId || undefined,
        scheduled_at: new Date(scheduledAt).toISOString(),
        game_type: gameType,
        season_number: seasonNumber ? Number(seasonNumber) : undefined,
        week_number: weekNumber ? Number(weekNumber) : undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(e.response?.data?.detail ?? 'Failed to create game');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modal}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>New Game</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={modalStyles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.body} contentContainerStyle={modalStyles.bodyContent}>
            <Text style={modalStyles.label}>League *</Text>
            <View style={modalStyles.selectGrid}>
              {leagues.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  style={[modalStyles.selectChip, leagueId === l.id && modalStyles.selectChipActive]}
                  onPress={() => { setLeagueId(l.id); setTeam1Id(''); setTeam2Id(''); }}
                >
                  <Text style={[modalStyles.selectChipText, leagueId === l.id && modalStyles.selectChipTextActive]}>{l.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={modalStyles.label}>Team 1 *</Text>
            <View style={modalStyles.selectGrid}>
              {!leagueId ? (
                <Text style={modalStyles.hint}>Select a league first</Text>
              ) : teams.length === 0 ? (
                <Text style={modalStyles.hint}>No approved teams in this league</Text>
              ) : (
                teams.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[modalStyles.selectChip, team1Id === t.id && modalStyles.selectChipActive]}
                    onPress={() => setTeam1Id(t.id)}
                  >
                    <Text style={[modalStyles.selectChipText, team1Id === t.id && modalStyles.selectChipTextActive]}>{t.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <Text style={modalStyles.label}>Team 2 *</Text>
            <View style={modalStyles.selectGrid}>
              {!leagueId ? (
                <Text style={modalStyles.hint}>Select a league first</Text>
              ) : teams.length === 0 ? (
                <Text style={modalStyles.hint}>No approved teams in this league</Text>
              ) : (
                teams
                  .filter((t) => t.id !== team1Id)
                  .map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[modalStyles.selectChip, team2Id === t.id && modalStyles.selectChipActive]}
                      onPress={() => setTeam2Id(t.id)}
                    >
                      <Text style={[modalStyles.selectChipText, team2Id === t.id && modalStyles.selectChipTextActive]}>{t.name}</Text>
                    </TouchableOpacity>
                  ))
              )}
            </View>

            <Text style={modalStyles.label}>Facility</Text>
            <View style={modalStyles.selectGrid}>
              <TouchableOpacity
                style={[modalStyles.selectChip, !facilityId && modalStyles.selectChipActive]}
                onPress={() => setFacilityId('')}
              >
                <Text style={[modalStyles.selectChipText, !facilityId && modalStyles.selectChipTextActive]}>None</Text>
              </TouchableOpacity>
              {facilities.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[modalStyles.selectChip, facilityId === f.id && modalStyles.selectChipActive]}
                  onPress={() => setFacilityId(f.id)}
                >
                  <Text style={[modalStyles.selectChipText, facilityId === f.id && modalStyles.selectChipTextActive]}>{f.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={modalStyles.label}>Scheduled Date / Time *</Text>
            <TextInput
              style={modalStyles.input}
              value={scheduledAt}
              onChangeText={setScheduledAt}
              // @ts-expect-error web-only HTMLInput attribute
              type="datetime-local"
              placeholder="YYYY-MM-DDTHH:mm"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={modalStyles.label}>Game Type</Text>
            <View style={modalStyles.selectGrid}>
              {GAME_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[modalStyles.selectChip, gameType === t && modalStyles.selectChipActive]}
                  onPress={() => setGameType(t)}
                >
                  <Text style={[modalStyles.selectChipText, gameType === t && modalStyles.selectChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={modalStyles.row}>
              <View style={modalStyles.col}>
                <Text style={modalStyles.label}>Season #</Text>
                <TextInput
                  style={modalStyles.input}
                  value={seasonNumber}
                  onChangeText={setSeasonNumber}
                  keyboardType="numeric"
                  placeholder="Optional"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <View style={modalStyles.col}>
                <Text style={modalStyles.label}>Week #</Text>
                <TextInput
                  style={modalStyles.input}
                  value={weekNumber}
                  onChangeText={setWeekNumber}
                  keyboardType="numeric"
                  placeholder="Optional"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            {errorMsg && <Text style={modalStyles.errorText}>{errorMsg}</Text>}
          </ScrollView>

          <View style={modalStyles.footer}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} disabled={isSaving}>
              <Text style={modalStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.saveBtn, isSaving && modalStyles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.textLight} />
              ) : (
                <Text style={modalStyles.saveBtnText}>Create Game</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface EnterResultModalProps {
  visible: boolean;
  game: Game | null;
  onClose: () => void;
  onSaved: () => void;
}

function EnterResultModal({ visible, game, onClose, onSaved }: EnterResultModalProps) {
  const [team1Score, setTeam1Score] = useState<string>('');
  const [team2Score, setTeam2Score] = useState<string>('');
  const [markCompleted, setMarkCompleted] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible && game) {
      setTeam1Score(game.team1_score !== null ? String(game.team1_score) : '');
      setTeam2Score(game.team2_score !== null ? String(game.team2_score) : '');
      setMarkCompleted(true);
      setErrorMsg(null);
    }
  }, [visible, game]);

  if (!game) return null;

  const handleSave = async () => {
    setErrorMsg(null);
    const t1 = Number(team1Score);
    const t2 = Number(team2Score);
    if (Number.isNaN(t1) || Number.isNaN(t2)) {
      setErrorMsg('Both scores must be numbers');
      return;
    }
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        team1_score: t1,
        team2_score: t2,
      };
      if (markCompleted) payload.status = 'completed';
      await api.updateGame(game.id, payload);
      onSaved();
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(e.response?.data?.detail ?? 'Failed to save result');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.modal, modalStyles.modalSmall]}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Enter Result</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={modalStyles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.body} contentContainerStyle={modalStyles.bodyContent}>
            <Text style={modalStyles.matchupText}>
              {game.team1?.name ?? 'Team 1'} vs {game.team2?.name ?? 'Team 2'}
            </Text>

            <View style={modalStyles.row}>
              <View style={modalStyles.col}>
                <Text style={modalStyles.label}>{game.team1?.name ?? 'Team 1'} Score</Text>
                <TextInput
                  style={modalStyles.input}
                  value={team1Score}
                  onChangeText={setTeam1Score}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <View style={modalStyles.col}>
                <Text style={modalStyles.label}>{game.team2?.name ?? 'Team 2'} Score</Text>
                <TextInput
                  style={modalStyles.input}
                  value={team2Score}
                  onChangeText={setTeam2Score}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={modalStyles.toggleRow}>
              <Text style={modalStyles.label}>Mark as Completed</Text>
              <Switch
                value={markCompleted}
                onValueChange={setMarkCompleted}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                thumbColor={markCompleted ? COLORS.primary : COLORS.textMuted}
              />
            </View>

            {errorMsg && <Text style={modalStyles.errorText}>{errorMsg}</Text>}
          </ScrollView>

          <View style={modalStyles.footer}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} disabled={isSaving}>
              <Text style={modalStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.saveBtn, isSaving && modalStyles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.textLight} />
              ) : (
                <Text style={modalStyles.saveBtnText}>Save Result</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ScheduleScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [resultGame, setResultGame] = useState<Game | null>(null);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);

  const { data: leaguesData } = useQuery({
    queryKey: ['leagues', { per_page: 100 }],
    queryFn: () => api.getLeagues({ per_page: 100 }),
  });
  const leagues = leaguesData?.data ?? [];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['games', { league_id: selectedLeague, status: statusFilter }],
    queryFn: async () => {
      const params: Record<string, unknown> = { per_page: 100 };
      if (selectedLeague) params.league_id = selectedLeague;
      if (statusFilter) params.status = statusFilter;
      return api.getGames(params);
    },
  });

  const games = data?.data ?? [];

  const gamesByDate = useMemo(() => {
    const grouped: Record<string, Game[]> = {};
    for (const game of games) {
      const key = game.scheduled_at.split('T')[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(game);
    }
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    }
    return grouped;
  }, [games]);

  const sortedDateKeys = useMemo(() =>
    Object.keys(gamesByDate).sort(), [gamesByDate]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePublishSchedule = async () => {
    if (!selectedLeague) {
      alert('Please select a league before publishing.');
      return;
    }
    setIsPublishing(true);
    try {
      const result = await api.publishSchedule({ league_id: selectedLeague });
      alert(`Published ${result.published_count} game(s).`);
      refetch();
    } catch {
      alert('Failed to publish schedule');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImportCSV = () => {
    if (!selectedLeague) {
      alert('Please select a league before importing.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsImporting(true);
      try {
        const result = await api.importGames(file, selectedLeague);
        alert(`Imported ${result.imported} games.${result.errors.length > 0 ? `\nErrors: ${result.errors.join(', ')}` : ''}`);
        refetch();
      } catch {
        alert('Failed to import games');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'];
  const importDisabled = isImporting || !selectedLeague;
  const publishDisabled = isPublishing || !selectedLeague;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>Manage games and schedules</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setCreateOpen(true)}
          >
            <Text style={styles.createButtonText}>+ New Game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.publishButton, publishDisabled && styles.buttonDisabled]}
            onPress={handlePublishSchedule}
            disabled={publishDisabled}
          >
            {isPublishing ? (
              <ActivityIndicator size="small" color={COLORS.textLight} />
            ) : (
              <Text style={styles.publishButtonText}>Publish Schedule</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.importButton, importDisabled && styles.buttonDisabled]}
            onPress={handleImportCSV}
            disabled={importDisabled}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color={COLORS.text} />
            ) : (
              <Text style={styles.importButtonText}>Import CSV</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {!selectedLeague && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Select a league below to enable Import CSV, Publish Schedule, and create new games.
          </Text>
        </View>
      )}

      <View style={styles.filtersContainer}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Week</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedLeague && styles.filterChipActive]}
            onPress={() => setSelectedLeague('')}
          >
            <Text style={[styles.filterChipText, !selectedLeague && styles.filterChipTextActive]}>All Leagues</Text>
          </TouchableOpacity>
          {leagues.map((league: League) => (
            <TouchableOpacity
              key={league.id}
              style={[styles.filterChip, selectedLeague === league.id && styles.filterChipActive]}
              onPress={() => setSelectedLeague(selectedLeague === league.id ? '' : league.id)}
            >
              <Text style={[styles.filterChipText, selectedLeague === league.id && styles.filterChipTextActive]}>
                {league.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !statusFilter && styles.filterChipActive]}
            onPress={() => setStatusFilter('')}
          >
            <Text style={[styles.filterChipText, !statusFilter && styles.filterChipTextActive]}>All Status</Text>
          </TouchableOpacity>
          {statuses.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
              onPress={() => setStatusFilter(statusFilter === s ? '' : s)}
            >
              <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>
                {s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load games</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {viewMode === 'week' ? (
            <View>
              <View style={styles.weekNav}>
                <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
                  <Text style={styles.weekNavButton}>← Prev</Text>
                </TouchableOpacity>
                <Text style={styles.weekNavTitle}>
                  {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                  {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
                  <Text style={styles.weekNavButton}>Next →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weekGrid}>
                {weekDates.map((date) => {
                  const key = formatDateKey(date);
                  const dayGames = gamesByDate[key] ?? [];
                  const isToday = formatDateKey(new Date()) === key;
                  return (
                    <View key={key} style={[styles.dayColumn, isToday && styles.dayColumnToday]}>
                      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>
                        {date.getDate()}
                      </Text>
                      {dayGames.length === 0 ? (
                        <Text style={styles.noGames}>—</Text>
                      ) : (
                        dayGames.map((game) => (
                          <GameCard key={game.id} game={game} onEnterResult={() => setResultGame(game)} />
                        ))
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <>
              {games.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📅</Text>
                  <Text style={styles.emptyTitle}>No games found</Text>
                  <Text style={styles.emptyText}>Adjust your filters or import a schedule</Text>
                </View>
              ) : (
                sortedDateKeys.map((dateKey) => (
                  <View key={dateKey} style={styles.dateGroup}>
                    <Text style={styles.dateGroupTitle}>
                      {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </Text>
                    {gamesByDate[dateKey].map((game) => (
                      <GameCard key={game.id} game={game} onEnterResult={() => setResultGame(game)} />
                    ))}
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      )}

      <CreateGameModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => refetch()}
        leagues={leagues}
        defaultLeagueId={selectedLeague || undefined}
      />

      <EnterResultModal
        visible={!!resultGame}
        game={resultGame}
        onClose={() => setResultGame(null)}
        onSaved={() => refetch()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  headerActions: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  createButton: {
    backgroundColor: COLORS.primaryDark, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  createButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
  publishButton: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg,
    borderRadius: 8, minWidth: 140, alignItems: 'center', justifyContent: 'center',
  },
  publishButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
  importButton: {
    backgroundColor: COLORS.surface, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
    minWidth: 120, alignItems: 'center', justifyContent: 'center',
  },
  importButtonText: { color: COLORS.text, fontSize: FONT_SIZES.md, fontWeight: '600' },
  buttonDisabled: { opacity: 0.5 },
  notice: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    padding: SPACING.md, borderRadius: 8,
    backgroundColor: COLORS.warning + '15', borderWidth: 1, borderColor: COLORS.warning + '40',
  },
  noticeText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  filtersContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.sm },
  viewToggle: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, alignSelf: 'flex-start',
  },
  toggleButton: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  toggleButtonActive: { backgroundColor: COLORS.primary, borderRadius: 7 },
  toggleText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.textLight },
  filterScroll: { flexGrow: 0 },
  filterChip: {
    backgroundColor: COLORS.surface, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 20, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: COLORS.textLight },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: { fontSize: FONT_SIZES.md, color: COLORS.error, marginBottom: SPACING.md },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: 8 },
  retryButtonText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
  listContainer: { flex: 1, paddingHorizontal: SPACING.lg },
  weekNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.md, marginBottom: SPACING.md,
  },
  weekNavButton: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600' },
  weekNavTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  weekGrid: { flexDirection: 'row', gap: SPACING.sm },
  dayColumn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, padding: SPACING.sm,
    minHeight: 200, borderWidth: 1, borderColor: COLORS.border,
  },
  dayColumnToday: { borderColor: COLORS.primary, borderWidth: 2 },
  dayLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '500' },
  dayLabelToday: { color: COLORS.primary },
  dayDate: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  dayDateToday: { color: COLORS.primary },
  noGames: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md },
  dateGroup: { marginBottom: SPACING.lg },
  dateGroupTitle: {
    fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text,
    marginBottom: SPACING.sm, paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  gameCard: {
    backgroundColor: COLORS.surface, borderRadius: 8, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  gameCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  gameTeams: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.sm },
  teamName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  vsText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  typeBadge: { paddingVertical: 2, paddingHorizontal: SPACING.sm, borderRadius: 4 },
  typeBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  gameCardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  gameTime: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  gameFacility: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  gameStatus: { fontSize: FONT_SIZES.xs, fontWeight: '500', textTransform: 'capitalize' },
  scoreRow: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  scoreText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  gameActions: { marginTop: SPACING.sm, flexDirection: 'row', gap: SPACING.sm },
  resultButton: {
    backgroundColor: COLORS.primaryLight, paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md, borderRadius: 6,
  },
  resultButtonText: { color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl * 2 },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 300 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center', alignItems: 'center', padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    width: '100%', maxWidth: 640, maxHeight: '90%',
    overflow: 'hidden',
  },
  modalSmall: { maxWidth: 480 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  close: { fontSize: FONT_SIZES.lg, color: COLORS.textMuted, paddingHorizontal: SPACING.sm },
  body: { maxHeight: 480 },
  bodyContent: { padding: SPACING.lg, gap: SPACING.sm },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginTop: SPACING.sm, marginBottom: SPACING.xs },
  hint: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, paddingVertical: SPACING.sm },
  selectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  selectChip: {
    backgroundColor: COLORS.background, borderRadius: 16,
    paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  selectChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  selectChipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, textTransform: 'capitalize' },
  selectChipTextActive: { color: COLORS.textLight, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md, color: COLORS.text,
  },
  row: { flexDirection: 'row', gap: SPACING.md },
  col: { flex: 1 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.md, paddingVertical: SPACING.sm,
  },
  matchupText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.sm, marginTop: SPACING.sm },
  footer: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm,
    padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  cancelBtn: {
    paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.text, fontSize: FONT_SIZES.md, fontWeight: '600' },
  saveBtn: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg, borderRadius: 8, minWidth: 140,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.textLight, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
