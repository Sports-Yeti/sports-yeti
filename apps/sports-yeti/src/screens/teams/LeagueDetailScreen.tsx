import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Crown,
  MapPin,
  Share2,
  ShieldCheck,
  Trophy,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  CAPTAIN_OF_TEAMS,
  getLeagueDetail,
  type LeagueSeason,
  type LeagueSeasonStanding,
  type TeamDetail,
  type TeamLevel,
} from '../../mocks/teams';
import { formatCurrency } from '../../lib/format';
import { useTeamChat } from '../../features/team-chat-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'LeagueDetails'>;
type Route = RouteProp<RootStackParamList, 'LeagueDetails'>;

const LEVEL_LABEL: Record<TeamLevel, string> = {
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  RECREATIONAL: 'Recreational',
};

export function LeagueDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const league = getLeagueDetail(route.params.leagueId);
  const [seasonId, setSeasonId] = useState(league?.pastSeasons[0]?.id);
  const [registerOpen, setRegisterOpen] = useState(false);
  const requestRegistration = useTeamChat((s) => s.requestRegistration);
  const registrationsByTeam = useTeamChat((s) => s.registrationsByTeam);
  const captainTeams = CAPTAIN_OF_TEAMS;

  if (!league) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="League unavailable"
          description="We couldn't load this league. It may have been archived or the link is stale."
          primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const Icon = league.Icon;
  const org = league.organization;
  const activeSeason =
    league.pastSeasons.find((s) => s.id === seasonId) ?? league.pastSeasons[0];

  const registerTeam = (team: TeamDetail) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRegisterOpen(false);
    requestRegistration({
      teamId: team.id,
      chatId: `chat-${team.id}`,
      leagueId: league.id,
      leagueName: league.name,
      teamName: team.name,
    });
    toast.show({
      variant: 'success',
      title: `Registration sent for ${team.name}`,
      description: `${league.name} is reviewing your entry. Your squad has been notified in chat.`,
    });
    navigation.navigate('Chat', { chatId: `chat-${team.id}`, title: team.name });
  };

  const handleRegisterPress = () => {
    Haptics.selectionAsync();
    if (captainTeams.length === 0) {
      toast.show({
        variant: 'info',
        title: 'Captain a team first',
        description: 'You need a team you captain before you can register for a league.',
      });
      return;
    }
    if (captainTeams.length === 1) {
      registerTeam(captainTeams[0]!);
      return;
    }
    setRegisterOpen(true);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share league"
            hitSlop={8}
            onPress={() => {
              Haptics.selectionAsync();
              toast.show({ variant: 'info', title: 'Share link copied' });
            }}
            style={styles.iconBtn}
          >
            <Share2 size={20} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
        </View>

        <View style={styles.heroBlock}>
          <View style={styles.heroTags}>
            <Tag tone="info" leadingDot label={league.sport} />
            <Tag tone="neutral" size="sm" label={LEVEL_LABEL[league.level]} />
            <Tag tone="brand" size="sm" label={league.format} />
          </View>
          <View style={styles.heroRow}>
            <IconBadge size={64} tone="brand">
              <Icon size={28} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.heroText}>
              <Text variant="h1" color={colors.text.primary}>
                {league.name}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {league.city}
              </Text>
            </View>
            <Text variant="h2" color={colors.brand.primary} align="right">
              {league.feeCents === 0 ? 'Free' : formatCurrency(league.feeCents)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            About the league
          </Text>
          <Text variant="body" color={colors.text.primary}>
            {league.description}
          </Text>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <CalendarDays size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {league.cadence}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {league.seasonLengthLabel}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <MapPin size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {league.city}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {LEVEL_LABEL[league.level]} · {league.format}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <CircleDollarSign size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {league.feeCents === 0 ? 'Free' : `${formatCurrency(league.feeCents)} per team`}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                Entry fee · split across the roster
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Organization
          </Text>
          <Card style={styles.orgCard}>
            <View style={styles.orgHead}>
              <View style={styles.orgIcon}>
                <Building2 size={22} color={colors.brand.deep} strokeWidth={2.25} />
              </View>
              <View style={styles.orgHeadBody}>
                <View style={styles.orgNameRow}>
                  <Text variant="h3" color={colors.text.primary}>
                    {org.name}
                  </Text>
                  {org.verified ? (
                    <ShieldCheck
                      size={16}
                      color={colors.brand.primary}
                      strokeWidth={2.5}
                    />
                  ) : null}
                </View>
                <Text variant="caption" color={colors.text.secondary}>
                  Est. {org.foundedYear} · {org.seasonsRun} seasons run
                </Text>
              </View>
            </View>
            <Text variant="bodySm" color={colors.text.secondary}>
              {org.tagline}
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Past seasons
          </Text>

          {league.pastSeasons.length === 0 || !activeSeason ? (
            <EmptyState
              icon={<Trophy size={28} color={colors.brand.primary} strokeWidth={2.25} />}
              title="No past seasons yet"
              description="This league hasn't completed a season. Standings will appear here once it wraps."
            />
          ) : (
            <>
              {league.pastSeasons.length > 1 ? (
                <Tabs
                  variant="pill"
                  scrollable
                  items={league.pastSeasons.map((s) => ({
                    key: s.id,
                    label: s.name,
                  }))}
                  value={activeSeason.id}
                  onChange={setSeasonId}
                />
              ) : null}
              <SeasonStandings season={activeSeason} />
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Register a team"
          variant="gradient"
          size="lg"
          fullWidth
          leadingIcon={
            <Trophy size={16} color={colors.text.inverse} strokeWidth={2.5} />
          }
          onPress={handleRegisterPress}
        />
      </View>

      <BottomSheet
        visible={registerOpen}
        onRequestClose={() => setRegisterOpen(false)}
        title={`Register for ${league.name}`}
        snapPoints={['55%']}
      >
        <ScrollView contentContainerStyle={styles.pickerSheet}>
          <Text variant="bodySm" color={colors.text.secondary}>
            Choose which of your teams to enter. The league reviews the request and
            your squad gets notified in chat.
          </Text>
          {captainTeams.map((team) => {
            const reg = registrationsByTeam[team.id];
            const TeamIcon = team.Icon;
            return (
              <Pressable
                key={team.id}
                accessibilityRole="button"
                accessibilityLabel={`Register ${team.name} for ${league.name}`}
                onPress={() => registerTeam(team)}
                style={({ pressed }) => [
                  styles.pickerRow,
                  pressed ? styles.pickerRowPressed : null,
                ]}
              >
                <View style={styles.pickerIcon}>
                  <TeamIcon size={18} color={colors.brand.primary} strokeWidth={2.25} />
                </View>
                <View style={styles.pickerBody}>
                  <Text variant="button" color={colors.text.primary}>
                    {team.name}
                  </Text>
                  <Text variant="caption" color={colors.text.secondary}>
                    {team.sport} · {team.roster.length}/{team.rosterMax} on roster
                  </Text>
                </View>
                {reg?.status === 'pending' ? (
                  <Tag tone="warning" size="sm" label="Pending" />
                ) : reg?.status === 'approved' ? (
                  <Tag tone="success" size="sm" label="Enrolled" />
                ) : (
                  <ChevronRight
                    size={18}
                    color={colors.text.secondary}
                    strokeWidth={2.25}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

function SeasonStandings({ season }: { season: LeagueSeason }) {
  return (
    <Card style={styles.standingsCard}>
      <View style={styles.seasonSummary}>
        <Text variant="button" color={colors.text.primary}>
          {season.name}
        </Text>
        <Tag
          tone="warning"
          size="sm"
          label={`${season.teamCount} teams`}
        />
      </View>
      <View style={styles.championRow}>
        <Crown size={16} color={colors.brand.primary} strokeWidth={2.5} />
        <Text variant="caption" color={colors.text.secondary}>
          Champion · {season.champion}
        </Text>
      </View>

      <View style={styles.standingHeader}>
        <Text variant="caption" color={colors.text.muted} style={styles.colRank}>
          #
        </Text>
        <Text variant="caption" color={colors.text.muted} style={styles.colTeam}>
          TEAM
        </Text>
        <Text variant="caption" color={colors.text.muted} style={styles.colRecord}>
          W-L-T
        </Text>
        <Text variant="caption" color={colors.text.muted} style={styles.colPts}>
          PTS
        </Text>
      </View>

      {season.standings.map((row, idx) => (
        <StandingRow
          key={row.abbreviation + row.rank}
          row={row}
          showDivider={idx < season.standings.length - 1}
        />
      ))}
    </Card>
  );
}

function StandingRow({
  row,
  showDivider,
}: {
  row: LeagueSeasonStanding;
  showDivider: boolean;
}) {
  return (
    <View>
      <View
        style={[styles.standingRow, row.isChampion ? styles.standingRowChampion : null]}
      >
        <View
          style={[styles.rankBadge, row.isChampion ? styles.rankBadgeChampion : null]}
        >
          <Text
            variant="caption"
            color={row.isChampion ? colors.text.inverse : colors.text.primary}
          >
            {row.rank}
          </Text>
        </View>
        <View style={styles.teamCell}>
          <View style={styles.teamNameRow}>
            <Text variant="button" color={colors.text.primary} numberOfLines={1}>
              {row.teamName}
            </Text>
            {row.isChampion ? (
              <Crown size={13} color={colors.brand.primary} strokeWidth={2.5} />
            ) : null}
          </View>
          <Text variant="caption" color={colors.text.secondary}>
            {row.abbreviation}
          </Text>
        </View>
        <Text variant="bodySm" color={colors.text.secondary} style={styles.colRecord}>
          {row.wins}-{row.losses}-{row.ties}
        </Text>
        <Text variant="button" color={colors.text.primary} style={styles.colPts}>
          {row.points}
        </Text>
      </View>
      {showDivider ? <View style={styles.standingDivider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heroBlock: {
    gap: spacing.lg,
  },
  heroTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  detailsCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailBody: {
    flex: 1,
    gap: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  orgCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  orgHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orgIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgHeadBody: {
    flex: 1,
    gap: 2,
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  standingsCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  seasonSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  championRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  standingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  colRank: {
    width: 28,
    textAlign: 'center',
  },
  colTeam: {
    flex: 1,
  },
  colRecord: {
    width: 64,
    textAlign: 'right',
  },
  colPts: {
    width: 40,
    textAlign: 'right',
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  standingRowChampion: {
    backgroundColor: colors.brand.soft,
    paddingHorizontal: spacing.sm,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeChampion: {
    backgroundColor: colors.brand.primary,
  },
  teamCell: {
    flex: 1,
    gap: 2,
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  standingDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  pickerSheet: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  pickerRowPressed: {
    opacity: 0.8,
  },
  pickerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerBody: {
    flex: 1,
    gap: 2,
  },
});
