import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, Users } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import {
  BottomSheet,
  Button,
  EmptyState,
  IconBadge,
  Text,
  useToast,
} from '../ui';
import { TEAM_DETAILS, type OpenLeague } from '../mocks/teams';
import { useTeamChat } from '../features/team-chat-store';

interface ShareToTeamSheetProps {
  /** The league being shared, or null when the sheet is closed. */
  league: OpenLeague | null;
  onRequestClose: () => void;
}

/** Teams the current user is on (captain or member) — valid share targets. */
const MY_TEAMS = Object.values(TEAM_DETAILS).filter(
  (t) => t.membership === 'captain' || t.membership === 'member',
);

/**
 * Bottom sheet for sharing a league into one or more of the player's team
 * chats. Posts a `league_share` card (the same card the chat renders for
 * captain shares) to each selected team's chat via the team-chat store.
 */
export function ShareToTeamSheet({ league, onRequestClose }: ShareToTeamSheetProps) {
  const toast = useToast();
  const postCard = useTeamChat((s) => s.postCard);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (league) setSelected(new Set());
  }, [league]);

  const toggle = (teamId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });

  const count = selected.size;
  const shareLabel = useMemo(() => {
    if (count === 0) return 'Select a team';
    return `Share to ${count} team${count === 1 ? '' : 's'}`;
  }, [count]);

  const handleShare = () => {
    if (!league || count === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    selected.forEach((teamId) => {
      postCard(
        `chat-${teamId}`,
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
    });
    const names = [...selected]
      .map((id) => TEAM_DETAILS[id]?.name)
      .filter(Boolean)
      .join(', ');
    onRequestClose();
    toast.show({
      variant: 'success',
      title: `Shared ${league.name}`,
      description: `Posted to ${names}.`,
    });
  };

  return (
    <BottomSheet
      visible={!!league}
      onRequestClose={onRequestClose}
      title={league ? `Share ${league.name}` : 'Share league'}
      snapPoints={['66%']}
    >
      <View style={styles.body}>
        <Text variant="bodySm" color={colors.text.secondary}>
          Post this league as a card in your team chats so your squad can weigh
          in and register together.
        </Text>

        {MY_TEAMS.length === 0 ? (
          <EmptyState
            icon={<Users size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title="No teams yet"
            description="Join or create a team to share leagues with your squad."
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {MY_TEAMS.map((team) => {
              const Icon = team.Icon;
              const checked = selected.has(team.id);
              return (
                <Pressable
                  key={team.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  accessibilityLabel={team.name}
                  onPress={() => toggle(team.id)}
                  style={({ pressed }) => [
                    styles.row,
                    checked ? styles.rowSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <IconBadge size={40}>
                    <Icon size={18} color={colors.brand.primary} strokeWidth={2.25} />
                  </IconBadge>
                  <View style={styles.rowBody}>
                    <Text variant="button" color={colors.text.primary}>
                      {team.name}
                    </Text>
                    <Text variant="caption" color={colors.text.secondary}>
                      {team.sport} · {team.roster.length} players
                      {team.membership === 'captain' ? ' · You captain' : ''}
                    </Text>
                  </View>
                  <View style={[styles.check, checked ? styles.checkOn : null]}>
                    {checked ? (
                      <Check size={14} color={colors.text.inverse} strokeWidth={3} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.actions}>
          <Button
            label="Cancel"
            variant="ghost"
            fullWidth
            onPress={onRequestClose}
          />
          <Button
            label={shareLabel}
            variant="gradient"
            fullWidth
            disabled={count === 0}
            onPress={handleShare}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.lg,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    minHeight: 56,
  },
  rowSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
