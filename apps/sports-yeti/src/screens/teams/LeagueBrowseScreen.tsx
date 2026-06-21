import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Search,
  Share2,
  Trophy,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Input,
  SearchBar,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  CAPTAIN_OF_TEAMS,
  OPEN_LEAGUES,
  TEAM_DETAILS,
  type OpenLeague,
  type TeamDetail,
} from '../../mocks/teams';
import { formatCurrency } from '../../lib/format';
import { useTeamChat } from '../../features/team-chat-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'LeagueBrowse'>;

const SPORT_FILTERS = [
  { key: 'all', label: 'All sports' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'volleyball', label: 'Volleyball' },
  { key: 'hockey', label: 'Hockey' },
];

function LeagueCard({
  league,
  onApply,
  primaryLabel,
  onShare,
}: {
  league: OpenLeague;
  onApply: () => void;
  primaryLabel: string;
  onShare?: () => void;
}) {
  const Icon = league.Icon;
  const spotsLeft = league.maxTeams - league.registeredTeams;
  return (
    <Card style={styles.card}>
      <View style={styles.cardHead}>
        <IconBadge size={48} tone="brand">
          <Icon size={22} color={colors.brand.deep} strokeWidth={2.25} />
        </IconBadge>
        <View style={styles.cardHeadBody}>
          <Text variant="h3" color={colors.text.primary}>
            {league.name}
          </Text>
          <Text variant="bodySm" color={colors.text.secondary}>
            {league.sport} · {league.city}
          </Text>
        </View>
        {onShare ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Share ${league.name} to team chat`}
            accessibilityHint="Posts this league as a card in the chat you came from"
            hitSlop={8}
            onPress={onShare}
            style={({ pressed }) => [
              styles.shareBtn,
              pressed ? styles.shareBtnPressed : null,
            ]}
          >
            <Share2 size={18} color={colors.brand.primary} strokeWidth={2.25} />
          </Pressable>
        ) : null}
      </View>

      <Text variant="body" color={colors.text.primary}>
        {league.description}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text variant="caption" color={colors.text.secondary}>
            STARTS
          </Text>
          <Text variant="button" color={colors.text.primary}>
            {league.startDate.replace('Starts ', '')}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text variant="caption" color={colors.text.secondary}>
            REGISTRATION
          </Text>
          <Text variant="button" color={colors.text.primary}>
            {league.registrationCloses.replace('Closes ', '')}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text variant="caption" color={colors.text.secondary}>
            FEE
          </Text>
          <Text variant="button" color={colors.brand.primary}>
            {league.feeCents === 0 ? 'Free' : formatCurrency(league.feeCents)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Tag
          tone={league.spotsTone}
          leadingDot
          size="sm"
          label={`${spotsLeft} of ${league.maxTeams} team spots left`}
        />
        <Button
          label={primaryLabel}
          variant="gradient"
          size="sm"
          onPress={onApply}
        />
      </View>
    </Card>
  );
}

function CaptainTeamPickerRow({
  team,
  selected,
  onPress,
}: {
  team: TeamDetail;
  selected: boolean;
  onPress: () => void;
}) {
  const Icon = team.Icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Use ${team.name} for this registration`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.teamRow,
        selected ? styles.teamRowSelected : null,
        pressed ? styles.teamRowPressed : null,
      ]}
    >
      <View style={styles.teamRowIcon}>
        <Icon size={18} color={colors.brand.primary} strokeWidth={2.25} />
      </View>
      <View style={styles.teamRowBody}>
        <Text variant="button" color={colors.text.primary}>
          {team.name}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {team.sport} · {team.roster.length}/{team.rosterMax} on roster
        </Text>
      </View>
      {selected ? (
        <View style={styles.selectedBadge}>
          <Crown size={12} color={colors.text.inverse} strokeWidth={3} />
        </View>
      ) : null}
    </Pressable>
  );
}

export function LeagueBrowseScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const isCaptainMode = route.params?.mode === 'captain';
  const fromChatId = route.params?.fromChatId;
  const postCard = useTeamChat((s) => s.postCard);
  const requestRegistration = useTeamChat((s) => s.requestRegistration);
  const initialTeam = route.params?.teamId
    ? TEAM_DETAILS[route.params.teamId]
    : CAPTAIN_OF_TEAMS[0];

  const [sport, setSport] = useState('all');
  const [search, setSearch] = useState('');
  const [pendingLeague, setPendingLeague] = useState<OpenLeague | null>(null);
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);
  const [chosenTeamId, setChosenTeamId] = useState<string | undefined>(
    initialTeam?.id,
  );
  const [teamName, setTeamName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const chosenTeam = chosenTeamId ? TEAM_DETAILS[chosenTeamId] : undefined;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return OPEN_LEAGUES.filter((l) => {
      if (sport !== 'all' && l.sportKey !== sport) return false;
      if (q) {
        const hay = `${l.name} ${l.sport} ${l.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sport, search]);

  const teamNameError =
    !isCaptainMode && teamName.length > 0 && teamName.trim().length < 3
      ? 'Team name must be at least 3 characters.'
      : undefined;

  const canSubmit = isCaptainMode
    ? !!pendingLeague && !!chosenTeam
    : !!pendingLeague && teamName.trim().length >= 3;

  const perPlayerEstimate =
    pendingLeague && chosenTeam && chosenTeam.roster.length > 0
      ? Math.round(pendingLeague.feeCents / chosenTeam.roster.length)
      : 0;

  const openLeagueRegister = (league: OpenLeague) => {
    setPendingLeague(league);
    if (!isCaptainMode) setTeamName('');
  };

  const handleShareToChat = (league: OpenLeague) => {
    if (!fromChatId) return;
    Haptics.selectionAsync();
    postCard(
      fromChatId,
      `Take a look at ${league.name} — could be our next league.`,
      {
        kind: 'league_share',
        leagueId: league.id,
        leagueName: league.name,
        sport: league.sport,
        city: league.city,
        startDate: league.startDate,
        registrationCloses: league.registrationCloses,
        feeCents: league.feeCents,
        maxTeams: league.maxTeams,
        registeredTeams: league.registeredTeams,
      },
    );
    toast.show({
      variant: 'success',
      title: `Shared ${league.name}`,
      description: 'Posted to your team chat.',
      action: { label: 'Open chat', onPress: () => navigation.goBack() },
    });
  };

  const handleSubmit = () => {
    if (!pendingLeague || !canSubmit) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const league = pendingLeague;
      const teamLabel = isCaptainMode ? chosenTeam?.name ?? 'Your team' : teamName.trim();
      setPendingLeague(null);
      setTeamName('');
      // Captain registering an existing team → mark it pending in the shared
      // store so its chat is notified and league payments stay locked until
      // the league approves it.
      if (isCaptainMode && chosenTeam) {
        requestRegistration({
          teamId: chosenTeam.id,
          chatId: `chat-${chosenTeam.id}`,
          leagueId: league.id,
          leagueName: league.name,
          teamName: chosenTeam.name,
        });
      }
      toast.show({
        variant: 'success',
        title: isCaptainMode ? `Submitted ${teamLabel}` : 'Application submitted',
        description: isCaptainMode
          ? `${league.name} will review your team. Once approved, players can pay their share.`
          : `${teamLabel} is pending admin review (~24h).`,
        action: chosenTeam
          ? {
              label: 'View team',
              onPress: () =>
                navigation.navigate('TeamDetails', { id: chosenTeam.id }),
            }
          : undefined,
      });
    }, 700);
  };

  const captainTeams = CAPTAIN_OF_TEAMS;

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          {isCaptainMode ? 'Register for a League' : 'Open Leagues'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {isCaptainMode && captainTeams.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose which team you're registering"
          onPress={() => setTeamPickerOpen(true)}
          style={({ pressed }) => [
            styles.captainBanner,
            pressed ? styles.captainBannerPressed : null,
          ]}
        >
          <View style={styles.captainBannerIcon}>
            <Crown size={18} color={colors.text.inverse} strokeWidth={2.5} />
          </View>
          <View style={styles.captainBannerBody}>
            <Text variant="caption" color={colors.text.inverse}>
              REGISTERING AS
            </Text>
            <Text variant="button" color={colors.text.inverse}>
              {chosenTeam?.name ?? 'Pick a team'}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.text.inverse} strokeWidth={2.5} />
        </Pressable>
      ) : null}

      <View style={styles.filterBlock}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by league, sport, or city…"
          onFilterPress={() => undefined}
        />
        <Tabs
          variant="pill"
          scrollable
          items={SPORT_FILTERS}
          value={sport}
          onChange={setSport}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Trophy size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title="No leagues"
            description="Nothing open in this sport yet — we'll notify you when one launches."
            primaryAction={{
              label: 'Notify me',
              onPress: () =>
                toast.show({ variant: 'success', title: "We'll let you know" }),
            }}
          />
        ) : (
          filtered.map((l) => (
            <LeagueCard
              key={l.id}
              league={l}
              primaryLabel={isCaptainMode ? 'Enroll team' : 'Register team'}
              onApply={() => openLeagueRegister(l)}
              onShare={fromChatId ? () => handleShareToChat(l) : undefined}
            />
          ))
        )}
      </ScrollView>

      <BottomSheet
        visible={!!pendingLeague}
        onRequestClose={() => setPendingLeague(null)}
        title={`${isCaptainMode ? 'Enroll in' : 'Register for'} ${pendingLeague?.name ?? ''}`}
        snapPoints={['76%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          {isCaptainMode ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change which team is being registered"
              onPress={() => setTeamPickerOpen(true)}
              style={({ pressed }) => [
                styles.chosenTeamCard,
                pressed ? styles.chosenTeamCardPressed : null,
              ]}
            >
              <View style={styles.chosenTeamLeft}>
                <Text variant="caption" color={colors.text.secondary}>
                  REGISTERING
                </Text>
                <Text variant="button" color={colors.text.primary}>
                  {chosenTeam?.name ?? 'Pick a team'}
                </Text>
                {chosenTeam ? (
                  <Text variant="caption" color={colors.text.muted}>
                    {chosenTeam.sport} · {chosenTeam.roster.length} players
                  </Text>
                ) : null}
              </View>
              <Search size={18} color={colors.brand.primary} strokeWidth={2.25} />
            </Pressable>
          ) : (
            <Input
              label="Team name"
              placeholder="Avalanche FC"
              value={teamName}
              onChangeText={setTeamName}
              maxLength={40}
              error={teamNameError}
            />
          )}

          {pendingLeague ? (
            <Card style={styles.feeCard}>
              <View style={styles.feeRow}>
                <Text variant="body" color={colors.text.secondary}>
                  Registration fee
                </Text>
                <Text variant="button" color={colors.text.primary}>
                  {formatCurrency(pendingLeague.feeCents)}
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text variant="body" color={colors.text.secondary}>
                  Per player ({chosenTeam?.roster.length ?? '—'})
                </Text>
                <Text variant="button" color={colors.brand.primary}>
                  {chosenTeam ? formatCurrency(perPlayerEstimate) : '—'}
                </Text>
              </View>
              <Text variant="caption" color={colors.text.secondary}>
                {isCaptainMode
                  ? "Once the league admin approves, each player will see a Pay button on the team page."
                  : "Estimate. Actual per-player share recalculates from your final roster after admin approves."}
              </Text>
            </Card>
          ) : null}

          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="ghost"
              fullWidth
              onPress={() => setPendingLeague(null)}
              disabled={submitting}
            />
            <Button
              label={submitting ? 'Submitting…' : 'Submit'}
              variant="gradient"
              fullWidth
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
            />
          </View>
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={teamPickerOpen}
        onRequestClose={() => setTeamPickerOpen(false)}
        title="Choose your team"
        snapPoints={['55%']}
      >
        <ScrollView contentContainerStyle={styles.sheetContent}>
          <Text variant="bodySm" color={colors.text.secondary}>
            You captain {captainTeams.length} team{captainTeams.length === 1 ? '' : 's'}.
            Pick the one you're registering.
          </Text>
          {captainTeams.map((team) => (
            <CaptainTeamPickerRow
              key={team.id}
              team={team}
              selected={team.id === chosenTeamId}
              onPress={() => {
                setChosenTeamId(team.id);
                setTeamPickerOpen(false);
              }}
            />
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBlock: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardHeadBody: {
    flex: 1,
    gap: 2,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnPressed: {
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface.bg,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  sheetContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  feeCard: {
    gap: spacing.sm,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  captainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.brand.primary,
    ...shadows.soft,
  },
  captainBannerPressed: {
    opacity: 0.85,
  },
  captainBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captainBannerBody: {
    flex: 1,
    gap: 2,
  },
  chosenTeamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface.bg,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  chosenTeamCardPressed: {
    opacity: 0.7,
  },
  chosenTeamLeft: {
    flex: 1,
    gap: 2,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  teamRowSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.soft,
  },
  teamRowPressed: {
    opacity: 0.85,
  },
  teamRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamRowBody: {
    flex: 1,
    gap: 2,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
