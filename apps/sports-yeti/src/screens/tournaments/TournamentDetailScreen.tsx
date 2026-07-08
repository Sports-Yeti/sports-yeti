import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  MapPin,
  Share2,
  Swords,
  Trophy,
  Users,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { CAPTAIN_OF_TEAMS, type TeamDetail } from '../../mocks/teams';
import { tournamentById } from '../../mocks/tournaments';
import { formatCurrency } from '../../lib/format';
import { useTeamChat } from '../../features/team-chat-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TournamentDetails'>;
type Route = RouteProp<RootStackParamList, 'TournamentDetails'>;

export function TournamentDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const tournament = tournamentById(route.params.id);
  const [registerOpen, setRegisterOpen] = useState(false);
  const requestRegistration = useTeamChat((s) => s.requestRegistration);
  const registrationsByTeam = useTeamChat((s) => s.registrationsByTeam);
  const captainTeams = CAPTAIN_OF_TEAMS;

  if (!tournament) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Tournament unavailable"
          description="We couldn't load this tournament. It may have wrapped or the link is stale."
          primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const Icon = tournament.Icon;
  const spotsLeft = Math.max(0, tournament.maxTeams - tournament.registeredTeams);
  const isFull = spotsLeft === 0 || tournament.status === 'closed';

  const registerTeam = (team: TeamDetail) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRegisterOpen(false);
    requestRegistration({
      teamId: team.id,
      chatId: `chat-${team.id}`,
      leagueId: tournament.id,
      leagueName: tournament.name,
      teamName: team.name,
    });
    toast.show({
      variant: 'success',
      title: `Registration sent for ${team.name}`,
      description: `${tournament.name} is reviewing your entry. Your squad has been notified in chat.`,
    });
    navigation.navigate('Chat', { chatId: `chat-${team.id}`, title: team.name });
  };

  const handleRegisterPress = () => {
    Haptics.selectionAsync();
    if (captainTeams.length === 0) {
      toast.show({
        variant: 'info',
        title: 'Captain a team first',
        description: 'You need a team you captain before you can register for a tournament.',
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
            accessibilityLabel="Share tournament"
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
            <Tag tone="info" leadingDot label={tournament.sport} />
            <Tag tone="brand" size="sm" label={tournament.formatLabel} />
            {isFull ? (
              <Tag tone="warning" size="sm" label="Registration closed" />
            ) : null}
          </View>
          <View style={styles.heroRow}>
            <IconBadge size={64} tone="brand">
              <Icon size={28} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.heroText}>
              <Text variant="h1" color={colors.text.primary}>
                {tournament.name}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {tournament.city}
              </Text>
            </View>
            <Text variant="h2" color={colors.brand.primary} align="right">
              {tournament.feeCents === 0 ? 'Free' : formatCurrency(tournament.feeCents)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            About the tournament
          </Text>
          <Text variant="body" color={colors.text.primary}>
            {tournament.description}
          </Text>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <CalendarDays size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {tournament.dateLabel}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {tournament.registrationCloses}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <MapPin size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {tournament.venueName}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {tournament.city}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Users size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {spotsLeft === 0
                  ? 'Registration full'
                  : `${spotsLeft} of ${tournament.maxTeams} team spots open`}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {tournament.registeredTeams} of {tournament.maxTeams} teams registered
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <CircleDollarSign size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {tournament.feeCents === 0
                  ? 'Free'
                  : `${formatCurrency(tournament.feeCents)} per team`}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                Entry fee · split across the roster
              </Text>
            </View>
          </View>
          {tournament.prizeLabel ? (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Trophy size={18} color={colors.brand.primary} strokeWidth={2.25} />
                <View style={styles.detailBody}>
                  <Text variant="button" color={colors.text.primary}>
                    {tournament.prizeLabel}
                  </Text>
                  <Text variant="bodySm" color={colors.text.secondary}>
                    Stakes
                  </Text>
                </View>
              </View>
            </>
          ) : null}
        </Card>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Hosted by
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${tournament.hostLeagueName}`}
            accessibilityHint="Opens the hosting league"
            onPress={() =>
              navigation.navigate('LeagueDetails', {
                leagueId: tournament.hostLeagueId,
              })
            }
          >
            <Card style={styles.hostCard}>
              <View style={styles.hostIcon}>
                <Trophy size={22} color={colors.brand.deep} strokeWidth={2.25} />
              </View>
              <View style={styles.hostBody}>
                <Text variant="h3" color={colors.text.primary}>
                  {tournament.hostLeagueName}
                </Text>
                <Text variant="caption" color={colors.text.secondary}>
                  View the league running this tournament
                </Text>
              </View>
              <ChevronRight size={18} color={colors.text.muted} strokeWidth={2.25} />
            </Card>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={isFull ? 'Registration closed' : 'Register a team'}
          variant="gradient"
          size="lg"
          fullWidth
          disabled={isFull}
          leadingIcon={
            <Swords size={16} color={colors.text.inverse} strokeWidth={2.5} />
          }
          onPress={handleRegisterPress}
        />
      </View>

      <BottomSheet
        visible={registerOpen}
        onRequestClose={() => setRegisterOpen(false)}
        title={`Register for ${tournament.name}`}
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
                accessibilityLabel={`Register ${team.name} for ${tournament.name}`}
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
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  hostIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostBody: {
    flex: 1,
    gap: 2,
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
    opacity: 0.85,
  },
  pickerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerBody: {
    flex: 1,
    gap: 2,
  },
});
