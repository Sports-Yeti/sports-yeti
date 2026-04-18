import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  CalendarClock,
  Flag,
  MapPin,
  Pencil,
} from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Modal, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { GAMES, STATUS_LABEL, type GameStatus } from '../../mocks/games';
import { facilityById } from '../../mocks/facilities';
import { teamById } from '../../mocks/teams';
import { peopleByKind } from '../../mocks/people';
import { formatDate, formatTime } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE: Record<GameStatus, 'live' | 'success' | 'warning' | 'brand' | 'neutral'> = {
  live: 'live',
  scheduled: 'brand',
  completed: 'success',
  cancelled: 'neutral',
  postponed: 'warning',
};

export function GameDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const game = GAMES.find((g) => g.id === route.params.id);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!game) {
    return (
      <PageScroll>
        <PageHeader
          title="Game not found"
          crumbs={[{ label: 'Schedule', route: 'Schedule' }, { label: '—' }]}
          onNavigate={(r) => navigation.navigate(r)}
        />
        <EmptyState
          title="Game not found"
          description="It may have been cancelled or the link is stale."
          primaryAction={{ label: 'Back to schedule', onPress: () => navigation.navigate('Schedule') }}
        />
      </PageScroll>
    );
  }

  const home = teamById(game.homeTeamId);
  const away = teamById(game.awayTeamId);
  const facility = facilityById(game.facilityId);
  const referee = peopleByKind('referee')[0];

  return (
    <PageScroll>
      <PageHeader
        title={`${game.homeTeamName} vs ${game.awayTeamName}`}
        subtitle={`${game.leagueName} · ${formatDate(game.startsAtIso, { weekday: 'long', month: 'long', day: 'numeric' })} · ${formatTime(game.startsAtIso)}`}
        crumbs={[
          { label: 'Schedule', route: 'Schedule' },
          { label: 'Game' },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        meta={`${game.facilityName} · ${game.spaceName}`}
        trailing={
          <>
            <Tag size="md" tone={STATUS_TONE[game.status]} leadingDot label={STATUS_LABEL[game.status]} />
            <Button
              label="Edit"
              variant="ghost"
              size="sm"
              leadingIcon={<Pencil size={14} color={colors.brand.primary} strokeWidth={2.25} />}
              onPress={() => toast.show({ variant: 'info', title: 'Game editor coming soon' })}
            />
            <Button
              label="Cancel game"
              variant="destructive"
              size="sm"
              onPress={() => setConfirmCancel(true)}
            />
          </>
        }
      />

      <View style={styles.scoreCard}>
        <View style={styles.team}>
          <Text variant="h2" color={colors.text.primary}>
            {game.homeAbbreviation}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            HOME
          </Text>
          <Text variant="display" color={colors.text.primary}>
            {game.homeScore ?? '—'}
          </Text>
          <Text variant="bodySm" color={colors.text.secondary} align="center">
            {game.homeTeamName}
          </Text>
          {home ? (
            <Button
              label="Open team"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('TeamDetail', { id: home.id })}
            />
          ) : null}
        </View>
        <View style={styles.divider} />
        <View style={styles.team}>
          <Text variant="h2" color={colors.text.primary}>
            {game.awayAbbreviation}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            AWAY
          </Text>
          <Text variant="display" color={colors.text.primary}>
            {game.awayScore ?? '—'}
          </Text>
          <Text variant="bodySm" color={colors.text.secondary} align="center">
            {game.awayTeamName}
          </Text>
          {away ? (
            <Button
              label="Open team"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('TeamDetail', { id: away.id })}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.twoCol}>
        <Card style={styles.col}>
          <Text variant="h3" color={colors.text.primary}>
            Logistics
          </Text>
          <View style={styles.metaRow}>
            <CalendarClock size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary}>
              {formatDate(game.startsAtIso, { weekday: 'long', month: 'short', day: 'numeric' })} · {formatTime(game.startsAtIso)} – {formatTime(game.endsAtIso)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary}>
              {facility?.name} · {game.spaceName}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Flag size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.primary}>
              {referee ? `Ref · ${referee.name}` : 'No referee assigned yet'}
            </Text>
          </View>
        </Card>

        <Card style={styles.col}>
          <Text variant="h3" color={colors.text.primary}>
            Match notes
          </Text>
          <Text variant="bodySm" color={colors.text.muted}>
            Add internal notes (weather, late starts, missing players). These are visible to admins
            only and surface on the post-match summary.
          </Text>
        </Card>
      </View>

      <Modal
        visible={confirmCancel}
        onRequestClose={() => setConfirmCancel(false)}
        variant="destructive"
        title={`Cancel ${game.homeTeamName} vs ${game.awayTeamName}?`}
        description="Both captains and the assigned referee receive a notification. Refunds, if any, are processed in Payments."
        primaryAction={{
          label: 'Cancel game',
          onPress: () => {
            setConfirmCancel(false);
            toast.show({ variant: 'info', title: 'Game cancelled' });
            navigation.navigate('Schedule');
          },
        }}
        secondaryAction={{
          label: 'Keep scheduled',
          onPress: () => setConfirmCancel(false),
        }}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    borderRadius: 14,
    paddingVertical: spacing.xl,
  },
  team: {
    flex: 1,
    alignItems: 'center',
    gap: spacing['2xs'],
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border.soft,
    marginVertical: spacing.lg,
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  col: {
    flex: 1,
    minWidth: 320,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
