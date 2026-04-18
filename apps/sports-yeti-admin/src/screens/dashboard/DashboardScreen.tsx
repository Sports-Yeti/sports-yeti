import React from 'react';
import { type WebPressableState } from '../../lib/pressable';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AlertTriangle,
  CalendarPlus,
  ClipboardList,
  CreditCard,
  Goal,
  Megaphone,
  Plus,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, IconBadge, Tag, Text } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import { CURRENT_ADMIN, CURRENT_ORG } from '../../mocks/org';
import { TEAMS, pendingTeams } from '../../mocks/teams';
import { LEAGUES } from '../../mocks/leagues';
import { peopleByKind } from '../../mocks/people';
import {
  liveGames,
  upcomingGames,
} from '../../mocks/games';
import { pendingBookings } from '../../mocks/bookings';
import { financeSummary, PAYMENTS } from '../../mocks/payments';
import {
  DASHBOARD_ALERTS,
  recentAudit,
  type DashboardAlert,
} from '../../mocks/insights';
import { formatCurrency, formatRelative, formatTime } from '../../lib/format';

const ALERT_TONE_COLOR = {
  warning: colors.status.warning,
  live: colors.status.live,
  info: colors.brand.primary,
} as const;

interface NavParam { id?: string }

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: NavParam) => void;
}

export function DashboardScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;

  const players = peopleByKind('player');
  const referees = peopleByKind('referee');
  const finance = financeSummary();
  const upcoming = upcomingGames(4);
  const live = liveGames();
  const auditEvents = recentAudit(6);
  const pending = pendingTeams();
  const pendingBks = pendingBookings();
  const failedPayments = PAYMENTS.filter((p) => p.status === 'failed');

  return (
    <PageScroll>
      <PageHeader
        title={`${greeting()}, ${CURRENT_ADMIN.name.split(' ')[0]}`}
        subtitle={`${CURRENT_ORG.name} · season runs through ${formatDateMonth(
          CURRENT_ORG.seasonEndIso,
        )}`}
        meta={`Updated ${formatRelative(new Date().toISOString())}`}
        trailing={
          <>
            <Button
              label="Send announcement"
              variant="ghost"
              size="sm"
              leadingIcon={
                <Megaphone size={14} color={colors.brand.primary} strokeWidth={2.25} />
              }
              onPress={() => navigation.navigate('News')}
            />
            <Button
              label="Create league"
              variant="solid"
              size="sm"
              leadingIcon={
                <Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />
              }
              onPress={() => navigation.navigate('Leagues')}
            />
          </>
        }
      />

      {DASHBOARD_ALERTS.length > 0 ? (
        <View style={styles.alertList}>
          {DASHBOARD_ALERTS.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAction={() =>
                navigation.navigate(alert.cta.route as AdminRouteName)
              }
            />
          ))}
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <StatCard
          label="Net revenue · 30d"
          value={formatCurrency(finance.netCents)}
          changePct={12.4}
          helper="vs. previous 30 days"
          tone="brand"
          icon={<Wallet size={14} color={colors.brand.deep} strokeWidth={2.25} />}
          onPress={() => navigation.navigate('Finance')}
        />
        <StatCard
          label="Active players"
          value={String(players.length)}
          changePct={8.6}
          helper="across leagues"
          tone="success"
          icon={<Goal size={14} color={colors.status.success} strokeWidth={2.25} />}
          onPress={() => navigation.navigate('Players')}
        />
        <StatCard
          label="Pending decisions"
          value={String(pending.length + pendingBks.length + failedPayments.length)}
          helper={`${pending.length} teams · ${pendingBks.length} bookings · ${failedPayments.length} payments`}
          tone="warning"
          icon={
            <AlertTriangle
              size={14}
              color={colors.status.warning}
              strokeWidth={2.25}
            />
          }
          onPress={() => navigation.navigate('Teams')}
        />
        <StatCard
          label="Live games"
          value={String(live.length)}
          helper={`${upcoming.length} scheduled today`}
          tone="live"
          icon={
            <Trophy size={14} color={colors.status.live} strokeWidth={2.25} />
          }
          onPress={() => navigation.navigate('Schedule')}
        />
      </View>

      <View style={styles.twoCol}>
        <Card style={styles.col}>
          <View style={styles.cardHead}>
            <Text variant="h3" color={colors.text.primary}>
              Upcoming games
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Schedule')}
              accessibilityRole="link"
              accessibilityLabel="Open schedule"
              hitSlop={4}
            >
              <Text variant="button" color={colors.brand.primary}>
                Open schedule
              </Text>
            </Pressable>
          </View>
          {upcoming.length === 0 ? (
            <Text variant="bodySm" color={colors.text.muted}>
              No games on the next few days.
            </Text>
          ) : (
            upcoming.map((game) => (
              <Pressable
                key={game.id}
                onPress={() =>
                  navigation.navigate('GameDetail', { id: game.id })
                }
                accessibilityRole="button"
                accessibilityLabel={`${game.homeTeamName} vs ${game.awayTeamName}`}
                style={({ hovered }: WebPressableState) => [
                  styles.gameRow,
                  hovered ? styles.rowHover : null,
                ]}
              >
                <View style={styles.gameTime}>
                  <Text variant="caption" color={colors.text.secondary}>
                    {formatDateMonth(game.startsAtIso)}
                  </Text>
                  <Text variant="h4" color={colors.text.primary}>
                    {formatTime(game.startsAtIso)}
                  </Text>
                </View>
                <View style={styles.gameBody}>
                  <Text variant="bodySm" color={colors.text.primary}>
                    {game.homeTeamName} vs {game.awayTeamName}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {game.facilityName} · {game.spaceName}
                  </Text>
                </View>
                <Tag
                  tone={
                    game.status === 'live'
                      ? 'live'
                      : game.status === 'cancelled'
                      ? 'neutral'
                      : 'brand'
                  }
                  size="sm"
                  label={game.leagueName}
                />
              </Pressable>
            ))
          )}
        </Card>

        <Card style={styles.col}>
          <View style={styles.cardHead}>
            <Text variant="h3" color={colors.text.primary}>
              Quick actions
            </Text>
          </View>
          <View style={styles.actionsGrid}>
            <ActionTile
              icon={
                <CalendarPlus
                  size={16}
                  color={colors.brand.deep}
                  strokeWidth={2.25}
                />
              }
              label="New game"
              onPress={() => navigation.navigate('Schedule')}
            />
            <ActionTile
              icon={
                <CreditCard
                  size={16}
                  color={colors.brand.deep}
                  strokeWidth={2.25}
                />
              }
              label="Record payment"
              onPress={() => navigation.navigate('Payments')}
            />
            <ActionTile
              icon={
                <Users
                  size={16}
                  color={colors.brand.deep}
                  strokeWidth={2.25}
                />
              }
              label="Approve teams"
              onPress={() => navigation.navigate('Teams')}
            />
            <ActionTile
              icon={
                <ClipboardList
                  size={16}
                  color={colors.brand.deep}
                  strokeWidth={2.25}
                />
              }
              label="Open booking calendar"
              onPress={() => navigation.navigate('Bookings')}
            />
            <ActionTile
              icon={
                <Megaphone
                  size={16}
                  color={colors.brand.deep}
                  strokeWidth={2.25}
                />
              }
              label="Send announcement"
              onPress={() => navigation.navigate('News')}
            />
          </View>
        </Card>
      </View>

      <View style={styles.twoCol}>
        <Card style={styles.col}>
          <View style={styles.cardHead}>
            <Text variant="h3" color={colors.text.primary}>
              Recent activity
            </Text>
            <Pressable
              onPress={() => navigation.navigate('AuditLog')}
              accessibilityRole="link"
              accessibilityLabel="Open audit log"
              hitSlop={4}
            >
              <Text variant="button" color={colors.brand.primary}>
                Full audit log
              </Text>
            </Pressable>
          </View>
          <View style={styles.activityList}>
            {auditEvents.map((event) => (
              <View key={event.id} style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <IconBadge size={28} tone="soft">
                    <Trophy
                      size={12}
                      color={colors.brand.primary}
                      strokeWidth={2.25}
                    />
                  </IconBadge>
                </View>
                <View style={styles.activityBody}>
                  <Text variant="bodySm" color={colors.text.primary}>
                    {event.description}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    by {event.causerName} · {formatRelative(event.occurredAtIso)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.col}>
          <View style={styles.cardHead}>
            <Text variant="h3" color={colors.text.primary}>
              Roster
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Players')}
              accessibilityRole="link"
              hitSlop={4}
            >
              <Text variant="button" color={colors.brand.primary}>
                Manage people
              </Text>
            </Pressable>
          </View>
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text variant="display" color={colors.text.primary} style={styles.miniValue}>
                {LEAGUES.filter((l) => l.status === 'published').length}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                Active leagues
              </Text>
            </View>
            <View style={styles.miniStat}>
              <Text variant="display" color={colors.text.primary} style={styles.miniValue}>
                {TEAMS.filter((t) => t.status === 'approved').length}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                Approved teams
              </Text>
            </View>
            <View style={styles.miniStat}>
              <Text variant="display" color={colors.text.primary} style={styles.miniValue}>
                {referees.length}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                Referees
              </Text>
            </View>
          </View>
          <View style={styles.payoutRow}>
            <Text variant="bodySm" color={colors.text.secondary}>
              Next Stripe payout
            </Text>
            <Text variant="h4" color={colors.text.primary}>
              {formatCurrency(finance.netCents)} · {formatDateMonth(finance.payoutDateIso)}
            </Text>
          </View>
        </Card>
      </View>
    </PageScroll>
  );
}

function AlertCard({
  alert,
  onAction,
}: {
  alert: DashboardAlert;
  onAction: () => void;
}) {
  const tint = ALERT_TONE_COLOR[alert.tone];
  return (
    <View
      style={[styles.alert, { borderLeftColor: tint }]}
      accessibilityRole="alert"
    >
      <AlertTriangle size={16} color={tint} strokeWidth={2.25} />
      <View style={styles.alertBody}>
        <Text variant="h4" color={colors.text.primary}>
          {alert.title}
        </Text>
        <Text variant="bodySm" color={colors.text.secondary}>
          {alert.body}
        </Text>
      </View>
      <Button
        label={alert.cta.label}
        variant="ghost"
        size="sm"
        onPress={onAction}
      />
    </View>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ hovered }: WebPressableState) => [
        styles.action,
        hovered ? styles.actionHover : null,
      ]}
    >
      {icon}
      <Text variant="bodySm" color={colors.text.primary}>
        {label}
      </Text>
    </Pressable>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDateMonth(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  alertList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  alert: {
    flex: 1,
    minWidth: 320,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    borderLeftWidth: 4,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.soft,
  },
  alertBody: {
    flex: 1,
    gap: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  col: {
    flex: 1,
    minWidth: 320,
    gap: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  rowHover: {
    backgroundColor: colors.surface.bg,
  },
  gameTime: {
    width: 64,
    gap: 2,
  },
  gameBody: {
    flex: 1,
    gap: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    backgroundColor: colors.surface.card,
  },
  actionHover: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  activityList: {
    gap: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  activityIcon: {
    paddingTop: 2,
  },
  activityBody: {
    flex: 1,
    gap: 2,
  },
  miniStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  miniStat: {
    gap: 2,
    flex: 1,
  },
  miniValue: {
    fontSize: 28,
    lineHeight: 32,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
});
